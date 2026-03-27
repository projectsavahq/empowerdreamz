"use client"
import React from 'react';
import { Heart, Users, Globe, Lightbulb, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import DonateButton from '@/app/components/donateButton';

const WhyWeExistPage = () => {
  const coreValues = [
    {
      icon: Heart,
      title: "Compassion in Action",
      description: "We believe every person deserves dignity, opportunity, and hope. Our work is driven by empathy and a deep commitment to human welfare."
    },
    {
      icon: Users,
      title: "Community Empowerment",
      description: "We don't just provide aid—we build capacity. Our approach ensures communities can sustain progress long after our involvement."
    },
    {
      icon: Globe,
      title: "Global Solidarity",
      description: "Borders don't limit our compassion. We stand with underserved communities worldwide, creating bridges of support and understanding."
    },
    {
      icon: Lightbulb,
      title: "Innovation for Impact",
      description: "We embrace creative solutions and technology to maximize our reach and effectiveness in addressing critical needs."
    }
  ];

  const impactStories = [
    {
      image: "/c1.jpg",
      stat: "0",
      label: "Children Educated",
      description: "Comming Soon"
    },
    {
      image: "/c2.jpg",
      stat: "1+",
      label: "Communities Served",
      description: "Building infrastructure that lasts generations"
    },
    {
      image: "/7.jpg",
      stat: "0",
      label: "Meals Provided",
      description: "Comming Soon "
    },
    {
      image: "/nnn.jpg",
      stat: "2+",
      label: "Solar Powered Water System ",
      description: "Clean water is a fundamental human right"
    }
  ];

  return (
    <div className="bg-[#fafffa]">
      {/*  HERO Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(22 163 74) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              <span className="text-sm text-gray-500 tracking-wider uppercase">Our Purpose</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-light text-gray-900 mb-6 leading-tight">
              Why We <span className="font-semibold text-green-600">Exist</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-light">
              In a world of abundance, millions still lack basic necessities. We exist to bridge that gap.
            </p>
          </div>

          {/* Image Grid - keeping your original structure but minimalist */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="relative h-80 rounded-2xl overflow-hidden bg-gray-100 group">
              <Image
                width={1000}
                height={1000}
              src="/c3.jpg" 
              alt="Education" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-2xl font-light mb-1">Education</p>
                <p className="text-sm text-white/80">Building brighter futures</p>
              </div>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden bg-gray-100 md:mt-8 group">
              <Image
                width={1000}
                height={1000}
                src="/c9.jpg" alt="Healthcare" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-2xl font-light mb-1">Healthcare</p>
                <p className="text-sm text-white/80">Saving lives, restoring hope</p>
                <p className="text-sm text-white/80">Comming soon</p>
              </div>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden bg-gray-100 group">
              <Image
              width={1000}
              height={1000}
               src="/cf.jpg" alt="Development" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-2xl font-light mb-1">Development</p>
                <p className="text-sm text-white/80">Sustainable solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE REALITY */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm text-gray-500 uppercase tracking-wider">The Challenge</span>
              <h2 className="text-5xl md:text-6xl font-light text-gray-900 mt-4 mb-8 leading-tight">
                The reality we <span className="font-semibold text-green-600">face</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Every day, countless children wake up without access to education, families struggle without clean water, and communities face insurmountable barriers to healthcare and economic opportunity.
                </p>
                <p>
                  These aren&apos;t just statistics—they&apos;re real people with dreams, potential, and the right to a dignified life.
                </p>
                <p className="text-gray-900 font-light text-2xl">
                  We exist because inaction is not an option.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-4xl font-light text-green-600 mb-2">785M</p>
                    <p className="text-gray-900 font-light text-lg">People lack access to clean water</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-4xl font-light text-green-600 mb-2">258M</p>
                    <p className="text-gray-900 font-light text-lg">Children out of school globally</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-4xl font-light text-green-600 mb-2">690M</p>
                    <p className="text-gray-900 font-light text-lg">People living in extreme poverty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR APPROACH */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Our Solution</span>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mt-4 mb-6">
              Our approach to <span className="font-semibold text-green-600">change</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light">
              We don&apos;t believe in temporary fixes. We create sustainable, community-driven solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="group">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-600/10 flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
                    <value.icon className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Our Impact</span>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mt-4 mb-6">
              The impact we&apos;ve made <span className="font-semibold text-green-600">together</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light">
              Thanks to supporters like you, we&apos;re making a real, measurable difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactStories.map((story, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl bg-gray-100 h-96">
                <Image
              width={1000}
              height={1000}
                  src={story.image} 
                  alt={story.label} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-4xl font-light mb-2">{story.stat}</p>
                  <p className="text-lg font-light mb-1">{story.label}</p>
                  <p className="text-sm text-white/80">{story.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-green-600 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          <div className="space-y-4 sm:space-y-6">
            <span className="text-xs sm:text-sm text-green-100 uppercase tracking-wider">Our Vision</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight">
              A world where everyone <span className="font-semibold">thrives</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-green-50 leading-relaxed font-light">
              We envision a world where every child receives quality education, every family has access to clean water and healthcare, and every community has the tools to build sustainable prosperity.
            </p>
            <p className="text-base sm:text-lg md:text-xl text-green-50 leading-relaxed font-light">
              This isn&apos;t just a dream—it&apos;s a mission we&apos;re actively pursuing every single day, one community at a time.
            </p>

            <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Image 
                src="/wb.png" 
                width={40} 
                height={40} 
                alt="Logo" 
                className="rounded-full sm:w-[50px] sm:h-[50px]"
              />
              <div>
                <p className="font-light text-lg sm:text-xl md:text-2xl">Together, We Can Do This</p>
                <p className="text-green-100 text-xs sm:text-sm">Join us in creating lasting change</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-gray-900">
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 mb-3 sm:mb-4" />
              <p className="text-3xl sm:text-4xl md:text-5xl font-light text-green-600 mb-1 sm:mb-2">2X</p>
              <p className="text-sm sm:text-base text-gray-600">Growth in 1 Years</p>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-gray-900 mt-6 sm:mt-8">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 mb-3 sm:mb-4" />
              <p className="text-3xl sm:text-4xl md:text-5xl font-light text-green-600 mb-1 sm:mb-2">100%</p>
              <p className="text-sm sm:text-base text-gray-600">Transparency</p>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-gray-900">
              <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 mb-3 sm:mb-4" />
              <p className="text-3xl sm:text-4xl md:text-5xl font-light text-green-600 mb-1 sm:mb-2">2+</p>
              <p className="text-sm sm:text-base text-gray-600">Active Projects</p>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-gray-900 mt-6 sm:mt-8">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 mb-3 sm:mb-4" />
              <p className="text-3xl sm:text-4xl md:text-5xl font-light text-green-600 mb-1 sm:mb-2">15+</p>
              <p className="text-sm sm:text-base text-gray-600">Donors</p>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Be part of the <span className="font-semibold text-green-600">solution</span>
          </h2>
          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            We exist because of people like you who believe in the power of collective action. Your support creates ripples of change that transform entire communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <DonateButton />
            <Link href="/contact">
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-full hover:border-green-600 transition-all duration-300">
                Get Involved
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyWeExistPage;