"use client"

import React, { useState, useEffect } from 'react';
import { Loader2, ExternalLink, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  amount?: number;
  project?: string;
  note?: string;
  date?: string;
  featured?: boolean;
}

// The 3 existing partners hardcoded as foundation — 
// admin-added partners from Firestore will appear alongside these
const FOUNDING_PARTNERS: Partner[] = [
  {
    id: 'grow-with-google',
    name: 'Grow with Google',
    logo: '/grow-with-google-logo.png',
    website: 'https://grow.google',
    featured: true,
  },
  {
    id: 'goodstack',
    name: 'GoodStack',
    logo: '/60.png',
    website: 'https://goodstack.org/',
    featured: true,
  },
  {
    id: 'techsoup',
    name: 'TechSoup',
    logo: '/TechSoup-US-Logo.png',
    website: 'https://www.techsoup.org',
    featured: true,
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

export default function PartnersPage() {
  const [firestorePartners, setFirestorePartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'partners'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Partner));
      setFirestorePartners(data);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, []);

  // Partners with a donation amount (from Firestore)
  const contributingPartners = firestorePartners.filter(p => p.amount && p.amount > 0);
  const totalContributed = contributingPartners.reduce((sum, p) => sum + (p.amount || 0), 0);

  // All display partners: founding + firestore (deduped by name)
  const foundingIds = new Set(FOUNDING_PARTNERS.map(p => p.name.toLowerCase()));
  const additionalPartners = firestorePartners.filter(p => !foundingIds.has(p.name.toLowerCase()));

  return (
    <div className="bg-[#fafffa] min-h-screen">

      {/* HERO */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(22 163 74) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            <span className="text-sm text-gray-500 tracking-wider uppercase">Our Network</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-6 leading-tight">
            Partners in <span className="font-semibold text-green-600">Impact</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed mb-12">
            We don&apos;t do this alone. These organisations believe in our mission and help us scale our impact across communities.
          </p>

          {/* Total contributed stat — only show if there's data */}
          {totalContributed > 0 && (
            <div className="inline-flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-8 py-5 shadow-sm">
              <div className="text-left">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Partner Contributions</p>
                <p className="text-3xl font-light text-green-600">{formatCurrency(totalContributed)}</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-left">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contributing Partners</p>
                <p className="text-3xl font-light text-gray-900">{contributingPartners.length}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FOUNDING PARTNERS */}
      <section className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Trusted By</span>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-3">
              Our <span className="font-semibold text-green-600">Partners</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FOUNDING_PARTNERS.map(partner => (
              <a
                key={partner.id}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-3xl border border-gray-100 p-10 flex flex-col items-center justify-center hover:border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-16 w-full mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100">
                  <Image src={partner.logo} alt={partner.name} fill className="object-contain" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">{partner.name}</p>
                <div className="flex items-center gap-1 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Visit site</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>

          {/* Additional Firestore partners that aren't in founding list */}
          {additionalPartners.length > 0 && (
            <div className="grid md:grid-cols-3 gap-8 mt-8">
              {additionalPartners.map(partner => (
                <a
                  key={partner.id}
                  href={partner.website || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-3xl border border-gray-100 p-10 flex flex-col items-center justify-center hover:border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {partner.logo ? (
                    <div className="relative h-16 w-full mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100">
                      <Image src={partner.logo} alt={partner.name} fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="h-16 w-full mb-6 flex items-center justify-center">
                      <span className="text-2xl font-light text-gray-400">{partner.name}</span>
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-900 mb-1">{partner.name}</p>
                  {partner.website && (
                    <div className="flex items-center gap-1 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Visit site</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTRIBUTIONS SECTION — only shows if admin has added partner contributions */}
      {loading ? (
        <section className="py-20 px-6 flex justify-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </section>
      ) : contributingPartners.length > 0 && (
        <section className="py-20 px-6 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14">
              <span className="text-sm text-gray-500 uppercase tracking-wider">Transparency</span>
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-3">
                Partner <span className="font-semibold text-green-600">Contributions</span>
              </h2>
              <p className="text-gray-500 mt-3 font-light">
                In the spirit of full transparency, here is a record of all partner and corporate contributions.
              </p>
            </div>

            <div className="space-y-4">
              {contributingPartners.map(partner => (
                <div key={partner.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between gap-6 hover:border-green-100 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    {/* Logo or name initial */}
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {partner.logo ? (
                        <div className="relative w-full h-full p-2">
                          <Image src={partner.logo} alt={partner.name} fill className="object-contain p-2" />
                        </div>
                      ) : (
                        <span className="text-xl font-light text-gray-400">{partner.name.charAt(0)}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-0.5">{partner.name}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        {partner.project && (
                          <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
                            {partner.project}
                          </span>
                        )}
                        {partner.date && (
                          <span className="text-xs text-gray-400">
                            {new Date(partner.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                        )}
                        {partner.note && (
                          <span className="text-xs text-gray-500 italic truncate">{partner.note}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-light text-green-600">{formatCurrency(partner.amount || 0)}</p>
                    <p className="text-xs text-gray-400">Contribution</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 bg-green-600 rounded-2xl p-6 flex items-center justify-between">
              <p className="text-white font-light text-lg">Total Partner Contributions</p>
              <p className="text-3xl font-light text-white">{formatCurrency(totalContributed)}</p>
            </div>
          </div>
        </section>
      )}

      {/* BECOME A PARTNER CTA */}
      <section className="py-32 px-6 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-12 h-12 text-green-300 mx-auto mb-6" />
          <h2 className="text-5xl md:text-6xl font-light mb-6">
            Want to <span className="font-semibold">partner with us?</span>
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Whether you&apos;re a corporation, foundation, or community organisation — let&apos;s create impact together.
          </p>
          <Link href="/contact">
            <button className="px-8 py-4 bg-white text-green-600 rounded-full hover:bg-gray-100 transition-all duration-300 font-light">
              Get In Touch
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}