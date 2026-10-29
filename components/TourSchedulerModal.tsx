'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, CheckCircle2 } from 'lucide-react';
import { PropertyListing, SHEGER_PROPERTIES } from '@/lib/properties';
import { SupportedLanguageCode, SUPPORTED_LANGUAGES } from '@/lib/languages';

interface TourSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProperty?: PropertyListing | null;
  currentLanguage: SupportedLanguageCode;
}

export default function TourSchedulerModal({
  isOpen,
  onClose,
  preSelectedProperty,
  currentLanguage,
}: TourSchedulerModalProps) {
  const langConfig = SUPPORTED_LANGUAGES[currentLanguage];
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    preSelectedProperty?.id || SHEGER_PROPERTIES[0].id
  );
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - Morning');
  const [tourType, setTourType] = useState<'in_person' | 'virtual'>('in_person');
  const [needsAirportPickup, setNeedsAirportPickup] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    const refCode = `SHG-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingRef(refCode);
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setFullName('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-amber-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Close Button */}
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
              <h3 className="text-xl font-bold text-white">Viewing Tour Confirmed</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                A Sheger Prime senior broker has reserved your private appointment.
              </p>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono space-y-1">
              <div className="text-slate-400">Appointment Reference:</div>
              <div className="text-base font-bold text-amber-300">{bookingRef}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Client: {fullName} · {phone}
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
                <Calendar className="w-3.5 h-3.5" />
                <span>Sheger Prime Private Concierge</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Schedule a Residence Viewing Tour
              </h3>
              <p className="text-xs text-slate-400">
                Private escorted tour with an authorized Sheger Prime representative and full title carte inspection.
              </p>
            </div>

            {/* Property Selector */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Residence</span>
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {SHEGER_PROPERTIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            {/* Tour Format */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTourType('in_person')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-colors ${
                  tourType === 'in_person'
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                In-Person Guided Tour
              </button>
              <button
                type="button"
                onClick={() => setTourType('virtual')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-colors ${
                  tourType === 'virtual'
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                Live Video (Diaspora)
              </button>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-400" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawit Kebede"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span>Phone / WhatsApp</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+251 9... or +1 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>Preferred Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Time Slot</span>
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option>10:00 AM - Morning</option>
                  <option>02:00 PM - Afternoon</option>
                  <option>04:30 PM - Golden Hour Tour</option>
                </select>
              </div>
            </div>

            {/* Airport Pickup Option */}
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={needsAirportPickup}
                onChange={(e) => setNeedsAirportPickup(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
              />
              <span>Request executive chauffeur pickup from Bole Airport or Hotel</span>
            </label>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all"
              >
                Confirm Viewing Appointment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
