'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Building2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  BedDouble,
  Bath,
} from 'lucide-react';
import {
  SHEGER_PROPERTIES,
  PropertyListing,
  formatPriceETB,
  formatPriceUSD,
  searchProperties,
} from '@/lib/properties';
import { SupportedLanguageCode, SUPPORTED_LANGUAGES } from '@/lib/languages';

interface PropertyCatalogProps {
  currentLanguage: SupportedLanguageCode;
  onAskAboutProperty: (property: PropertyListing) => void;
  onScheduleTour: (property: PropertyListing) => void;
}

export default function PropertyCatalog({
  currentLanguage,
  onAskAboutProperty,
  onScheduleTour,
}: PropertyCatalogProps) {
  const langConfig = SUPPORTED_LANGUAGES[currentLanguage];
  const [selectedSubCity, setSelectedSubCity] = useState<string>('All');
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);

  const subCities = ['All', 'Bole', 'Kirkos', 'Old Airport', 'Yeka'];

  const filteredProperties = searchProperties('', selectedSubCity);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Sub-city Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-500/20 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Building2 className="w-3.5 h-3.5" />
            <span>Curated Addis Ababa Portfolio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Verified Luxury Residences & Diplomatic Estates
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            All residences feature verified ownership carte, dedicated standby generators, and security clearance.
          </p>
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-700/80 rounded-xl overflow-x-auto max-w-full">
          {subCities.map((subCity) => (
            <button
              key={subCity}
              onClick={() => setSelectedSubCity(subCity)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedSubCity === subCity
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {subCity === 'All' ? 'All Sub-Cities' : subCity}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((prop) => (
          <article
            key={prop.id}
            className="group bg-[#0D1527] border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between"
          >
            {/* Image Box */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
              <Image
                src={prop.image_url}
                alt={prop.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1527] via-transparent to-black/30" />

              {/* Status and Carte badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-medium">
                <span className="bg-slate-950/80 text-amber-300 backdrop-blur-md px-2.5 py-1 rounded-md border border-amber-500/30">
                  {prop.propertyType}
                </span>
                <span className="bg-emerald-950/90 text-emerald-300 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{prop.carte_status}</span>
                </span>
              </div>

              {/* Neighborhood Overlay */}
              <div className="absolute bottom-3 left-3 text-xs text-slate-300 font-medium">
                <span>{prop.neighborhood}, Addis Ababa</span>
              </div>
            </div>

            {/* Property Content */}
            <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                  {currentLanguage === 'am' ? prop.title_am : prop.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {currentLanguage === 'am' ? prop.description_am : prop.description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-amber-400" />
                    <span>{prop.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-3.5 h-3.5 text-amber-400" />
                    <span>{prop.bathrooms} Baths</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{prop.area_sqm} m²</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-xs text-slate-400">Price in ETB / USD</div>
                    <div className="text-base sm:text-lg font-bold font-mono text-amber-300 tabular-nums">
                      {formatPriceETB(prop.price_etb)}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-400 tabular-nums">
                    {formatPriceUSD(prop.price_usd)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  onClick={() => onAskAboutProperty(prop)}
                  className="py-2 px-3 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ask AI</span>
                </button>
                <button
                  onClick={() => onScheduleTour(prop)}
                  className="py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-amber-500/20"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Tour</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
