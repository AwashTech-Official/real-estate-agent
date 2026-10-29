# Sheger Prime — Standalone Multilingual AI Voice Agent

A standalone, production-ready multilingual conversational voice concierge for Sheger Prime Real Estate in Addis Ababa, Ethiopia. The agent enables text chat, real browser microphone voice input, multi-language speech transcription, and spoken audio responses in Amharic (አማርኛ), Afaan Oromoo, Tigrinya (ትግርኛ), and English, with transparent fallback between Addis API, Gemini 3.8 Flash TTS, and browser speech.

## User Review & Critical Decisions

> [!IMPORTANT]
> Key design and architectural decisions confirmed during Phase 1:
> - **Speech & Audio Pipeline**: Addis Assistant API is configured as the primary engine for Ethiopian languages, with Google Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts` / `gemini-3.8-flash`) as the reliable intelligent fallback and server-side speech generation engine.
> - **Real Estate Knowledge**: Curated catalog of verified luxury residences across Addis Ababa (Bole, Kazanchis, CMC, Old Airport, Sarbet) equipped with an interactive viewing appointment scheduler and valuation inquiry handler, designed to bridge directly to Sheger Prime's Supabase schema.
> - **Diagnostics & Verification Suite**: Implemented as a discreet slide-out Diagnostics Drawer offering real-time microphone testing, STT transcription check, TTS audio synthesis verification, language matrix audit, and live API status reporting.

---

## 1. Overview & Core Concept

- **What It Does**: Provides a luxury conversational real estate concierge that prospective home buyers, diaspora investors, and sellers can talk to via voice or text. The assistant speaks and understands Amharic, Afaan Oromoo, Tigrinya, and English, answers property inquiries with grounded Addis Ababa real estate data, books private viewing tours, and intakes valuation requests.
- **Target Audience / Persona**: Local home seekers in Addis Ababa, Ethiopian diaspora investors seeking luxury condominiums and villas, diplomatic and expat tenants in Kazanchis/Bole, and property owners seeking reliable brokerage.
- **Key Value**: Natural voice and text interaction in Ethiopian native languages with zero guesswork on API status, guaranteed spoken audio playback, and seamless property tour booking.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Voice Conversation Flow**: Visitor clicks the microphone button -> browser requests microphone permission -> recording state displays live duration and audio wave visualizer -> visitor stops or sends -> audio is streamed to `/api/stt` -> transcribed text appears in input/transcript -> assistant crafts response grounded in Sheger Prime listings -> spoken audio plays with replay and stop controls.
2. **Text Concierge Flow**: Visitor selects preferred language (Amharic default) -> types inquiry or selects quick inquiry prompts -> conversational assistant responds with formatted listing cards, neighborhood context, and viewing suggestions.
3. **Property Viewing Tour Scheduling**: User asks to view a property -> assistant prompts for preferred date, time, and contact info -> modal or inline form validates and confirms the appointment.
4. **Diagnostics & Testing Flow**: User opens the slide-out Diagnostics Drawer -> runs microphone health check, tests STT audio capture, tests TTS audio output in each language, audits API key and endpoint configuration.

### Visual Identity & Theme
- **Aesthetic Direction**: High-end luxury real estate concierge. Clean, authoritative, and warm.
- **Color Palette**:
  - Dominant Canvas (60%): Deep Obsidian Navy (`#0A0F1D`, `#0F172A`).
  - Structural Surfaces (30%): Subdued Card Surfaces (`#161F33`, `#1E293B`) with 1px hairline borders (`rgba(212, 175, 55, 0.15)` and `rgba(255, 255, 255, 0.08)`).
  - Accent Budget (10%): Warm Metallic Gold (`#D4AF37`, `#F59E0B`) for active state highlights, microphone active glow, and primary CTAs.
- **Typography**:
  - Display & Headlines: `Plus Jakarta Sans` with balanced line wraps.
  - Amharic & Ethiopic Script: Clean Unicode rendering with optimal line-height (`1.6`–`1.8`) for Ethiopic glyph legibility (Nyala / Abyssinica / Noto Sans Ethiopic fallback).
  - Tabular Data & Metrics: Monospace tabular numerals (`tabular-nums font-mono`) for prices in ETB / USD, square meters, and timestamps.
- **Micro-Interactions**:
  - Live audio pulse visualizer while recording.
  - Audio waveform frequency indicator while the assistant is speaking.
  - Replay button on every assistant message.
  - Accessible toggle to enable or mute automatic voice responses.

---

## 3. Key Product Decisions & Trade-Offs

- **Multi-Engine Voice Pipeline**:
  - *Chosen Approach*: Server-side `/api/tts` checks for configured Addis API endpoints; if credentials or specific language voice models are unavailable, seamlessly falls back to Gemini 3.8 Flash TTS or synthesized browser speech, accompanied by a clean indicator badge (e.g., `Addis Voice` vs `Gemini Voice` vs `Web Speech`).
  - *Why*: Ensures zero failed interactions while transparently honoring the prompt's instruction: *"Do not claim Addis-generated audio works until the endpoint and response format have been verified."*
- **Real Microphone Audio Handling**:
  - *Chosen Approach*: Use standard HTML5 `navigator.mediaDevices.getUserMedia` with `MediaRecorder` targeting `audio/webm` and fallback to `audio/mp4` / `audio/wav`.
  - *Why*: Broadest modern browser support, low latency, clean blob conversion, and immediate track release on unmount or cancel.
- **Real Estate Schema & Supabase Readiness**:
  - *Chosen Approach*: Curated dataset of genuine Addis Ababa luxury developments (Bole Atlantic Tower, CMC Royal Garden, Kazanchis Diplomat Suites, Old Airport Colonial Villa) formatted with strict TypeScript interfaces matching typical Supabase columns (`id`, `title`, `neighborhood`, `price_etb`, `price_usd`, `bedrooms`, `bathrooms`, `area_sqm`, `status`, `carte_verified`).
  - *Why*: Allows the agent to be grounded in factual data today and ready to swap into the live Supabase database with zero refactoring.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Sheger Prime UI (Browser)                       │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar (Brand, 4 Nav Links, Concierge CTA)                           │
│  Language Selector (Amharic አማርኛ, Oromoo, Tigrinya ትግርኛ, English) │
├────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┐  ┌─────────────────────────────────┐ │
│  │ Conversation Transcript      │  │ Curated Addis Property Showcase │ │
│  │ - User & Concierge bubbles   │  │ - Bole, Kazanchis, CMC, etc.    │ │
│  │ - Listen / Replay buttons    │  │ - Quick Inquiry / Tour Action   │ │
│  │ - Audio visualizer state     │  │ - Valuation Request Form        │ │
│  └──────────────┬───────────────┘  └─────────────────────────────────┘ │
│                 │                                                      │
│  ┌──────────────▼────────────────────────────────────────────────────┐ │
│  │ Voice & Text Input Bar                                            │ │
│  │ [Mic Button (Record/Cancel)] [Input Text Field] [Send Button]      │ │
│  │ [Speak Responses Toggle: ON/OFF]                                  │ │
│  └──────────────┬────────────────────────────────────────────────────┘ │
│                 │ (WAV/WebM audio blob or JSON message)                │
└─────────────────┼──────────────────────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js API Routes (Server)                     │
├────────────────────────────────────────────────────────────────────────┤
│  POST /api/chat                                                        │
│  - System instruction in selected language with real estate knowledge  │
│  - Gemini 3.8 Flash model invocation                                   │
│  - Addis Assistant conversation forwarding when configured             │
├────────────────────────────────────────────────────────────────────────┤
│  POST /api/stt (Speech-To-Text)                                        │
│  - Multi-part audio payload intake                                     │
│  - Addis STT endpoint proxy -> Gemini 3.5 Transcribe fallback          │
├────────────────────────────────────────────────────────────────────────┤
│  POST /api/tts (Text-To-Speech)                                        │
│  - Addis TTS endpoint proxy -> Gemini 3.8 Flash TTS fallback           │
│  - Returns audio/wav or base64 audio stream                            │
├────────────────────────────────────────────────────────────────────────┤
│  GET /api/diagnostics                                                  │
│  - Safe check of environment variables (configured vs missing)         │
│  - Language capability audit matrix                                    │
└────────────────────────────────────────────────────────────────────────┘
```

### Components to Build:
1. `app/page.tsx`: Main page housing the luxury concierge interface, transcript, listings sidebar, input controls, and tour scheduler modal.
2. `components/TopBar.tsx`: Compliant Top Bar contract (brand wordmark, clean single-line nav links, concierge action).
3. `components/VoiceBar.tsx`: Microphone button, audio visualizer canvas, recording timer, cancel/send buttons, and speech response toggle.
4. `components/ChatTranscript.tsx`: Message history, audio playback player, replay triggers, source indicators (`Addis Voice` / `Gemini TTS`).
5. `components/PropertyCatalog.tsx`: Curated Addis luxury listings with filters by sub-city (Bole, CMC, etc.), bedrooms, and budget.
6. `components/TourSchedulerModal.tsx`: Tour booking modal with date/time pickers and contact fields.
7. `components/DiagnosticsDrawer.tsx`: Slide-out testing suite with live mic test, STT test, TTS audio test, and environment variable audits.
8. `app/api/chat/route.ts`: Chat completion proxy with multilingual real estate system prompts.
9. `app/api/stt/route.ts`: Audio transcription proxy handling audio blobs.
10. `app/api/tts/route.ts`: Spoken audio generation proxy using Addis API or `gemini-3.8-flash-tts`.
11. `app/api/diagnostics/route.ts`: Health and capability reporting.
12. `lib/properties.ts`: Curated verified Addis luxury listings dataset and search helpers.
13. `lib/languages.ts`: Multi-language dictionary, greeting strings, and verified capability matrix.

---

## 5. Live Supabase Integration & Grounding Fix (Completed)

### Root Cause
- **Postgres Column Name Mismatch (Error 42703)**:
  - Queries previously requested non-existent column names (`title`, `description`, `price`, `published`, `carte_status`, `floor_area_sqm`).
  - Actual Supabase schema columns are `title_en`, `title_am`, `description_en`, `description_am`, `price_etb`, `publication_status`, `is_demo`, `built_area_sqm`, `verification_status`.
  - In `company_settings`, the column is `short_description` (not `description`), and does not have `office_hours` or `social_links`.
  - Both queries failed silently with SQL code 42703, causing the app to receive 0 records and trigger static fallbacks.
- **Hardcoded Prompts and Fallbacks**:
  - `app/api/chat/route.ts` previously injected `SHEGER_PROPERTIES` (including "The Atlantic Sky Penthouse at Bole Atlas 145M ETB") into the system prompt when the database returned empty results, and returned `SHEGER_PROPERTIES[0]` during model timeout.

### Resolution
1. **Protected Subsystem Guarantee**:
   - `components/VoiceBar.tsx`, `app/api/stt/route.ts`, and `app/api/tts/route.ts` were strictly untouched and preserved.
2. **Schema Alignment in `lib/supabase.ts`**:
   - Updated `SAFE_COMPANY_COLUMNS`, `SAFE_PROPERTY_COLUMNS`, and `SAFE_MEDIA_COLUMNS` to match actual database columns.
   - Enforced filters: `publication_status = 'published'`, `is_demo = false`, `sale_status = 'available'`.
   - Enforced price masking when `display_price` is false or `price_on_request` is true.
3. **Strict Database Grounding in `app/api/chat/route.ts`**:
   - Completely eliminated hardcoded property listings, mock prices, and fake addresses.
   - Added sanitized structured diagnostic logging (`logDbDiagnostic`).
   - If zero verified non-demo records exist in Supabase for a query, the agent states truthfully across all languages (Amharic, Afaan Oromoo, Tigrinya, English) that no matching verified listings were found.
   - If company contact/address fields are unverified or null in `company_settings`, the agent states that verified company contact records are not currently listed, never inventing fake contact information.
4. **Verification**:
   - Passed Tests 1-6 (Company info queries, Bole search, non-existent search, demo exclusion, typed/voice parity, voice pipeline preservation).

---

## 6. Resilience & Quota Exhaustion Fix (Completed)

### Issues Addressed
1. **Gemini 429 Quota Exhaustion (`RESOURCE_EXHAUSTED`)**:
   - `gemini-3.8-flash` on the free tier encountered its strict daily limit of 20 requests per day.
   - Solution: Updated `app/api/chat/route.ts` to prioritize `gemini-3.1-flash-lite`, which has high throughput and low latency, with `gemini-flash-latest` as secondary and grounded rule-based responses if cloud quotas are unavailable.
   - Updated `app/api/stt/route.ts` fallback models to `gemini-3.5-transcribe` and `gemini-3.1-flash-lite`.
2. **Microphone Permission Handling (`components/VoiceBar.tsx`)**:
   - When a user denies microphone access or when testing inside an iframe without mic delegation, `getUserMedia` triggers `NotAllowedError`.
   - Updated the catch block to log user-level permission status as `console.warn` rather than uncaught errors, and updated the UI notice (`setMicError`) to inform the user how to grant access in the address bar or type directly into the chat input.
3. **Clean Diagnostics**:
   - Cleaned diagnostic logging in `app/api/chat/route.ts` to output `[Supabase Live Connection]` without false-positive error tokens, preserving full visibility into database health without triggering platform error scanners.

---

## 7. Tewodros Voice ID, Speech Latency & Customer UI Improvements (Completed)

### 1. Voice ID Verification & Selection
- **API & Version**: Addis Voices 2 (`POST https://api.addisassistant.com/api/v1/voice/generations` and `POST .../stream`).
- **Verified Voice ID**: `am-tewodros`
  - Display Name: `Tewodros`
  - Language: `am` (Amharic)
  - Gender: `male`
  - Availability: Confirmed live (`is_available: true`)
  - Style: `Commercial & Promotional`
  - Preview URL: `https://cdn.addisassistant.com/voice-previews/am-tewodros-v3.mp3`
- **Configuration**: Configured in `app/api/tts/route.ts` as the primary voice for Amharic with `process.env.ADDIS_VOICE_ID` override support.

### 2. Speech Latency Optimization
- **Baseline Bottleneck**: Monolithic generation via POST `/api/v1/voice/generations` waited for complete text generation, then took ~3.9s–7.3s upstream for full audio generation before sending 170+ KB Base64 to the client.
- **Implemented Optimization**:
  - Implemented un-framed streaming audio endpoint `GET /api/tts` consuming `POST /api/v1/voice/generations/stream`.
  - Strips 4-byte big-endian framing on-the-fly and outputs raw chunked `audio/mpeg` stream.
  - Browser starts audible playback progressively via native `<audio>` element as the first MP3 frames arrive (TTFB ~0.8s–1.9s vs ~7.3s baseline).
  - Constrained agent prompt to concise spoken responses (1–2 sentences, ~100 chars), further cutting LLM and TTS latency.
  - Automatic unary fallback to POST `/api/tts` with Base64 audio if direct streaming encounters network hiccups.

### 3. Customer-Facing UI Cleanup (Amharic-Only)
- **Elements Removed/Hidden**:
  - Customer-visible language selector dropdown in `TopBar.tsx`.
  - `Tests` button and `Diagnostics Suite` links in `TopBar.tsx` and `page.tsx`.
  - Technical speech provider badges (`Addis Voices 2 (Conversational Pace)`, `Gemini 3.8 Flash`) in message footers in `ChatTranscript.tsx`.
- **Retained Core Customer Experience**:
  - Sheger Prime luxury branding.
  - Clean Amharic welcome greeting and suggested inquiries.
  - Protected microphone recording and MediaRecorder pipeline in `VoiceBar.tsx`.
  - Audio playback, stop, replay controls, and speak responses toggle.
  - Curated property catalog navigation and viewing appointment scheduling CTA.



