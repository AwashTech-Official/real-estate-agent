import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { SupportedLanguageCode } from '@/lib/languages';
import {
  isSupabaseConfigured,
  getCompanyInfo,
  searchProperties,
  getPropertyDetails,
  PublicCompanyInfo,
  PublicPropertyListing,
  PropertySearchFilters,
} from '@/lib/supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Structured, sanitized diagnostic logger for database operations during chat turns.
 * NEVER logs credentials, tokens, or personal customer data.
 */
function logDbDiagnostic(event: {
  queryExecuted: boolean;
  queryType: 'company_info' | 'property_search' | 'property_details' | 'all' | 'none';
  recordsRetrieved: number;
  hasLiveContext: boolean;
  errorCategory?: 'none' | 'connection' | 'query_syntax' | 'rls_policy' | 'timeout' | 'unknown';
  details?: string;
}) {
  console.info(
    `[Supabase Live Connection] query=${event.queryType} records=${event.recordsRetrieved} contextActive=${event.hasLiveContext}`
  );
  if (event.details && !event.details.includes('Zero matching')) {
    console.warn(`[Supabase Live Notice] ${event.details}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      language = 'am',
    }: {
      message: string;
      history: ChatMessage[];
      language: SupportedLanguageCode;
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const lower = message.toLowerCase();

    // 1. Live Supabase database retrieval
    let liveCompanyInfo: PublicCompanyInfo | null = null;
    let liveProperties: PublicPropertyListing[] = [];
    const isDbActive = isSupabaseConfigured();

    if (isDbActive) {
      // 1A. Always fetch company information from public.company_settings
      const { data: comp, error: compErr } = await getCompanyInfo();
      if (comp) {
        liveCompanyInfo = comp;
        logDbDiagnostic({
          queryExecuted: true,
          queryType: 'company_info',
          recordsRetrieved: 1,
          hasLiveContext: true,
          errorCategory: 'none',
        });
      } else {
        logDbDiagnostic({
          queryExecuted: true,
          queryType: 'company_info',
          recordsRetrieved: 0,
          hasLiveContext: false,
          errorCategory: compErr ? 'query_syntax' : 'none',
          details: compErr || 'No company record returned',
        });
      }

      // 1B. Check if user is referencing a specific property ID or slug
      const uuidMatch = lower.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
      if (uuidMatch) {
        const { data: singleProp, error: singleErr } = await getPropertyDetails(uuidMatch[0]);
        if (singleProp) {
          liveProperties = [singleProp];
          logDbDiagnostic({
            queryExecuted: true,
            queryType: 'property_details',
            recordsRetrieved: 1,
            hasLiveContext: true,
            errorCategory: 'none',
          });
        } else if (singleErr) {
          logDbDiagnostic({
            queryExecuted: true,
            queryType: 'property_details',
            recordsRetrieved: 0,
            hasLiveContext: false,
            errorCategory: 'query_syntax',
            details: singleErr,
          });
        }
      }

      // 1C. Search published, available properties from public.properties
      if (liveProperties.length === 0) {
        const filters: PropertySearchFilters = {};

        // Listing type detection
        if (
          lower.includes('rent') ||
          lower.includes('lease') ||
          lower.includes('ኪራይ') ||
          lower.includes('ማከራየት')
        ) {
          filters.listing_type = 'rent';
        } else if (
          lower.includes('sale') ||
          lower.includes('buy') ||
          lower.includes('መግዛት') ||
          lower.includes('ሽያጭ')
        ) {
          filters.listing_type = 'sale';
        }

        // Subcity / Neighborhood detection (support both English and Amharic terms)
        const locationMap: Array<{ key: string; name: string }> = [
          { key: 'bole', name: 'Bole' },
          { key: 'ቦሌ', name: 'Bole' },
          { key: 'kirkos', name: 'Kirkos' },
          { key: 'ቂርቆስ', name: 'Kirkos' },
          { key: 'yeka', name: 'Yeka' },
          { key: 'የካ', name: 'Yeka' },
          { key: 'old airport', name: 'Old Airport' },
          { key: 'ኦልድ ኤርፖርት', name: 'Old Airport' },
          { key: 'kazanchis', name: 'Kazanchis' },
          { key: 'ካዛንቺስ', name: 'Kazanchis' },
          { key: 'cmc', name: 'CMC' },
          { key: 'ሲኤምሲ', name: 'CMC' },
          { key: 'ayat', name: 'Ayat' },
          { key: 'አያት', name: 'Ayat' },
          { key: 'sarbet', name: 'Sarbet' },
          { key: 'ሳርቤት', name: 'Sarbet' },
          { key: 'lideta', name: 'Lideta' },
          { key: 'ልደታ', name: 'Lideta' },
          { key: 'akaki', name: 'Akaki' },
          { key: 'አቃቂ', name: 'Akaki' },
          { key: 'summit', name: 'Summit' },
          { key: 'ሰሚት', name: 'Summit' },
          { key: 'gullele', name: 'Gullele' },
          { key: 'ጉለሌ', name: 'Gullele' },
          { key: 'arada', name: 'Arada' },
          { key: 'አራዳ', name: 'Arada' },
        ];

        for (const loc of locationMap) {
          if (lower.includes(loc.key)) {
            filters.subcity = loc.name;
            break;
          }
        }

        // Property type detection
        if (
          lower.includes('penthouse') ||
          lower.includes('ፔንትሀውስ') ||
          lower.includes('ፔንትሃውስ')
        ) {
          filters.property_type = 'penthouse';
        } else if (lower.includes('villa') || lower.includes('ቪላ')) {
          filters.property_type = 'villa';
        } else if (
          lower.includes('apartment') ||
          lower.includes('አፓርታማ') ||
          lower.includes('አፓርትመንት')
        ) {
          filters.property_type = 'apartment';
        } else if (
          lower.includes('commercial') ||
          lower.includes('office') ||
          lower.includes('ንግድ') ||
          lower.includes('ቢሮ')
        ) {
          filters.property_type = 'commercial';
        }

        // Bedroom detection
        const bedMatch = lower.match(/(\d+)\s*(?:bed|bedroom|መኝታ)/i);
        if (bedMatch) {
          filters.min_bedrooms = parseInt(bedMatch[1], 10);
        }

        let { data: props, error: propErr } = await searchProperties(filters);

        // If specific filtered search returned 0 records and filters were applied,
        // fetch all active available inventory so the agent can present available options
        if ((!props || props.length === 0) && Object.keys(filters).length > 0) {
          const { data: allProps } = await searchProperties({});
          if (allProps && allProps.length > 0) {
            props = allProps;
          }
        }

        if (props && props.length > 0) {
          liveProperties = props;
          logDbDiagnostic({
            queryExecuted: true,
            queryType: 'property_search',
            recordsRetrieved: props.length,
            hasLiveContext: true,
            errorCategory: 'none',
          });
        } else {
          logDbDiagnostic({
            queryExecuted: true,
            queryType: 'property_search',
            recordsRetrieved: 0,
            hasLiveContext: false,
            errorCategory: propErr ? 'query_syntax' : 'none',
            details: propErr || 'Zero matching published records in database',
          });
        }
      }
    } else {
      logDbDiagnostic({
        queryExecuted: false,
        queryType: 'none',
        recordsRetrieved: 0,
        hasLiveContext: false,
        errorCategory: 'connection',
        details: 'Supabase credentials not configured',
      });
    }

    // Check if user has an Addis Assistant custom endpoint configured
    const addisEndpoint = process.env.ADDIS_API_ENDPOINT;
    const addisKey = process.env.ADDIS_API_KEY;

    let replyText = '';
    let provider = 'gemini';

    if (addisEndpoint && addisKey) {
      try {
        const addisRes = await fetch(addisEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${addisKey}`,
          },
          body: JSON.stringify({
            message,
            history,
            language,
            context: 'Sheger Prime Real Estate Addis Ababa',
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (addisRes.ok) {
          const addisData = await addisRes.json();
          if (addisData?.reply || addisData?.text || addisData?.message) {
            replyText = addisData.reply || addisData.text || addisData.message;
            provider = 'addis';
          }
        }
      } catch (e) {
        console.warn('Addis chat endpoint attempt failed, continuing to Gemini fallback:', e);
      }
    }

    // Construct smooth, professional company profile strictly from Supabase
    let companyContext = '';
    if (liveCompanyInfo) {
      const details: string[] = [
        `- Company Name: ${liveCompanyInfo.company_name || 'Sheger Prime Real Estate'}`,
      ];
      if (liveCompanyInfo.tagline) details.push(`- Tagline: ${liveCompanyInfo.tagline}`);
      if (liveCompanyInfo.address) {
        details.push(
          `- Office Address: ${liveCompanyInfo.address}, ${liveCompanyInfo.city || 'Addis Ababa'}, ${liveCompanyInfo.country || 'Ethiopia'}`
        );
      }
      if (liveCompanyInfo.contact_phone) details.push(`- Contact Phone: ${liveCompanyInfo.contact_phone}`);
      if (liveCompanyInfo.whatsapp) details.push(`- WhatsApp: ${liveCompanyInfo.whatsapp}`);
      if (liveCompanyInfo.telegram) details.push(`- Telegram: ${liveCompanyInfo.telegram}`);
      if (liveCompanyInfo.contact_email) details.push(`- Contact Email: ${liveCompanyInfo.contact_email}`);
      if (liveCompanyInfo.website_url) details.push(`- Website: ${liveCompanyInfo.website_url}`);
      if (liveCompanyInfo.response_time_text) details.push(`- Response Time: ${liveCompanyInfo.response_time_text}`);

      companyContext = `\nOFFICIAL COMPANY PROFILE (SHEGER PRIME REAL ESTATE):\n` + details.join('\n') + '\n';
    } else {
      companyContext = `\nOFFICIAL COMPANY PROFILE:\n- Company Name: Sheger Prime Real Estate (Addis Ababa, Ethiopia)\n`;
    }

    // Construct grounded properties context strictly from Supabase
    let propertiesContext = '';
    if (liveProperties.length > 0) {
      propertiesContext = liveProperties
        .map((p) => {
          const priceDisplay =
            typeof p.price_etb === 'number'
              ? `${(p.price_etb / 1000000).toFixed(1)}M ETB (${p.price_etb.toLocaleString()} ETB)`
              : 'Price available upon direct inquiry';

          return `- Property: ${p.title_en} (${p.title_am || p.title_en})
  Listing Type: For ${p.listing_type}
  Property Type: ${p.property_type}
  Location: ${p.neighborhood ? `${p.neighborhood}, ` : ''}${p.subcity ? `${p.subcity}, ` : ''}${p.city}${p.public_location_text ? ` (${p.public_location_text})` : ''}
  Price: ${priceDisplay}
  Bedrooms: ${p.bedrooms ?? 'N/A'}, Bathrooms: ${p.bathrooms ?? 'N/A'}, Built Area: ${p.built_area_sqm ? `${p.built_area_sqm} sqm` : 'N/A'}
  Status: Available
  Amenities: ${p.amenities?.join(', ') || 'N/A'}
  Highlights: ${p.highlights?.join(', ') || 'N/A'}
  Description: ${p.description_am || p.description_en || 'High-end property by Sheger Prime'}`;
        })
        .join('\n\n');
    } else {
      propertiesContext = `Currently no active property records are listed in the catalog.`;
    }

    const languageInstructions: Record<SupportedLanguageCode, string> = {
      am: 'You MUST respond fluently and politely in Amharic (አማርኛ). Use natural, respectful Ethiopian real estate phrasing. If technical terms are clearer with English in parentheses, you may provide it.',
      om: 'You MUST respond fluently and politely in Afaan Oromoo. Use welcoming, professional real estate vocabulary.',
      ti: 'You MUST respond fluently and politely in Tigrinya (ትግርኛ). Use courteous and clear phrasing suitable for high-end clients.',
      en: 'You MUST respond in professional, polished English tailored for luxury property buyers, diaspora investors, and diplomats.',
    };

    const systemPrompt = `You are the exclusive AI Voice & Real Estate Concierge for Sheger Prime Real Estate in Addis Ababa, Ethiopia.
Your mission is to assist prospective property buyers, diaspora investors, tenants, and property sellers with verified, accurate knowledge.

ABSOLUTE STRICT GROUNDING & LANGUAGE CONSTRAINTS:
1. STRICT AMHARIC-ONLY EXPERIENCE:
   - You MUST ALWAYS respond to the customer in natural, professional, courteous Amharic (አማርኛ).
   - Even if the customer writes or speaks in English, Afaan Oromoo, or another language, respond politely and fluently in Amharic.
   - Do not switch to Oromo, Tigrinya, or English in your replies.
2. STRICT CONCISE SPOKEN TONE:
   - Keep spoken replies reasonably concise and conversational (1 to 2 clear sentences, ideally under 120 characters).
   - Use proper Amharic punctuation (። and ፣) to support smooth, natural speech delivery for Text-to-Speech audio.
   - Avoid long markdown blocks or multi-paragraph walls of text.
3. ACTIVE PROPERTY INVENTORY:
   - You have direct access to Sheger Prime's active property inventory from the database below.
   - Answer client questions directly, warmly, and accurately using this inventory.
   - Mention the property name, location, price, and key details naturally in Amharic.
   - NEVER call these properties "demo", "sample", "test", or "fictional". Present them as real, active properties.
4. HONESTY & FACTUAL ACCURACY:
   - Answer strictly using the real inventory and company profile provided below.
   - If a client asks for a property type or location that does not match any current listing, politely present the available properties that we DO have (e.g., our luxury Bole apartment, family villa, or commercial space).
   - NEVER invent fictional prices, imaginary buildings, or fake contact numbers.
5. COMPANY CONTACT & INQUIRIES:
   - Sheger Prime Real Estate is a premier real estate advisory in Addis Ababa, Ethiopia.
   - If specific contact numbers or office address are not present in the company profile, warmly invite the client to leave their inquiry or arrange a consultation with the concierge team. Never recite technical or robotic disclaimers like "not listed in verified company records".
6. VIEWING TOURS & VALUATION: If relevant, offer to schedule a viewing or request a property valuation for verified sellers.
${companyContext}

CATALOG OF LIVE SHEGER PRIME PROPERTIES FROM DATABASE:
${propertiesContext}
`;

    if (!replyText) {
      // Build conversation contents for Gemini
      const contents = [];

      // Add prior history if any (up to last 6 messages)
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }

      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const timeoutPromise = (ms: number) =>
        new Promise((_, reject) => setTimeout(() => reject(new Error('Model timeout')), ms));

      // Resilient multi-model chain: gemini-3.1-flash-lite offers high throughput and low latency, with gemini-flash-latest as secondary
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];

      for (const candidateModel of candidateModels) {
        try {
          const timeoutMs = 12000;
          const response: any = await Promise.race([
            ai.models.generateContent({
              model: candidateModel,
              contents,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0.6,
                maxOutputTokens: 600,
              },
            }),
            timeoutPromise(timeoutMs),
          ]);

          if (response?.text) {
            replyText = response.text;
            provider = isDbActive
              ? `Sheger Prime Supabase + ${candidateModel}`
              : candidateModel;
            break;
          }
        } catch (geminiErr: any) {
          console.warn(
            `[Chat Provider Notice] Model ${candidateModel} fallback activated (${geminiErr?.status || 'service_busy'})`
          );
        }
      }

      // Live Knowledge fallback: Grounded in Supabase data
      if (!replyText) {
        const isAskingCompany =
          lower.includes('office') ||
          lower.includes('address') ||
          lower.includes('phone') ||
          lower.includes('call') ||
          lower.includes('contact') ||
          lower.includes('whatsapp') ||
          lower.includes('email') ||
          lower.includes('hours') ||
          lower.includes('ቢሮ') ||
          lower.includes('ስልክ') ||
          lower.includes('አድራሻ') ||
          lower.includes('ኢሜይል');

        if (isAskingCompany) {
          const compName = liveCompanyInfo?.company_name || 'ሸገር ፕራይም ሪል እስቴት';
          if (language === 'am') {
            replyText = `${compName} በአዲስ አበባ የሚገኝ የፕሪሚየም ሪል እስቴት አማካሪ ድርጅት ሲሆን፣ የሽያጭና የኪራይ አገልግሎቶችን በከፍተኛ ጥራት ያቀርባል። ለተጨማሪ መረጃ እባክዎ ጥያቄዎን እዚህ ያካፍሉን።`;
          } else {
            replyText = `${compName} is a premier real estate advisory in Addis Ababa, Ethiopia. Please let us know how our concierge team can assist your property journey.`;
          }
        } else if (liveProperties.length > 0) {
          const firstProp = liveProperties[0];
          const priceText =
            typeof firstProp.price_etb === 'number'
              ? `${(firstProp.price_etb / 1000000).toFixed(1)} ሚሊዮን ብር`
              : 'በቀጥታ ጥያቄ የሚቀርብ';

          if (language === 'am') {
            replyText = `በሸገር ፕራይም የሚገኝ ንብረት፦ ${firstProp.title_am || firstProp.title_en} በ${firstProp.neighborhood || firstProp.subcity || firstProp.city}፣ ዋጋው ${priceText} ነው። ለተጨማሪ መረጃ ወይም ለጉብኝት ቀጠሮ መጠየቅ ይችላሉ።`;
          } else {
            replyText = `Available at Sheger Prime: ${firstProp.title_en} in ${firstProp.neighborhood || firstProp.subcity || firstProp.city}, priced at ${typeof firstProp.price_etb === 'number' ? `${(firstProp.price_etb / 1000000).toFixed(1)}M ETB` : 'Price on request'}. Please let us know if you would like to schedule a viewing.`;
          }
        } else {
          // Zero properties found in database
          if (language === 'am') {
            replyText = `ይቅርታ፣ በአሁኑ ወቅት ያቀረቡትን መስፈርት የሚያሟላ ንብረት አልተገኘም። እባክዎ ሌሎች አማራጮችን ይጠይቁ ወይም ቆየት ብለው ይሞክሩ።`;
          } else {
            replyText = `Currently, no property listings matching your request were found. Please check back soon or specify different search criteria.`;
          }
        }
        provider = 'Sheger Prime Supabase Grounded Knowledge';
      }
    }

    // Only extract matched property IDs from live Supabase results (NEVER static mock IDs)
    const matchedPropertyIds = liveProperties
      .filter((p) => {
        const textToSearch = replyText.toLowerCase();
        return (
          (p.title_en && textToSearch.includes(p.title_en.toLowerCase())) ||
          (p.title_am && textToSearch.includes(p.title_am.toLowerCase())) ||
          (p.subcity && textToSearch.includes(p.subcity.toLowerCase())) ||
          (p.neighborhood && textToSearch.includes(p.neighborhood.toLowerCase()))
        );
      })
      .map((p) => p.id);

    return NextResponse.json({
      reply: replyText,
      provider,
      language,
      matchedPropertyIds,
      databaseActive: isDbActive,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate response',
        reply:
          'ይቅርታ፣ በስርዓቱ ላይ ትንሽ መቆራረጥ አጋጥሟል። እባክዎ እንደገና ይሞክሩ ወይም በስልክ ያግኙን። (An error occurred while connecting. Please try again.)',
      },
      { status: 500 }
    );
  }
}
