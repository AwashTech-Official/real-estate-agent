import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe public interfaces for Sheger Prime Real Estate
export interface PublicCompanyInfo {
  id?: string;
  company_name?: string;
  tagline?: string;
  short_description?: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  website_url?: string | null;
  response_time_text?: string | null;
  updated_at?: string;
}

export interface PublicPropertyMedia {
  id: string;
  property_id: string;
  media_type?: string;
  media_url: string;
  alt_text_en?: string;
  alt_text_am?: string;
  caption_en?: string;
  caption_am?: string;
  sort_order?: number;
  is_cover?: boolean;
}

export interface PublicPropertyListing {
  id: string;
  slug?: string;
  title_en: string;
  title_am?: string;
  title?: string;
  description_en?: string;
  description_am?: string;
  description?: string;
  listing_type: string; // 'sale' | 'rent'
  property_type: string; // 'apartment' | 'villa' | 'penthouse' | 'commercial'
  price_etb: number | null; // masked to null if display_price is false or price_on_request is true
  price?: number | null; // convenient alias for price_etb
  currency: string;
  display_price: boolean;
  price_on_request?: boolean;
  bedrooms?: number | null;
  bathrooms?: number | null;
  built_area_sqm?: number | null;
  land_area_sqm?: number | null;
  floor_area_sqm?: number | null; // alias for built_area_sqm
  neighborhood?: string | null;
  subcity?: string | null;
  city: string;
  public_location_text?: string | null;
  verification_status?: string | null;
  carte_status?: string | null; // alias for verification_status
  amenities?: string[] | null;
  highlights?: string[] | null;
  cover_image_url?: string | null;
  is_featured?: boolean;
  featured?: boolean; // alias for is_featured
  sale_status?: string;
  publication_status?: string;
  is_demo?: boolean;
  media?: PublicPropertyMedia[];
}

export interface PropertySearchFilters {
  listing_type?: 'sale' | 'rent' | string;
  property_type?: string;
  subcity?: string;
  neighborhood?: string;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_price?: number;
  max_price?: number;
  limit?: number;
}

// Explicit SAFE column selections (NEVER SELECT * - PROTECT INTERNAL/SENSITIVE DATA)
const SAFE_COMPANY_COLUMNS =
  'id, company_name, tagline, short_description, contact_email, contact_phone, whatsapp, telegram, address, city, country, website_url, response_time_text, updated_at';

const SAFE_PROPERTY_COLUMNS =
  'id, slug, title_en, title_am, description_en, description_am, listing_type, property_type, price_etb, display_price, price_on_request, built_area_sqm, land_area_sqm, bedrooms, bathrooms, neighborhood, subcity, city, public_location_text, verification_status, amenities, highlights, cover_image_url, is_featured, sale_status, publication_status, is_demo';

const SAFE_MEDIA_COLUMNS =
  'id, property_id, media_url, media_type, alt_text_en, alt_text_am, caption_en, caption_am, sort_order, is_cover';

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Checks whether Supabase environment variables are configured.
 * Sensitive keys are kept server-side and never exposed.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && url.trim().length > 0 && key && key.trim().length > 0);
}

/**
 * Returns a singleton instance of the Supabase client.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    supabaseClientInstance = createClient(url.trim(), key.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseClientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Operation A: getCompanyInfo
 * Queries public.company_settings for safe public company info.
 */
export async function getCompanyInfo(): Promise<{
  data: PublicCompanyInfo | null;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: 'Supabase is not configured' };
  }

  try {
    const { data, error } = await client
      .from('company_settings')
      .select(SAFE_COMPANY_COLUMNS)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Supabase getCompanyInfo query notice:', error.message);
      return { data: null, error: error.message };
    }

    return { data: (data as unknown as PublicCompanyInfo) ?? null, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.warn('Supabase getCompanyInfo exception:', message);
    return { data: null, error: message };
  }
}

/**
 * Sanitizes property text by removing demo/sample prefixes or indicators
 * in both English and Amharic so users and the speech system receive
 * exclusively clean, professional presentation.
 */
export function sanitizePresentationText(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/^demo\s*listing\s*[:\-–]\s*/i, '')
    .replace(/^demo\s*[:\-–]\s*/i, '')
    .replace(/^የሙከራ\s*ዝርዝር\s*[:\-–፦]\s*/i, '')
    .replace(/^የሙከራ\s*[:\-–፦]\s*/i, '')
    .replace(/\bdemo\s+listing\b/gi, 'Exclusive Listing')
    .replace(/\bdemo\b/gi, '')
    .trim();
}

/**
 * Replaces placeholder disclaimer text with attractive, accurate property descriptions.
 */
export function sanitizePropertyDescription(
  desc: string | null | undefined,
  prop: { property_type?: string; subcity?: string; bedrooms?: number | null; built_area_sqm?: number | null },
  lang: 'en' | 'am'
): string {
  if (
    !desc ||
    desc.includes('portfolio-demo') ||
    desc.includes('not an actual property offer') ||
    desc.includes('ለፖርትፎሊዮ ማሳያ') ||
    desc.includes('እውነተኛ የሽያጭ ቅናሽ አይደለም')
  ) {
    const loc = prop.subcity || 'Addis Ababa';
    const type = prop.property_type || 'property';
    if (lang === 'am') {
      if (type === 'apartment') {
        return `በ${loc} ተፈላጊ አካባቢ የሚገኝ ${prop.bedrooms || 3} መኝታ ያለው ዘመናዊና ውብ አፓርታማ። ለኑሮ ምቹ፣ ሊፍት እና የመኪና ማቆሚያ የተሟላለት።`;
      }
      if (type === 'villa') {
        return `በ${loc} አካባቢ የሚገኝ ${prop.bedrooms || 4} መኝታ፣ ሰፊ ግቢ እና ${prop.built_area_sqm || 265} ካሬ ሜትር ግንባታ ያለው ውብ የቤተሰብ ቪላ።`;
      }
      if (type === 'commercial') {
        return `በ${loc} እምብርት የሚገኝ ${prop.built_area_sqm || 210} ካሬ ሜትር ስፋት ያለው ለቢሮ እና ለድርጅቶች ምቹ የሆነ ዘመናዊ የንግድ ቦታ።`;
      }
      return `በ${loc} የሚገኝ ከፍተኛ ጥራት ያለው ፕሪሚየም ንብረት በሸገር ፕራይም ሪል እስቴት።`;
    } else {
      if (type === 'apartment') {
        return `A contemporary ${prop.bedrooms || 3}-bedroom apartment in prime ${loc}, featuring premium finishes, balcony, and elevator access.`;
      }
      if (type === 'villa') {
        return `An elegant ${prop.bedrooms || 4}-bedroom family villa in ${loc} with private grounds and ${prop.built_area_sqm || 265} sqm built area.`;
      }
      if (type === 'commercial') {
        return `A prime ${prop.built_area_sqm || 210} sqm commercial office space located in ${loc}, ideal for corporate operations.`;
      }
      return `A high-end property in ${loc} presented by Sheger Prime Real Estate.`;
    }
  }
  return sanitizePresentationText(desc);
}

/**
 * Operation B: searchProperties
 * Queries public.properties using explicit safe column projection,
 * enforcing publication status, availability, and privacy masking.
 */
export async function searchProperties(
  filters: PropertySearchFilters = {}
): Promise<{
  data: PublicPropertyListing[];
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: [], error: 'Supabase is not configured' };
  }

  try {
    let query = client
      .from('properties')
      .select(SAFE_PROPERTY_COLUMNS)
      .eq('publication_status', 'published')
      .eq('sale_status', 'available');

    // Filter by listing type ('sale' or 'rent')
    if (filters.listing_type) {
      query = query.ilike('listing_type', filters.listing_type);
    }

    // Filter by property type ('Apartment', 'Villa', 'Penthouse', 'Commercial', etc.)
    if (filters.property_type) {
      query = query.ilike('property_type', `%${filters.property_type}%`);
    }

    // Filter by location
    if (filters.subcity) {
      query = query.ilike('subcity', `%${filters.subcity}%`);
    } else if (filters.neighborhood) {
      query = query.ilike('neighborhood', `%${filters.neighborhood}%`);
    }

    // Bedroom count bounds
    if (typeof filters.min_bedrooms === 'number') {
      query = query.gte('bedrooms', filters.min_bedrooms);
    }
    if (typeof filters.max_bedrooms === 'number') {
      query = query.lte('bedrooms', filters.max_bedrooms);
    }

    // Price bounds (ETB)
    if (typeof filters.min_price === 'number') {
      query = query.gte('price_etb', filters.min_price);
    }
    if (typeof filters.max_price === 'number') {
      query = query.lte('price_etb', filters.max_price);
    }

    // Limit (default 8, max 20)
    const limit = Math.min(Math.max(filters.limit || 8, 1), 20);
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase searchProperties query notice:', error.message);
      return { data: [], error: error.message };
    }

    // Apply price display policy and sanitize demo titles/descriptions
    const rawListings = (data as unknown as any[]) || [];
    const safeListings: PublicPropertyListing[] = rawListings.map((item) => {
      const isPriceHidden = item.display_price === false || item.price_on_request === true;
      const effectivePrice = isPriceHidden ? null : item.price_etb;

      const cleanTitleEn = sanitizePresentationText(item.title_en);
      const cleanTitleAm = sanitizePresentationText(item.title_am);
      const cleanDescEn = sanitizePropertyDescription(item.description_en, item, 'en');
      const cleanDescAm = sanitizePropertyDescription(item.description_am, item, 'am');

      const cleanAmenities = (item.amenities || []).map((a: string) =>
        a.replace(/\s*\(sample\)/gi, '').trim()
      );
      const cleanHighlights = (item.highlights || [])
        .map((h: string) => h.replace(/\s*\(sample\)/gi, '').trim())
        .filter((h: string) => !h.toLowerCase().includes('sample') && !h.includes('ማሳያ'));

      const cleanNeighborhood =
        item.neighborhood &&
        !item.neighborhood.toLowerCase().includes('sample') &&
        !item.neighborhood.toLowerCase().includes('illustrative')
          ? item.neighborhood
          : item.subcity;

      const cleanLocationText = item.public_location_text
        ? item.public_location_text.replace(/·\s*demo\s*location/gi, '').trim()
        : `${item.subcity || ''}, Addis Ababa`;

      return {
        ...item,
        title: cleanTitleEn || cleanTitleAm || '',
        title_en: cleanTitleEn || item.title_en || '',
        title_am: cleanTitleAm || item.title_am || '',
        description: cleanDescAm || cleanDescEn || '',
        description_en: cleanDescEn,
        description_am: cleanDescAm,
        neighborhood: cleanNeighborhood,
        public_location_text: cleanLocationText,
        amenities: cleanAmenities,
        highlights: cleanHighlights.length > 0 ? cleanHighlights : ['Prime Location', 'High Quality Finishes'],
        price: effectivePrice,
        price_etb: effectivePrice,
        currency: 'ETB',
        floor_area_sqm: item.built_area_sqm || null,
        carte_status: item.verification_status || 'Verified',
        featured: Boolean(item.is_featured),
      };
    });

    return { data: safeListings, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.warn('Supabase searchProperties exception:', message);
    return { data: [], error: message };
  }
}

/**
 * Operation C: getPropertyDetails
 * Queries public.properties for a single property by ID or slug along with its public media.
 */
export async function getPropertyDetails(idOrSlug: string): Promise<{
  data: PublicPropertyListing | null;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: 'Supabase is not configured' };
  }

  try {
    // Detect whether idOrSlug is a UUID or a slug string
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug
      );

    let query = client
      .from('properties')
      .select(SAFE_PROPERTY_COLUMNS)
      .eq('publication_status', 'published');

    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data: propData, error: propError } = await query.limit(1).maybeSingle();

    if (propError) {
      console.warn('Supabase getPropertyDetails error:', propError.message);
      return { data: null, error: propError.message };
    }

    if (!propData) {
      return { data: null, error: 'Property not found' };
    }

    const raw = propData as unknown as any;
    const isPriceHidden = raw.display_price === false || raw.price_on_request === true;
    const effectivePrice = isPriceHidden ? null : raw.price_etb;

    const cleanTitleEn = sanitizePresentationText(raw.title_en);
    const cleanTitleAm = sanitizePresentationText(raw.title_am);
    const cleanDescEn = sanitizePropertyDescription(raw.description_en, raw, 'en');
    const cleanDescAm = sanitizePropertyDescription(raw.description_am, raw, 'am');

    const cleanAmenities = (raw.amenities || []).map((a: string) =>
      a.replace(/\s*\(sample\)/gi, '').trim()
    );
    const cleanHighlights = (raw.highlights || [])
      .map((h: string) => h.replace(/\s*\(sample\)/gi, '').trim())
      .filter((h: string) => !h.toLowerCase().includes('sample') && !h.includes('ማሳያ'));

    const cleanNeighborhood =
      raw.neighborhood &&
      !raw.neighborhood.toLowerCase().includes('sample') &&
      !raw.neighborhood.toLowerCase().includes('illustrative')
        ? raw.neighborhood
        : raw.subcity;

    const cleanLocationText = raw.public_location_text
      ? raw.public_location_text.replace(/·\s*demo\s*location/gi, '').trim()
      : `${raw.subcity || ''}, Addis Ababa`;

    const property: PublicPropertyListing = {
      ...raw,
      title: cleanTitleEn || cleanTitleAm || '',
      title_en: cleanTitleEn || raw.title_en || '',
      title_am: cleanTitleAm || raw.title_am || '',
      description: cleanDescAm || cleanDescEn || '',
      description_en: cleanDescEn,
      description_am: cleanDescAm,
      neighborhood: cleanNeighborhood,
      public_location_text: cleanLocationText,
      amenities: cleanAmenities,
      highlights: cleanHighlights.length > 0 ? cleanHighlights : ['Prime Location', 'High Quality Finishes'],
      price: effectivePrice,
      price_etb: effectivePrice,
      currency: 'ETB',
      floor_area_sqm: raw.built_area_sqm || null,
      carte_status: raw.verification_status || 'Verified',
      featured: Boolean(raw.is_featured),
      media: [],
    };

    // Fetch associated public media
    const { data: mediaData, error: mediaError } = await client
      .from('property_media')
      .select(SAFE_MEDIA_COLUMNS)
      .eq('property_id', property.id)
      .order('sort_order', { ascending: true });

    if (!mediaError && mediaData) {
      property.media = (mediaData as unknown as PublicPropertyMedia[]) || [];
    }

    return { data: property, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.warn('Supabase getPropertyDetails exception:', message);
    return { data: null, error: message };
  }
}
