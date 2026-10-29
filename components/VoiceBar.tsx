'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Send, X, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';
import { SupportedLanguageCode, SUPPORTED_LANGUAGES } from '@/lib/languages';

interface VoiceBarProps {
  currentLanguage: SupportedLanguageCode;
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
  speakEnabled: boolean;
  onToggleSpeak: () => void;
  isSpeaking: boolean;
  onStopAudio: () => void;
  onAudioTranscribed?: (transcript: string) => void;
}

export default function VoiceBar({
  currentLanguage,
  onSendMessage,
  isProcessing,
  speakEnabled,
  onToggleSpeak,
  isSpeaking,
  onStopAudio,
}: VoiceBarProps) {
  const langConfig = SUPPORTED_LANGUAGES[currentLanguage];
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Audio recording references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isSubmittingAudioRef = useRef(false);

  const cleanupAudio = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Clean up all audio tracks and timers on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // Draw real microphone frequency waveform
  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!isRecording && !analyserRef.current) return;
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current?.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 3;
      const gap = 2;
      const totalBars = Math.floor(canvas.width / (barWidth + gap));
      const step = Math.floor(bufferLength / totalBars);

      for (let i = 0; i < totalBars; i++) {
        const value = dataArray[i * step] || 0;
        const percent = value / 255;
        const height = Math.max(4, percent * canvas.height * 0.9);
        const x = i * (barWidth + gap);
        const y = (canvas.height - height) / 2;

        // Gold gradient wave
        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, '#F59E0B');
        gradient.addColorStop(1, '#D4AF37');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 1.5);
        ctx.fill();
      }
    };

    render();
  };

  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    isSubmittingAudioRef.current = false;

    // Stop speaking if assistant is currently talking
    if (isSpeaking) {
      onStopAudio();
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording or permissions are blocked by iframe policy.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioStreamRef.current = stream;

      // Setup audio analyzer for waveform
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Select supported audio mimeType
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop audio tracks ONLY after MediaRecorder has completely flushed final frames
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        }

        if (isSubmittingAudioRef.current) {
          return;
        }
        isSubmittingAudioRef.current = true;

        const chunks = [...audioChunksRef.current];
        audioChunksRef.current = [];

        const audioBlob = new Blob(chunks, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        if (audioBlob.size > 800) {
          await handleSendAudio(audioBlob);
        } else {
          setMicError('Recording was too short to transcribe. Please speak clearly for at least 1-2 seconds.');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start duration counter
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Start visualizer animation
      drawWaveform();
    } catch (err: any) {
      console.warn('Microphone access notification:', err?.name || err?.message || err);
      let errorMsg = langConfig.ui.micPermissionError;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Microphone permission was denied. Please allow microphone access in your browser address bar or use text chat below.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No microphone device was detected on your computer.';
      } else if (typeof window !== 'undefined' && window.self !== window.top) {
        errorMsg = 'Microphone permission may be restricted by the frame. Please check permissions or use text chat below.';
      }
      setMicError(errorMsg);
      cleanupAudio();
      setIsRecording(false);
    }
  };

  const stopAndTranscribe = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const cancelRecording = () => {
    isSubmittingAudioRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    cleanupAudio();
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const handleSendAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    setMicError(null);

    try {
      // Convert blob to base64 for reliable transmission across all proxies and iframes
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const commaIndex = res.indexOf(',');
          resolve(commaIndex !== -1 ? res.slice(commaIndex + 1) : res);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const res = await fetch('/api/stt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Data,
          mimeType: blob.type || 'audio/webm',
          language: currentLanguage,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          res.ok
            ? 'Speech server returned unexpected response format.'
            : `Speech recognition service temporarily busy (${res.status}). Please try again or type below.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || `Speech recognition service returned ${res.status}.`);
      }

      const recognized = (data.transcript || '').trim();
      if (!recognized) {
        setMicError('No speech was detected in the recording. Please speak clearly into your microphone and try again.');
        return;
      }

      setInputText(recognized);
      // Automatically send recognized text into conversation
      await onSendMessage(recognized);
      setInputText('');
    } catch (err: any) {
      console.warn('STT request notice:', err?.message || err);
      setMicError(err.message || 'Speech recognition failed.');
    } finally {
      setIsTranscribing(false);
      cleanupAudio();
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const textToSend = inputText.trim();
    setInputText('');
    await onSendMessage(textToSend);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-[#0D1527] border-t border-amber-500/20 px-4 py-3 sm:py-4 shadow-2xl relative">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Error Notification */}
        {micError && (
          <div className="flex items-center justify-between text-xs bg-rose-950/80 border border-rose-500/40 text-rose-200 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{micError}</span>
            </div>
            <button
              onClick={() => setMicError(null)}
              className="text-rose-300 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Active Recording State UI */}
        {isRecording ? (
          <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-amber-500/40 rounded-xl p-3 sm:px-4">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-semibold text-amber-300 flex items-center gap-1.5">
                  <span>{langConfig.ui.recording}</span>
                  <span className="text-slate-400 font-mono text-xs tabular-nums">
                    [{formatSeconds(recordingSeconds)}]
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {langConfig.name} voice input active
                </span>
              </div>
            </div>

            {/* Live Audio Waveform Canvas */}
            <div className="flex-1 max-w-xs h-8 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={200}
                height={32}
                className="w-full h-8"
              />
            </div>

            {/* Recording Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={cancelRecording}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                {langConfig.ui.cancel}
              </button>
              <button
                type="button"
                onClick={stopAndTranscribe}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{langConfig.ui.send}</span>
              </button>
            </div>
          </div>
        ) : isTranscribing ? (
          <div className="flex items-center justify-center gap-3 bg-slate-900/90 border border-amber-500/30 rounded-xl p-3">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-xs sm:text-sm text-amber-200 font-medium">
              Transcribing {langConfig.name} voice with Addis / Gemini engine...
            </span>
          </div>
        ) : (
          /* Normal Text & Voice Input Form */
          <form onSubmit={handleTextSubmit} className="flex items-center gap-2 sm:gap-3">
            {/* Primary Voice Mic Button */}
            <button
              type="button"
              onClick={startRecording}
              disabled={isProcessing}
              title={langConfig.ui.recordPrompt}
              aria-label={langConfig.ui.recordPrompt}
              className={`p-3 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/25 active:scale-95'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Text Input Field */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={langConfig.ui.typePlaceholder}
                disabled={isProcessing}
                className="w-full bg-slate-900/90 text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm rounded-xl px-4 py-3 border border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400/70 transition-all"
              />
            </div>

            {/* Send Text Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              title={langConfig.ui.send}
              aria-label={langConfig.ui.send}
              className={`p-3 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                !inputText.trim() || isProcessing
                  ? 'bg-slate-800/80 text-slate-600 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>

            {/* Spoken Audio Response Toggle */}
            <button
              type="button"
              onClick={onToggleSpeak}
              title={speakEnabled ? langConfig.ui.speakEnabled : langConfig.ui.speakMuted}
              aria-label={speakEnabled ? langConfig.ui.speakEnabled : langConfig.ui.speakMuted}
              className={`p-2.5 sm:px-3 sm:py-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
                speakEnabled
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {speakEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-[11px]">Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span className="hidden md:inline text-[11px]">Muted</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Active Speaking Indicator Bar if currently playing audio */}
        {isSpeaking && (
          <div className="flex items-center justify-between text-xs bg-amber-950/40 border border-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-1 bg-amber-400 h-3 animate-pulse" />
                <span className="w-1 bg-amber-400 h-2 animate-pulse delay-75" />
                <span className="w-1 bg-amber-400 h-3 animate-pulse delay-150" />
              </div>
              <span>{langConfig.ui.speaking}</span>
            </div>
            <button
              onClick={onStopAudio}
              className="text-amber-300 hover:text-white underline text-[11px] font-medium"
            >
              {langConfig.ui.stopAudio}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
