'use client';

import React, { useState } from 'react';
import { X, Building2, CheckCircle2 } from 'lucide-react';
import { SupportedLanguageCode, SUPPORTED_LANGUAGES } from '@/lib/languages';

interface ValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguageCode;
}

export default function ValuationModal({
  isOpen,
  onClose,
  currentLanguage,
}: ValuationModalProps) {
  const langConfig = SUPPORTED_LANGUAGES[currentLanguage];
  const [subCity, setSubCity] = useState('Bole');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [areaSqm, setAreaSqm] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [carteStatus, setCarteStatus] = useState('Verified Clean Carte');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [valRef, setValRef] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !phone) return;
    const refCode = `VAL-${Math.floor(1000 + Math.random() * 9000)}`;
    setValRef(refCode);
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setOwnerName('');
    setPhone('');
    setAreaSqm('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-amber-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Close */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Valuation Request Registered</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Our property appraisal team will review comparable transactions in {subCity} and contact you within 24 hours.
              </p>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono space-y-1">
              <div className="text-slate-400">Valuation Docket:</div>
              <div className="text-base font-bold text-amber-300">{valRef}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Owner: {ownerName} · {phone}
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs sm:text-sm transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Building2 className="w-3.5 h-3.5" />
                <span>Sheger Prime Brokerage & Advisory</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Request Property Valuation & Listing
              </h3>
              <p className="text-xs text-slate-400">
                Accurate Comparative Market Analysis (CMA) tailored for premium Addis Ababa real estate sales.
              </p>
            </div>

            {/* SubCity & Property Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Sub-City Location</label>
                <select
                  value={subCity}
                  onChange={(e) => setSubCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="Bole">Bole (Atlas / Rwanda / Medhanialem)</option>
                  <option value="Old Airport">Old Airport / Diplomatic Quarter</option>
                  <option value="Kazanchis">Kazanchis / UNECA Zone</option>
                  <option value="CMC">CMC / Ayat Corridor</option>
                  <option value="Sarbet">Sarbet / African Union</option>
                  <option value="Meganagna">Meganagna / Summit</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Property Category</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="Apartment">Luxury Apartment</option>
                  <option value="Penthouse">Duplex / Penthouse</option>
                  <option value="Villa">Standalone Villa</option>
                  <option value="Townhouse">Townhouse / Compound</option>
                  <option value="Commercial">Commercial / Mixed Use</option>
                </select>
              </div>
            </div>

            {/* Sq Meters & Carte Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Approx Area (m²)</label>
                <input
                  type="number"
                  placeholder="e.g. 250"
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Title Deed / Carte Status</label>
                <select
                  value={carteStatus}
                  onChange={(e) => setCarteStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="Verified Clean Carte">Verified Clean Carte (ካርታ)</option>
                  <option value="Developer Carte">Developer Carte / Lease Contract</option>
                  <option value="Under Process">Ownership Transfer in Progress</option>
                </select>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Owner / Representative Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahel Tadesse"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Phone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="+251 9... or Diaspora #"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all"
              >
                Submit for Professional Valuation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
