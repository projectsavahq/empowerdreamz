"use client"

import React from 'react';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  featured?: boolean;
}

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

export default function PartnersPage() {
  return (
    <div className="bg-[#fafffa] min-h-screen">
      <section className="py-20 px-6">
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
        </div>
      </section>
    </div>
  );
}