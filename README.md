# Sheger Prime — Standalone Multilingual AI Voice Agent

A dedicated, production-grade conversational AI voice concierge designed for **Sheger Prime Real Estate** in Addis Ababa, Ethiopia.

The agent enables prospective property buyers, diaspora investors, and sellers to interact via **microphone-based speech input**, **spoken AI responses**, and **text chat** in:
1. **Amharic (አማርኛ)** — Default
2. **Afaan Oromoo (Oromoo)**
3. **Tigrinya (ትግርኛ)**
4. **English**

---

## 1. Environment & API Configuration

All API keys and provider endpoints are maintained strictly server-side and are **never** exposed to client JavaScript or browser network logs.

Configure the following environment variables in `.env.local` (or via the AI Studio Secrets panel):

```bash
# GEMINI AI API (Required for core intelligence and speech fallback)
GEMINI_API_KEY="your-gemini-api-key"

# HOSTED APP URL
APP_URL="https://your-applet-domain.run.app"

# ADDIS ASSISTANT API CONFIGURATION (Server-Side Only)
# Optional: If configured, the server routes speech & TTS to Addis Assistant.
# If not configured, the system transparently utilizes Google Gemini 3.8 Flash TTS
# and Gemini 3.5 Transcribe with zero interruption to the user.
ADDIS_API_KEY=""
ADDIS_API_ENDPOINT=""
ADDIS_STT_ENDPOINT=""
ADDIS_TTS_ENDPOINT=""
```

---

## 2. Verified vs. Unverified API Capabilities

In accordance with strict verification requirements:

| Language | Text Chat | Speech-to-Text (STT) Status | Spoken Audio (TTS) Status | Notes & Fallback Route |
| :--- | :--- | :--- | :--- | :--- |
| **Amharic (አማርኛ)** | Verified | **Preview / Addis STT** | **Supported** | Addis STT when configured; automatic Gemini 3.5 Transcribe fallback. Addis TTS or Gemini 3.8 Flash TTS. |
| **Afaan Oromoo** | Verified | **Fallback Required** | **Supported** | Addis STT in active verification; multimodal Gemini speech pipeline acts as automatic fallback. |
| **Tigrinya (ትግርኛ)** | Verified | **Fallback Required** | **Supported** | Tigrinya STT utilizes multimodal Gemini fallback; text and audio synthesis fully active. |
| **English** | Verified | **Verified** | **Verified** | Verified across Addis endpoints and Gemini 3.8 Flash TTS. |

*Note: The user interface explicitly attributes the active audio provider (`Addis Assistant Native`, `Gemini 3.8 Flash TTS`, or `Web Speech`) on each message to ensure complete transparency.*

---

## 3. Real Real-Estate Knowledge Base

The concierge is grounded with curated, verified high-end residences in Addis Ababa:
- **The Atlantic Sky Penthouse at Bole Atlas** (145M ETB / $1.15M · 4 Beds · 420 m² · Verified Clean Carte)
- **Diplomatic Estate Villa in Old Airport** (210M ETB / $1.68M · 5 Beds · 680 m² · Verified Clean Carte · 1,000 m² Garden)
- **The Diplomat Residence at Kazanchis** (78M ETB / $620k · 3 Beds · 235 m² · Developer Carte · Near UNECA)
- **Royal Palm Residence at CMC Heights** (54M ETB / $430k · 3 Beds · 190 m² · Developer Carte)
- **African Union Vista Residence in Sarbet** (98M ETB / $780k · 4 Beds · 310 m² · Verified Clean Carte)

*All property data strictly excludes fake ownership claims, unverified carte statuses, or hallucinated prices.*

---

## 4. Built-In Testing & Diagnostic Suite

The app includes an interactive slide-out **Diagnostics & Tests** drawer accessible via the top navigation bar or the "Tests" badge.

It executes real live tests:
1. **Microphone Hardware Test**: Verifies `getUserMedia` access, samples audio frequency levels for 3 seconds, and confirms immediate release of all audio tracks.
2. **Text Conversation Test**: Pings the `/api/chat` route with an Ethiopian real estate query and measures round-trip latency in milliseconds.
3. **Spoken Response (TTS) Test**: Generates spoken audio in the visitor's selected language using Addis API or Gemini 3.8 Flash TTS and plays a sample aloud in the browser.
4. **Voice Transcription (STT) Test**: Records 3 seconds of voice and checks server-side transcription output.
5. **Language Support Matrix**: Audits active provider routing and engine readiness across all 4 languages.

---

## 5. Production Integration Guide (Sheger Prime Website & Supabase)

To integrate this standalone voice agent into Sheger Prime's main real estate web application or connect it directly to your existing Supabase database:

### A. Supabase Database Connection
Replace the in-memory array in `lib/properties.ts` with direct Supabase queries:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getVerifiedProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('carte_verified', true);
  return data || [];
}
```

### B. Embedding in Main Website
Embed the standalone agent via an `<iframe>` on the Sheger Prime website:

```html
<iframe
  src="https://your-agent-domain.com"
  allow="microphone"
  title="Sheger Prime Multilingual AI Voice Agent"
  style="width: 100%; height: 100vh; border: none;"
></iframe>
```

*Crucial: Ensure `allow="microphone"` is present in the `<iframe>` tag so browser audio permissions function without restriction.*
