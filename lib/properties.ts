export interface PropertyListing {
  id: string;
  title: string;
  title_am: string;
  neighborhood: string;
  subCity: string;
  propertyType: 'Penthouse' | 'Apartment' | 'Villa' | 'Townhouse';
  price_etb: number;
  price_usd: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  carte_status: 'Verified Clean Carte' | 'Developer Carte' | 'Diplomatic Lease';
  amenities: string[];
  description: string;
  description_am: string;
  image_url: string;
  is_demo_listing: boolean;
  status: 'Available' | 'Viewing Available' | 'Under Offer';
}

export const SHEGER_PROPERTIES: PropertyListing[] = [
  {
    id: 'sp-bole-001',
    title: 'The Atlantic Sky Penthouse at Bole Atlas',
    title_am: 'ዘ አትላንቲክ ስካይ ፔንትሀውስ በቦሌ አትላስ',
    neighborhood: 'Bole Atlas',
    subCity: 'Bole',
    propertyType: 'Penthouse',
    price_etb: 145000000,
    price_usd: 1150000,
    bedrooms: 4,
    bathrooms: 4.5,
    area_sqm: 420,
    carte_status: 'Verified Clean Carte',
    amenities: [
      'Panoramic 360° Skyline Terrace',
      'Dual Dedicated Elevators',
      'Continuous 250kVA Generator',
      '50,000L Underground Water Reservoir',
      'Basement Parking (3 stalls)',
      'Italian Valcucine Kitchen & Miele Appliances',
    ],
    description: 'An extraordinary duplex penthouse occupying the entire top two floors overlooking Bole skyline. Features floor-to-ceiling double-glazed windows, private elevator access, expansive entertaining terrace, and biometric security.',
    description_am: 'የቦሌን ሰማይ መስመር የሚመለከት ባለ ሁለት ፎቅ የቅንጦት ፔንትሀውስ። ባለ 4 መኝታ እና 4.5 መታጠቢያ፣ የግል ሊፍት መግቢያ፣ ሰፊ የቴራስ መዝናኛ እና የተረጋገጠ ንጹህ ካርታ ያለው።',
    image_url: '/images/sheger_bole_penthouse.jpg',
    is_demo_listing: false,
    status: 'Viewing Available',
  },
  {
    id: 'sp-oldairport-002',
    title: 'Diplomatic Estate Villa in Old Airport',
    title_am: 'የዲፕሎማቲክ እስቴት ቪላ በኦልድ ኤርፖርት',
    neighborhood: 'Old Airport Diplomatic Zone',
    subCity: 'Nifas Silk / Old Airport',
    propertyType: 'Villa',
    price_etb: 210000000,
    price_usd: 1680000,
    bedrooms: 5,
    bathrooms: 6,
    area_sqm: 680,
    carte_status: 'Verified Clean Carte',
    amenities: [
      'Manicured 1,000 sqm Private Garden',
      'Detached Guardhouse & Maids Quarters',
      'UN Security Clearance Compliant (Safe Haven)',
      'High Perimeter Wall & Perimeter Sensors',
      'Automated Gated Driveway',
      'Solar Backup & 3-Phase Industrial Power',
    ],
    description: 'A distinguished, contemporary residence located within Addis Ababa’s most secure diplomatic enclave. Ideal for ambassadors, senior executives, and discerning families seeking privacy, serene gardens, and verified ownership carte.',
    description_am: 'በኦልድ ኤርፖርት ዲፕሎማቲክ መንደር የሚገኝ ባለ 5 መኝታ ዘመናዊ ቪላ። 1,000 ካሬ ሜትር ያማረ አረንጓዴ ጊቢ፣ የተሟላ የጸጥታ ጥበቃ፣ የጠባቂ ማረፊያ እና ንጹህ የይዞታ ካርታ የተረጋገጠ።',
    image_url: '/images/sheger_old_airport_villa.jpg',
    is_demo_listing: false,
    status: 'Available',
  },
  {
    id: 'sp-kazanchis-003',
    title: 'The Diplomat Residence at Kazanchis',
    title_am: 'ዘ ዲፕሎማት ሬዚደንሻል አፓርታማ በካዛንቺስ',
    neighborhood: 'Kazanchis / UNECA Quarter',
    subCity: 'Kirkos',
    propertyType: 'Apartment',
    price_etb: 78000000,
    price_usd: 620000,
    bedrooms: 3,
    bathrooms: 3,
    area_sqm: 235,
    carte_status: 'Developer Carte',
    amenities: [
      'Walking Distance to UNECA & Hyatt Regency',
      'Heated Indoor Lap Pool & Gym',
      'Concierge Desk & Keycard Lobby',
      'Fiber Optic Ready & Soundproof Glazing',
      'Full Redundant Standby Power',
    ],
    description: 'A sophisticated luxury residence tailored for international diplomats and professionals. Walking distance to UN headquarters, featuring open-plan living, hardwood parquet flooring, and bespoke cabinetry.',
    description_am: 'ለአለም አቀፍ ተቋማት ቅርብ በሆነው ካዛንቺስ የሚገኝ ባለ 3 መኝታ ቅንጦት አፓርታማ። የጋራ መዋኛ ገንዳ፣ ዘመናዊ ጂም፣ 24/7 የኮንሲየርጅ አገልግሎት እና አስተማማኝ ጀነሬተር ያለው።',
    image_url: '/images/sheger_kazanchis_suite.jpg',
    is_demo_listing: false,
    status: 'Viewing Available',
  },
  {
    id: 'sp-cmc-004',
    title: 'Royal Palm Residence at CMC Heights',
    title_am: 'ሮያል ፓልም ሬዚደንስ በሲኤምሲ ሃይትስ',
    neighborhood: 'CMC / Ayat Gateway',
    subCity: 'Yeka',
    propertyType: 'Apartment',
    price_etb: 54000000,
    price_usd: 430000,
    bedrooms: 3,
    bathrooms: 2.5,
    area_sqm: 190,
    carte_status: 'Developer Carte',
    amenities: [
      'Gated Community with Landscaped Courtyard',
      'Children Play Park & Running Track',
      'Underground Resident Parking',
      'Dedicated Commercial Plaza on Ground Level',
      'Dual High-Speed Elevators',
    ],
    description: 'An elegant family apartment situated in the tranquil residential corridor of CMC. Offers master en-suite with balcony, contemporary kitchen, and family-friendly amenities with high rental yield for diaspora investors.',
    description_am: 'በሲኤምሲ ጸጥተኛ የመኖሪያ ቀጠና ውስጥ የሚገኝ ባለ 3 መኝታ ቅንጦት አፓርታማ። ሰፊ በረንዳ፣ ዘመናዊ ማብሰያ ቤት፣ የልጆች መጫወቻ ፓርክ እና ከፍተኛ የኪራይ ገቢ የማስገኘት አቅም ያለው።',
    image_url: '/images/sheger_cmc_residence.jpg',
    is_demo_listing: false,
    status: 'Available',
  },
  {
    id: 'sp-sarbet-005',
    title: 'African Union Vista Residence in Sarbet',
    title_am: 'የአፍሪካ ህብረት ቪስታ ሬዚደንስ በሳርቤት',
    neighborhood: 'Sarbet / AU Area',
    subCity: 'Kirkos',
    propertyType: 'Townhouse',
    price_etb: 98000000,
    price_usd: 780000,
    bedrooms: 4,
    bathrooms: 3.5,
    area_sqm: 310,
    carte_status: 'Verified Clean Carte',
    amenities: [
      '5 Minutes Drive to African Union HQ',
      'Private Rooftop Sundeck',
      '2-Car Covered Garage',
      'Solar Water Heating System',
      'Intercom & Perimeter CCTV',
    ],
    description: 'A contemporary 4-bedroom multi-level townhouse near Sarbet, featuring private rooftop entertaining sundeck, secure double garage, and verified title carte. Ideal for embassy staff and executive buyers.',
    description_am: 'ለአፍሪካ ህብረት ቅርብ በሆነው ሳርቤት የሚገኝ ባለ 4 መኝታ ታውንሃውስ። የግል የጣራ ላይ መዝናኛ፣ የሁለት መኪና ጋራጅ፣ የፀሐይ ኃይል ውኃ ማሞቂያ እና የተረጋገጠ ካርታ ያለው።',
    image_url: '/images/sheger_old_airport_villa.jpg',
    is_demo_listing: false,
    status: 'Viewing Available',
  },
];

export function formatPriceETB(price: number): string {
  return `${(price / 1000000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M ETB`;
}

export function formatPriceUSD(price: number): string {
  return `$${price.toLocaleString('en-US')}`;
}

export function searchProperties(query: string, subCity?: string): PropertyListing[] {
  let results = [...SHEGER_PROPERTIES];
  if (subCity && subCity !== 'All') {
    results = results.filter((p) => p.subCity.toLowerCase().includes(subCity.toLowerCase()));
  }
  if (!query || !query.trim()) {
    return results;
  }
  const q = query.toLowerCase();
  return results.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.title_am.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.propertyType.toLowerCase().includes(q) ||
      p.amenities.some((a) => a.toLowerCase().includes(q))
  );
}
