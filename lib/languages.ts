export type SupportedLanguageCode = 'am' | 'om' | 'ti' | 'en';

export interface LanguageConfig {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  flagLabel: string;
  sttStatus: 'verified' | 'preview' | 'fallback_required';
  sttNotes: string;
  ttsStatus: 'verified' | 'supported' | 'fallback_required';
  ttsVoiceName: string;
  welcomeGreeting: string;
  welcomeSub: string;
  quickPrompts: { label: string; query: string }[];
  ui: {
    voiceAgent: string;
    speakResponses: string;
    speakEnabled: string;
    speakMuted: string;
    recordPrompt: string;
    recording: string;
    processing: string;
    speaking: string;
    stopAudio: string;
    replay: string;
    cancel: string;
    send: string;
    typePlaceholder: string;
    scheduleViewing: string;
    requestValuation: string;
    exploreProperties: string;
    diagnostics: string;
    close: string;
    disclaimer: string;
    micPermissionError: string;
  };
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguageCode, LanguageConfig> = {
  am: {
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    flagLabel: 'ET',
    sttStatus: 'preview',
    sttNotes: 'Addis Assistant Amharic STT endpoint supported when credentials configured; automatic Gemini 3.5 Transcribe fallback.',
    ttsStatus: 'verified',
    ttsVoiceName: 'Addis Voices 2 (Tewodros)',
    welcomeGreeting: 'እንኳን ወደ ሸገር ፕራይም ሪል እስቴት በደህና መጡ።',
    welcomeSub: 'የአዲስ አበባን የቅንጦት አፓርታማዎች፣ ቪላዎች እና የኢንቨስትመንት እድሎች በድምፅ ወይም በጽሁፍ ይጠይቁኝ።',
    quickPrompts: [
      {
        label: 'ቦሌ ባለ 3 መኝታ አፓርታማ',
        query: 'ቦሌ ውስጥ የሚሸጥ ባለ 3 መኝታ ቅንጦት አፓርታማ ምን ምን አማራጭ አለዎት?',
      },
      {
        label: 'የጉብኝት ቀጠሮ መያዝ',
        query: 'አንድ ንብረት በግንባር ለመጎብኘት ቀጠሮ መያዝ እፈልጋለሁ። ሂደቱ እንዴት ነው?',
      },
      {
        label: 'ኦልድ ኤርፖርት ቪላ ዋጋ',
        query: 'በኦልድ ኤርፖርት ዲፕሎማቲክ ዞን ያለ ቪላ ዋጋ እና ካርታ ሁኔታ ንገረኝ?',
      },
      {
        label: 'ንብረት መሸጥ እና ግመታ',
        query: 'የምሸጠው አፓርታማ አለኝ፣ የዋጋ ግመታ እና ሽያጭ እንዴት ትረዳኛላችሁ?',
      },
    ],
    ui: {
      voiceAgent: 'ሸገር ፕራይም ድምፅ ረዳት',
      speakResponses: 'መልሶችን በድምፅ ያሰሙ',
      speakEnabled: 'ድምፅ በርቷል',
      speakMuted: 'ድምፅ ጠፍቷል',
      recordPrompt: 'ለመናገር ማይክሮፎኑን ይጫኑ',
      recording: 'እያዳመጥኩ ነው... ይናገሩ',
      processing: 'መልስ እየተዘጋጀ ነው...',
      speaking: 'ረዳቱ እየተናገረ ነው...',
      stopAudio: 'ድምፅ አቁም',
      replay: 'እንደገና አጫውት',
      cancel: 'ሰርዝ',
      send: 'ላክ',
      typePlaceholder: 'ስለ አዲስ አበባ ሪል እስቴት እዚህ ይጠይቁ ወይም ይናገሩ...',
      scheduleViewing: 'የጉብኝት ቀጠሮ ይያዙ',
      requestValuation: 'የንብረት ግመታ ይጠይቁ',
      exploreProperties: 'የተመረጡ ንብረቶች',
      diagnostics: 'የስርዓት ምርመራ & የድምፅ ፍተሻ',
      close: 'ዝጋ',
      disclaimer: 'የተረጋገጡ የሸገር ፕራይም ሪል እስቴት መረጃዎች ብቻ። ማናቸውም የሙከራ መረጃዎች በግልጽ ምልክት ይደረግባቸዋል።',
      micPermissionError: 'የማይክሮፎን ፈቃድ ተከልክሏል። እባክዎ በአሳሽዎ ቅንብር ውስጥ ማይክሮፎኑን ይፍቀዱ።',
    },
  },
  om: {
    code: 'om',
    name: 'Afaan Oromoo',
    nativeName: 'Oromoo',
    flagLabel: 'OR',
    sttStatus: 'fallback_required',
    sttNotes: 'Addis Assistant STT for Afaan Oromoo is in active verification; multimodal speech pipeline provides automated fallback.',
    ttsStatus: 'supported',
    ttsVoiceName: 'Addis Voice / Gemini Natural',
    welcomeGreeting: 'Baga nagaan gara Sheger Prime Real Estate dhuftan.',
    welcomeSub: 'Gurgurtaa fi kireeffannaa manneen ammayyaa Finfinnee ilaalchisee sagaleen ykn barreeffamaan na gaafadhaa.',
    quickPrompts: [
      {
        label: 'Manneen Boolee kutaa 3',
        query: 'Boolee keessatti manneen ammayyaa kutaa ciisichaa 3 qaban maal fa\'atu jiru?',
      },
      {
        label: 'Manneen daawwachuuf beellama',
        query: 'Mana daawwachuuf beellama qabachuu barbaada. Akkamitti ta\'a?',
      },
      {
        label: 'Gatii manaa CMC',
        query: 'Gatiin manneen kondoominiyeemii ammayyaa naannoo CMC meeqa?',
      },
      {
        label: 'Mana kiyya gurguruu',
        query: 'Mana kiyya gurguruuf tilmaama gatii barbaada, akkamitti na gargaartu?',
      },
    ],
    ui: {
      voiceAgent: 'Gargaaraa Sagalee Sheger Prime',
      speakResponses: 'Deebii sagaleen dhageessisi',
      speakEnabled: 'Sagaleen banaadha',
      speakMuted: 'Sagaleen cufaadha',
      recordPrompt: 'Dubbachuuf maaykirofooni tuqi',
      recording: 'Dhaggeeffachaan jira... dubbadhaa',
      processing: 'Deebiin qophaa\'aa jira...',
      speaking: 'Gargaaraan dubbachaa jira...',
      stopAudio: 'Sagalee dhaabi',
      replay: 'Irra deebi\'ii dhageessisi',
      cancel: 'Haqi',
      send: 'Ergi',
      typePlaceholder: 'Waa\'ee qabeenya Finfinnee asitti barreessaa ykn dubbadhaa...',
      scheduleViewing: 'Beellama Daawwannaa Qabadhaa',
      requestValuation: 'Tilmaama Qabeenyaa Gaafadhaa',
      exploreProperties: 'Manneen Filataman',
      diagnostics: 'Qorannoo Sirnaa & Sagalee',
      close: 'Cufi',
      disclaimer: 'Odeeffannoo Sheger Prime mirkanaa\'e qofa. Qabeenyi moodeelaa qulqullinaan adda baafameera.',
      micPermissionError: 'Hayyamni maaykirofooni dhowwameera. Maaloo sagantaa browser keessan keessatti eeyyamaa.',
    },
  },
  ti: {
    code: 'ti',
    name: 'Tigrinya',
    nativeName: 'ትግርኛ',
    flagLabel: 'TI',
    sttStatus: 'fallback_required',
    sttNotes: 'Tigrinya speech recognition requires multimodal pipeline fallback; text conversation and spoken TTS are fully operational.',
    ttsStatus: 'supported',
    ttsVoiceName: 'Addis Voice / Gemini Zephyr',
    welcomeGreeting: 'እንቋዕ ብደሓን ናብ ሸገር ፕራይም ሪል እስቴት መጻእኩም።',
    welcomeSub: 'ብዛዕባ ኣብ ኣዲስ ኣበባ ዝርከቡ ብሉጻት ኣፓርታማታትን ቪላታትን ብድምጺ ወይ ብጽሑፍ ሕተቱኒ።',
    quickPrompts: [
      {
        label: 'ኣብ ቦሌ ዘሎ ኣፓርታማ',
        query: 'ኣብ ቦሌ ዝርከብ ናይ 3 መደቀሲ ብሉጽ ኣፓርታማ እንታይ ኣማራጺታት ኣለኩም?',
      },
      {
        label: 'ንብረት ናይ ምርኣይ ቆጸራ',
        query: 'ኣፓርታማ ብኣካል ንምርኣይ ቆጸራ ክሕዝ ይደሊ። ከመይ ይግበር?',
      },
      {
        label: 'ናይ ኦልድ ኤርፖርት ቪላታት ዋጋ',
        query: 'ኣብ ኦልድ ኤርፖርት ዝርከቡ ናይ ቪላ ዋጋታትን ናይ ካርታ ኩነታትን ከመይ እዩ?',
      },
      {
        label: 'ገዛ ምሻጥን ግምታን',
        query: 'ገዛ ክሸይጥ ይደሊ፡ ናይ ዋጋ ገምጋምን መስርሕ ምሻጥን ከመይ ትሕግዙና?',
      },
    ],
    ui: {
      voiceAgent: 'ናይ ድምጺ ሓጋዚ ሸገር ፕራይም',
      speakResponses: 'መልስታት ብድምጺ ኣስምዕ',
      speakEnabled: 'ድምጺ በርሀ',
      speakMuted: 'ድምጺ ዓጽው',
      recordPrompt: 'ንምዝራብ ማይክሮፎን ጠውቑ',
      recording: 'ይሰምዕ ኣለኹ... ተዛረቡ',
      processing: 'መልሲ ይዳሎ ኣሎ...',
      speaking: 'ሓጋዚ ይዛረብ ኣሎ...',
      stopAudio: 'ድምጺ ደው ኣብል',
      replay: 'ከም ብሓዲሽ ኣጻውት',
      cancel: 'ሰርዝ',
      send: 'ስደድ',
      typePlaceholder: 'ብዛዕባ ኣዲስ ኣበባ ሪል እስቴት ኣብዚ ጸሓፉ ወይ ተዛረቡ...',
      scheduleViewing: 'ናይ ምብጻሕ ቆጸራ ሓዙ',
      requestValuation: 'ናይ ዋጋ ገምጋም ሕተቱ',
      exploreProperties: 'ዝተመርጹ ኣባይቲ',
      diagnostics: 'ምርመራ ስርዓትን ድምጽን',
      close: 'ዕጾ',
      disclaimer: 'ዝተረጋገጸ ሓበሬታ ሸገር ፕራይም ጥራይ። ናይ ፈተነ ሓበሬታታት ብንጹር ተፈልዮም ኣለዉ።',
      micPermissionError: 'ፍቓድ ማይክሮፎን ተኸልኪሉ ኣሎ። በጃኹም ኣብ ብራውዘርኩም ፍቓድ ሃቡ።',
    },
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flagLabel: 'EN',
    sttStatus: 'verified',
    sttNotes: 'Fully verified speech-to-text recognition via Addis Assistant STT and Gemini 3.5 audio processing.',
    ttsStatus: 'verified',
    ttsVoiceName: 'Addis Voice / Gemini Kore',
    welcomeGreeting: 'Welcome to Sheger Prime Real Estate Concierge.',
    welcomeSub: 'Ask questions by voice or text regarding luxury apartments, diplomat villas, and prime property acquisitions in Addis Ababa.',
    quickPrompts: [
      {
        label: '3-Bedroom Penthouses in Bole',
        query: 'What 3-bedroom luxury penthouses and apartments do you have available in Bole?',
      },
      {
        label: 'Schedule a Private Tour',
        query: 'I would like to schedule an in-person viewing appointment for a property. How does it work?',
      },
      {
        label: 'Diplomat Villas in Old Airport',
        query: 'Tell me about available detached villas in Old Airport diplomatic quarter with pricing and title deed status.',
      },
      {
        label: 'Property Valuation & Selling',
        query: 'I own a prime property in Addis Ababa that I wish to sell. What is your valuation and brokerage advisory process?',
      },
    ],
    ui: {
      voiceAgent: 'Sheger Prime Voice Concierge',
      speakResponses: 'Speak AI Responses',
      speakEnabled: 'Voice Enabled',
      speakMuted: 'Voice Muted',
      recordPrompt: 'Click microphone to speak',
      recording: 'Listening... speak clearly',
      processing: 'Analyzing & crafting response...',
      speaking: 'Concierge is speaking...',
      stopAudio: 'Stop Audio',
      replay: 'Replay Audio',
      cancel: 'Cancel',
      send: 'Send',
      typePlaceholder: 'Ask about luxury residences, prices, or locations in Addis Ababa...',
      scheduleViewing: 'Schedule Viewing Tour',
      requestValuation: 'Request Valuation',
      exploreProperties: 'Featured Residences',
      diagnostics: 'Diagnostics & Audio Tests',
      close: 'Close',
      disclaimer: 'Official Sheger Prime Real Estate advisory. Verified Addis Ababa listings only; mock/demo items strictly demarcated.',
      micPermissionError: 'Microphone permission denied or blocked by iframe policy. Please grant microphone access in browser settings.',
    },
  },
};
