import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ai } from '@/lib/gemini';
import { SupportedLanguageCode } from '@/lib/languages';

export async function POST(req: NextRequest) {
  try {
    const {
      text,
      language = 'am',
      voice,
    }: {
      text: string;
      language: SupportedLanguageCode;
      voice?: string;
    } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required for TTS' }, { status: 400 });
    }

    // Clean text of markdown formatting symbols that sound awkward in TTS
    const cleanText = text
      .replace(/[*#_`~\[\]\(\)]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000); // Sensible speaking length limit

    // 1. Primary: Addis Voices 2 Generation API (Official Contract)
    // POST https://api.addisassistant.com/api/v1/voice/generations
    // Header: x-api-key: $ADDIS_API_KEY
    // JSON body: text, voice_id, language, client_request_id, speed, output_format
    const addisApiKey = process.env.ADDIS_API_KEY;
    const addisTtsEndpoint =
      process.env.ADDIS_TTS_ENDPOINT || 'https://api.addisassistant.com/api/v1/voice/generations';

    if (addisApiKey && addisApiKey.trim().length > 0) {
      try {
        const addisVoiceMap: Record<SupportedLanguageCode, string> = {
          am: 'am-tewodros',
          om: 'om-bikila',
          ti: 'ti-berhane',
          en: 'am-tewodros',
        };

        const chosenVoice =
          voice ||
          process.env.ADDIS_VOICE_ID ||
          addisVoiceMap[language] ||
          'am-tewodros';
        const clientRequestId = crypto.randomUUID();

        // Speed: 1.15 provides a natural, conversational, fluent pace for Ethiopian languages
        const addisRes = await fetch(addisTtsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': addisApiKey.trim(),
          },
          body: JSON.stringify({
            text: cleanText,
            voice_id: chosenVoice,
            language: language,
            client_request_id: clientRequestId,
            speed: 1.15,
            output_format: 'mp3_44100',
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (addisRes.ok) {
          const data = await addisRes.json();
          if (data?.data) {
            let rawAudio = data.data.audio || '';
            if (rawAudio.startsWith('data:')) {
              const commaIdx = rawAudio.indexOf(',');
              rawAudio = rawAudio.slice(commaIdx + 1);
            }

            return NextResponse.json({
              audioBase64: rawAudio,
              mimeType: data.data.mime_type || 'audio/mpeg',
              audioUrl: data.data.audio_url || null,
              provider: 'Addis Voices 2 (Conversational Pace)',
              voiceName: data.data.voice_name || chosenVoice,
              durationSeconds: data.data.duration_seconds,
            });
          }
        } else {
          const errBody = await addisRes.text();
          console.warn(`Addis TTS returned HTTP ${addisRes.status}:`, errBody);
        }
      } catch (addisError: any) {
        console.warn('Addis TTS generation call failed, falling back to Gemini TTS:', addisError?.message || addisError);
      }
    }

    // 2. Multimodal Fallback: Gemini 3.8 Flash TTS
    const voiceMap: Record<SupportedLanguageCode, string> = {
      am: 'Kore',
      om: 'Zephyr',
      ti: 'Fenrir',
      en: 'Kore',
    };
    const selectedVoice = voice || voiceMap[language] || 'Kore';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: 'Natural, lively, clear conversational Ethiopian real estate concierge',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const audioData =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (audioData) {
        return NextResponse.json({
          audioBase64: audioData,
          mimeType: 'audio/wav',
          provider: 'gemini-3.8-flash-tts',
          voiceName: selectedVoice,
        });
      }
    } catch (geminiError: any) {
      console.warn('gemini-3.8-flash-tts attempt encountered error, trying lite variant:', geminiError?.message);

      // Secondary fallback to gemini-3.8-flash-lite-tts
      const liteResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: cleanText }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const liteAudioData =
        liteResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (liteAudioData) {
        return NextResponse.json({
          audioBase64: liteAudioData,
          mimeType: 'audio/wav',
          provider: 'gemini-3.8-flash-lite-tts',
          voiceName: selectedVoice,
        });
      }
    }

    // 3. Client browser speech synthesis fallback
    return NextResponse.json({
      audioBase64: null,
      provider: 'client-speech-synthesis',
      fallbackText: cleanText,
      language,
    });
  } catch (error: any) {
    console.error('TTS API General Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Text-to-speech generation failed',
        provider: 'failed',
      },
      { status: 500 }
    );
  }
}

/**
 * Low-latency audio streaming endpoint.
 * Delivers un-framed MP3 frames directly from Addis Voices 2 stream
 * with Content-Type: audio/mpeg for instant progressive playback in browser <audio>.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const rawText = url.searchParams.get('text') || '';
  const language = (url.searchParams.get('language') as SupportedLanguageCode) || 'am';
  const voice =
    url.searchParams.get('voice') ||
    process.env.ADDIS_VOICE_ID ||
    'am-tewodros';

  if (!rawText.trim()) {
    return new Response('Text is required', { status: 400 });
  }

  const cleanText = rawText
    .replace(/[*#_`~\[\]\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000);

  const addisApiKey = process.env.ADDIS_API_KEY;
  if (addisApiKey && addisApiKey.trim().length > 0) {
    try {
      const clientRequestId = crypto.randomUUID();
      const addisStreamRes = await fetch(
        'https://api.addisassistant.com/api/v1/voice/generations/stream',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': addisApiKey.trim(),
          },
          body: JSON.stringify({
            text: cleanText,
            voice_id: voice,
            language: language,
            client_request_id: clientRequestId,
            speed: 1.15,
            output_format: 'mp3_44100',
          }),
          signal: AbortSignal.timeout(12000),
        }
      );

      if (addisStreamRes.ok && addisStreamRes.body) {
        // Strip 4-byte big-endian length prefix framing to emit pure MP3 stream
        let buffer = Buffer.alloc(0);
        const transformStream = new TransformStream({
          transform(chunk, controller) {
            buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
            while (buffer.length >= 4) {
              const frameLen = buffer.readUInt32BE(0);
              if (buffer.length >= 4 + frameLen) {
                const mp3Chunk = buffer.subarray(4, 4 + frameLen);
                controller.enqueue(new Uint8Array(mp3Chunk));
                buffer = buffer.subarray(4 + frameLen);
              } else {
                break;
              }
            }
          },
          flush(controller) {
            if (buffer.length > 4) {
              controller.enqueue(new Uint8Array(buffer.subarray(4)));
            }
          },
        });

        const cleanMp3Stream = addisStreamRes.body.pipeThrough(transformStream);

        return new Response(cleanMp3Stream, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            'X-Voice-ID': voice,
            'X-TTS-Mode': 'stream',
          },
        });
      }
    } catch (streamErr) {
      console.warn('Streaming TTS error, client should fallback:', streamErr);
    }
  }

  return new Response('Stream unavailable', { status: 503 });
}

