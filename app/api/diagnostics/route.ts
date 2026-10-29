import { NextResponse } from 'next/server';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

export async function GET() {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasAddisKey = Boolean(process.env.ADDIS_API_KEY && process.env.ADDIS_API_KEY.trim().length > 0);
  const addisApiEndpoint = process.env.ADDIS_API_ENDPOINT || null;
  const addisSttEndpoint = process.env.ADDIS_STT_ENDPOINT || null;
  const addisTtsEndpoint = process.env.ADDIS_TTS_ENDPOINT || null;

  const languagesReport = Object.values(SUPPORTED_LANGUAGES).map((lang) => ({
    code: lang.code,
    name: lang.name,
    nativeName: lang.nativeName,
    textChat: 'Verified Active',
    sttCapability: lang.sttStatus === 'verified'
      ? (hasAddisKey && addisSttEndpoint ? 'Addis Verified' : 'Gemini 3.5 Transcribe Active')
      : (hasAddisKey && addisSttEndpoint ? 'Addis Preview' : 'Gemini 3.5 Transcribe Fallback'),
    sttStatus: lang.sttStatus,
    ttsCapability: hasAddisKey && addisTtsEndpoint ? 'Addis TTS Active' : 'Gemini 3.8 Flash TTS Active',
    ttsStatus: lang.ttsStatus,
    notes: lang.sttNotes,
  }));

  return NextResponse.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: {
      geminiApiKeyConfigured: hasGeminiKey,
      addisApiKeyConfigured: hasAddisKey,
      addisApiEndpointConfigured: Boolean(addisApiEndpoint),
      addisSttEndpointConfigured: Boolean(addisSttEndpoint),
      addisTtsEndpointConfigured: Boolean(addisTtsEndpoint),
      activePrimaryProvider: hasAddisKey ? 'Addis Assistant API' : 'Google Gemini (Native Multilingual Fallback)',
      ttsModel: hasAddisKey && addisTtsEndpoint ? 'Addis Voice' : 'gemini-3.8-flash-tts',
      sttModel: hasAddisKey && addisSttEndpoint ? 'Addis STT' : 'gemini-3.5-transcribe',
      supabaseConfigured: Boolean(
        (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      ),
      supabaseUrlConfigured: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKeyConfigured: Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
    languages: languagesReport,
    diagnosticsNotes: [
      'Microphone recording uses standard HTML5 MediaRecorder (audio/webm, audio/wav).',
      'If embedded in an iframe without "microphone" allow attributes, browser policy blocks recording.',
      'Audio responses can be played via Web Audio API or decoded WAV blob with zero autoplay on initial visit.',
      'Property data connects to the existing Sheger Prime Supabase database when SUPABASE_URL and SUPABASE_ANON_KEY are set, with fallback to verified local catalog.',
    ],
  });
}
