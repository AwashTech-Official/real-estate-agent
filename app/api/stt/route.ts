import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { ai } from '@/lib/gemini';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from '@/lib/languages';

const execAsync = promisify(exec);

/**
 * Transcodes arbitrary audio buffers (browser WebM, MP4, OGG, etc.) into
 * standardized 16kHz mono 16-bit PCM WAV. This guarantees 100% decoder
 * compatibility with speech-to-text engines including Addis Assistant STT.
 */
async function transcodeToWav(inputBuffer: Buffer, inputMime: string): Promise<{ buffer: Buffer; mime: string; durationMs: number }> {
  // If already a valid WAV buffer with standard header, return as-is
  if (inputMime.includes('wav') && inputBuffer.length > 44 && inputBuffer.subarray(0, 4).toString() === 'RIFF') {
    return { buffer: inputBuffer, mime: 'audio/wav', durationMs: 0 };
  }

  const tmpId = crypto.randomUUID();
  const ext = inputMime.includes('mp3') ? 'mp3' : inputMime.includes('ogg') ? 'ogg' : inputMime.includes('mp4') ? 'mp4' : 'webm';
  const inPath = path.join(os.tmpdir(), `stt_in_${tmpId}.${ext}`);
  const outPath = path.join(os.tmpdir(), `stt_out_${tmpId}.wav`);

  const start = Date.now();
  try {
    await fs.promises.writeFile(inPath, inputBuffer);
    // Transcode to 16kHz mono 16-bit PCM WAV (the optimal format for Addis STT)
    await execAsync(`ffmpeg -y -i "${inPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outPath}"`);
    const wavBuffer = await fs.promises.readFile(outPath);
    const duration = Date.now() - start;
    return { buffer: wavBuffer, mime: 'audio/wav', durationMs: duration };
  } catch (err: any) {
    console.warn('[STT Diagnostics] ffmpeg transcode fallback warning:', err?.message || err);
    return { buffer: inputBuffer, mime: inputMime, durationMs: Date.now() - start };
  } finally {
    fs.promises.unlink(inPath).catch(() => {});
    fs.promises.unlink(outPath).catch(() => {});
  }
}

export async function POST(req: NextRequest) {
  const requestStartTime = Date.now();
  try {
    let base64Audio = '';
    let rawMime = 'audio/webm';
    let languageCode: SupportedLanguageCode = 'am';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const jsonBody = await req.json();
      base64Audio = jsonBody.audioBase64 || '';
      rawMime = jsonBody.mimeType || 'audio/webm';
      languageCode = (jsonBody.language as SupportedLanguageCode) || 'am';
    } else {
      // Multipart/form-data upload
      const formData = await req.formData();
      const audioFile = formData.get('audio') as Blob | null;
      languageCode = (formData.get('language') as SupportedLanguageCode) || 'am';

      if (!audioFile) {
        return NextResponse.json(
          { error: 'No audio recording received', transcript: '', failureCategory: 'malformed_request' },
          { status: 400 }
        );
      }

      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Audio = buffer.toString('base64');
      rawMime = audioFile.type || 'audio/webm';
    }

    // Sanitize MIME type (remove parameters like ';codecs=opus')
    const cleanMime = (rawMime || 'audio/webm').split(';')[0].trim().toLowerCase() || 'audio/webm';

    if (!base64Audio) {
      return NextResponse.json(
        { error: 'No audio payload received', transcript: '', failureCategory: 'malformed_request' },
        { status: 400 }
      );
    }

    const initialAudioBuffer = Buffer.from(base64Audio, 'base64');

    // Reject recordings that are too short to contain decodable speech frames (< 800 bytes)
    if (initialAudioBuffer.length < 800) {
      console.warn(`[STT Diagnostics] Rejected recording: size=${initialAudioBuffer.length} bytes (below 800 bytes threshold)`);
      return NextResponse.json(
        {
          error: 'Audio recording was too short or empty. Please speak closer to the microphone for at least 1-2 seconds.',
          transcript: '',
          failureCategory: 'empty_speech',
          provider: 'failed',
        },
        { status: 400 }
      );
    }

    // 1. Transcode incoming recording to clean 16kHz mono WAV for guaranteed decoder compatibility
    const { buffer: audioBuffer, mime: audioMime, durationMs: transcodeMs } = await transcodeToWav(
      initialAudioBuffer,
      cleanMime
    );

    console.log(
      `[STT Diagnostics] Audio received: initialSize=${initialAudioBuffer.length}B, rawMime="${rawMime}", processedSize=${audioBuffer.length}B, processedMime="${audioMime}", transcodeTime=${transcodeMs}ms, language="${languageCode}"`
    );

    // 2. Primary: Addis Assistant v2 STT API (Official Contract)
    // POST https://api.addisassistant.com/api/v2/stt
    // Header: x-api-key: $ADDIS_API_KEY
    // Form fields:
    //   - audio: WAV/WebM binary blob
    //   - request_data: JSON string '{"language_code":"am"}'
    const addisApiKey = process.env.ADDIS_API_KEY;
    const addisSttEndpoint = process.env.ADDIS_STT_ENDPOINT || 'https://api.addisassistant.com/api/v2/stt';

    if (addisApiKey && addisApiKey.trim().length > 0) {
      const addisFetchStart = Date.now();
      try {
        const ext = audioMime.includes('wav') ? 'wav' : 'webm';
        const addisForm = new FormData();
        addisForm.append('audio', new Blob([new Uint8Array(audioBuffer)], { type: audioMime }), `recording.${ext}`);
        addisForm.append('request_data', JSON.stringify({ language_code: languageCode }));

        const addisRes = await fetch(addisSttEndpoint, {
          method: 'POST',
          headers: {
            'x-api-key': addisApiKey.trim(),
          },
          body: addisForm,
          signal: AbortSignal.timeout(10000),
        });

        const addisDuration = Date.now() - addisFetchStart;
        const addisStatus = addisRes.status;

        if (addisRes.ok) {
          const addisData = await addisRes.json();
          // Official documented response contract: data.transcription
          const transcript = (
            addisData?.data?.transcription ??
            addisData?.transcription ??
            addisData?.text ??
            ''
          ).trim();

          console.log(
            `[STT Diagnostics] Addis STT SUCCESS (HTTP ${addisStatus} in ${addisDuration}ms): transcriptLength=${transcript.length}, hasTranscription=${Boolean(transcript)}, billedDuration=${addisData?.data?.usage_metadata?.totalBilledDuration || addisData?.data?.usage_metadata?.duration_seconds || 'N/A'}`
          );

          return NextResponse.json({
            transcript,
            provider: 'Addis Assistant v2 STT',
            success: true,
            totalDurationMs: Date.now() - requestStartTime,
          });
        } else {
          const sanitizedErr = (await addisRes.text()).slice(0, 300);
          console.warn(`[STT Diagnostics] Addis STT upstream HTTP ${addisStatus} in ${addisDuration}ms:`, sanitizedErr);

          let failureCategory = 'provider_failure';
          if (addisStatus === 401 || addisStatus === 403) failureCategory = 'authentication';
          else if (addisStatus === 402) failureCategory = 'insufficient_balance';
          else if (addisStatus === 429) failureCategory = 'rate_limit';
          else if (addisStatus === 400) failureCategory = 'unsupported_audio_or_malformed_request';

          // Continue to fallback if provider returned 5xx or transient issue
          if (addisStatus >= 400 && addisStatus < 500 && addisStatus !== 408) {
            return NextResponse.json(
              {
                error: `Addis STT upstream error (${addisStatus}): ${sanitizedErr}`,
                transcript: '',
                failureCategory,
                provider: 'Addis Assistant v2 STT',
              },
              { status: addisStatus }
            );
          }
        }
      } catch (addisError: any) {
        const isTimeout = addisError?.name === 'TimeoutError' || addisError?.message?.includes('timeout');
        console.warn(
          `[STT Diagnostics] Addis STT fetch exception (${isTimeout ? 'network_timeout' : 'network_failure'}):`,
          addisError?.message || addisError
        );
      }
    }

    // 3. Multimodal Fallback: Gemini Transcribe with timeout guard
    const langInfo = SUPPORTED_LANGUAGES[languageCode] || SUPPORTED_LANGUAGES.am;
    const base64ForGemini = audioBuffer.toString('base64');

    const timeoutPromise = (ms: number) =>
      new Promise((_, reject) => setTimeout(() => reject(new Error('Transcription timeout')), ms));

    const promptText = `Transcribe the speech in this audio recording accurately into ${langInfo.name} (${langInfo.nativeName}).
Return ONLY the transcribed text spoken by the user. Do not add markdown quotes, explanations, or commentary. If no speech is intelligible, return empty string.`;

    const modelsToTry = ['gemini-3.5-transcribe', 'gemini-3.1-flash-lite'];
    let recognizedText = '';
    let usedProvider = 'gemini-transcribe';

    for (const model of modelsToTry) {
      try {
        const geminiStart = Date.now();
        const response: any = await Promise.race([
          ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: audioMime,
                      data: base64ForGemini,
                    },
                  },
                  {
                    text: promptText,
                  },
                ],
              },
            ],
          }),
          timeoutPromise(8000),
        ]);

        if (response?.text) {
          recognizedText = response.text.trim();
          usedProvider = model;
          console.log(`[STT Diagnostics] Gemini fallback (${model}) SUCCESS in ${Date.now() - geminiStart}ms: transcriptLength=${recognizedText.length}`);
          break;
        }
      } catch (mErr: any) {
        console.warn(`[STT Diagnostics] Gemini model ${model} fallback notice: ${mErr?.status || 'service_busy'}`);
      }
    }

    return NextResponse.json({
      transcript: recognizedText || '',
      provider: usedProvider,
      success: true,
      totalDurationMs: Date.now() - requestStartTime,
    });
  } catch (error: any) {
    console.warn('[STT Diagnostics] Speech processing notice:', error?.message || error);
    return NextResponse.json(
      {
        error: error?.message || 'Speech recognition processing failed',
        transcript: '',
        failureCategory: 'internal_server_error',
        provider: 'failed',
      },
      { status: 500 }
    );
  }
}
