"use client"
import React, { useState, useEffect } from 'react';
import { Heart, ArrowRight, Users, Globe, TrendingUp, Shield, BookOpen, Droplet, Activity } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const MinimalistCharity = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const causes = [
    {
      number: "01",
      title: "Education",
      stat: "0",
      label: "Comming Soon",
      image: "/c5.jpg",
      color: "emerald"
    },
    {
      number: "02",
      title: "Clean Water",
      stat: "2+",
      label: "Solar Powered Water System",
      image: "/ca2.jpeg",
      color: "blue"
    },
    {
      number: "03",
      title: "Healthcare",
      stat: "0",
      label: "Lives Saved",
      image: "/c7.jpg",
      color: "rose"
    }
    
  ];

  const features = [
    {
      icon: Shield,
      title: "100% Transparency",
      description: "Track every dollar and see exactly where your contribution goes."
    },
    // {
    //   icon: Globe,
    //   title: "Global Reach",
    //   description: "Operating in 25+ countries with local teams on the ground."
    // },
    {
      icon: Users,
      title: "Community Driven",
      description: "Working alongside communities to create lasting solutions."
    },
    {
      icon: TrendingUp,
      title: "Proven Impact",
      description: "Measurable results backed by independent audits and reports."
    }
  ];

  const stories = [
    {
      name: "Maria Judge",
      location: "Nigeria",
      story: "Thanks to your support, our village now has clean water. My children are healthier and can focus on their education.",
      image: "/1.jpg"
    },
    {
      name: "James Okonkwo",
      location: "Nigeria",
      story: "The school program changed everything. Now I'm studying engineering and helping my community build a better future.",
      image: "/3.jpg"
    },
    
  ];

  const impactAreas = [
    { icon: BookOpen, title: "Education", count: "0", desc: "Coming Soon", color: "bg-green-600" },
    { icon: Droplet, title: "Water", count: "2+", desc: "Solar Powered", color: "bg-green-600" },
    { icon: Activity, title: "Healthcare", count: "0", desc: "Coming Soon", color: "bg-green-600" },
    { icon: Users, title: "Community", count: "2+", desc: "Villages empowered", color: "bg-green-600" }
  ];

  return (
    <div className="bg-[#fafffa]">
      {/*  HERO */}
       <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative overflow-hidden pb-12 sm:pb-20">
      {/* Multi-layered dot pattern background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Layer 1 - Large dots */}
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(34, 197, 94, 0.12) 2px, transparent 0)',
            backgroundSize: '40px 40px',
            transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`
          }} 
        />
        {/* Layer 2 - Medium dots */}
        <div 
          className="absolute inset-0 transition-transform duration-500 ease-out"
          style={{
            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(34, 197, 94, 0.08) 1.5px, transparent 0)',
            backgroundSize: '32px 32px',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }} 
        />
        {/* Layer 3 - Small dots */}
        <div 
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.05) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            transform: `translate(${mousePosition.x * 0.008}px, ${mousePosition.y * 0.008}px)`
          }} 
        />
        {/* Layer 4 - Tiny dots */}
        <div 
          className="absolute inset-0 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: 'radial-gradient(circle at 0.5px 0.5px, rgba(34, 197, 94, 0.03) 0.5px, transparent 0)',
            backgroundSize: '16px 16px',
            transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`
          }} 
        />
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10" style={{
        transform: `translateY(${mousePosition.y * 0.08}px)`,
        transition: 'transform 0.3s ease-out'
      }}>
        {/* Minimalist badge */}
        <div className="inline-flex items-center gap-2 mb-6 sm:mb-8 opacity-0 animate-fade-in-down">
          <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
          <span className="text-xs sm:text-sm text-gray-500 tracking-wider uppercase">Since 2023</span>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-light text-gray-900 mb-4 sm:mb-6 tracking-tight px-4">
          <span className="inline-block opacity-0 animate-fade-in-up" style={{animationDelay: '0.1s'}}>Small acts.</span>
          <br />
          <span className="font-semibold text-green-600 inline-block opacity-0 animate-fade-in-up" style={{animationDelay: '0.3s'}}>Big change.</span>
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-gray-500 mb-8 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed opacity-0 animate-fade-in-up px-4" style={{animationDelay: '0.5s'}}>
          Every donation creates ripples of hope across communities worldwide.
        </p>

        {/* Minimal stats */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-12 sm:mb-16 opacity-0 animate-fade-in-up px-4" style={{animationDelay: '0.7s'}}>
          <div>
            <div className="text-3xl sm:text-4xl font-light text-green-600 mb-1">50+</div>
            <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Lives Changed</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <div className="text-3xl sm:text-4xl font-light text-green-600 mb-1">2</div>
            <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Projects Ongoing</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <div className="text-3xl sm:text-4xl font-light text-green-600 mb-1">3</div>
            <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">States</div>
          </div>
        </div>

        {/* Minimal CTA */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center opacity-0 animate-fade-in-up px-4" style={{animationDelay: '0.9s'}}>
          <Link href="/donate">
            <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 flex items-center gap-2 hover:scale-105 text-sm sm:text-base w-full sm:w-auto justify-center">
              Start Giving
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/about">
            <button className="px-6 sm:px-8 py-3 sm:py-4 text-green-600 hover:text-green-700 transition-colors hover:scale-105 text-sm sm:text-base w-full sm:w-auto">
              Learn Our Story
            </button>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 sm:mt-16 opacity-0 animate-fade-in" style={{animationDelay: '1.2s'}}>
          <div className="w-6 h-10 sm:w-8 sm:h-14 border-2 border-gray-300 rounded-full flex items-start justify-center p-1.5 sm:p-2 mx-auto">
            <div className="w-1 h-2 sm:w-1.5 sm:h-3 bg-green-600 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
      </section>


      {/* PARTNERS SECTION */}
      <section className="py-16 sm:py-20 px-6 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center ">
            <span className="text-xs font-bold sm:text-lg text-gray-500 uppercase tracking-wider">Our</span>
          </div>
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-xs font-bold sm:text-lg text-gray-500 uppercase tracking-wider">Trusted Partners</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            {/* Grow with Google */}
            <a 
              href="https://grow.google" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group cursor-pointer transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <Image
                  src="/grow-with-google-logo.png"
                  alt="Grow with Google"
                  width={160}
                  height={60}
                  className="h-10 sm:h-12 w-auto"
                />
              </div>
            </a>
                 
            {/* Divider */}
                 <div className="hidden sm:block w-px h-12 bg-gray-200" />
            <div className="sm:hidden w-12 h-px bg-gray-200" />

           <a 
              href="https://goodstack.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group cursor-pointer transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <Image
                  src="/60.png"
                  alt="GoodStack"
                  width={160}
                  height={60}
                  className="h-10 sm:h-12 w-auto"
                />
              </div>
            </a>

            {/* Divider */}
            <div className="hidden sm:block w-px h-12 bg-gray-200" />
            <div className="sm:hidden w-12 h-px bg-gray-200" />

            {/* TechSoup */}
            <a 
              href="https://www.techsoup.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group cursor-pointer transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <Image
                  src="/TechSoup-US-Logo.png"
                  alt="TechSoup"
                  width={160}
                  height={60}
                  className="h-10 sm:h-12 w-auto"
                />
              </div>
            </a>
          </div>

        </div>
      </section>




      {/*  IMPACT SECTION */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-20">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Impact</span>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mt-4">
              Where we <span className="font-semibold text-green-600">make a difference</span>
            </h2>
          </div>

          {/* Minimal cards grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {causes.map((cause, idx) => (
              <div
                key={idx}
                className="group cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] mb-6 overflow-hidden rounded-2xl bg-gray-100">
                  <Image
              width={1000}
              height={1000}
                    src={cause.image}
                    alt={cause.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Minimal overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Number badge */}
                  <div className="absolute top-6 left-6">
                    <span className="text-white/80 text-sm font-light">{cause.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-light text-gray-900 group-hover:text-green-600 transition-colors">
                    {cause.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-green-600">{cause.stat}</span>
                    <span className="text-sm text-gray-500">{cause.label}</span>
                  </div>
                  <div className="w-12 h-px bg-green-600 group-hover:w-24 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="py-32 px-6 bg-[#fafffa]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mt-4">
              Built on <span className="font-semibold text-green-600">trust</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, idx) => (
              <div key={idx} className="group">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-600/10 flex items-center justify-center group-hover:bg-green-600 transition-all duration-300 group-hover:scale-110">
                    <feature.icon className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  AREAS HORIZONTAL SCROLL */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Real Impact</span>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mt-4">
              We don&apos;t just help.
              <br />
              <span className="font-semibold text-green-600">We transform.</span>
            </h2>
          </div>

          {/* Cards grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactAreas.map((area, idx) => (
              <div key={idx} className="group">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 h-full hover:border-green-600 transition-all duration-300 hover:shadow-lg">
                  <div className="w-12 h-12 bg-green-600/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors duration-300">
                    <area.icon className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-4xl font-light text-green-600 mb-2">{area.count}</div>
                  <div className="text-xl font-light text-gray-900 mb-2">{area.title}</div>
                  <div className="text-gray-500 text-sm">{area.desc}</div>
                  
                  {/* Minimal line indicator */}
                  <div className="mt-6 w-12 h-px bg-green-600 group-hover:w-24 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Real Stories</span>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mt-4">
              Voices of <span className="font-semibold text-green-600">change</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {stories.map((story, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-4">
                    <Image
              width={1000}
              height={1000}
               src={story.image} alt={story.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-light text-gray-900 mb-1">{story.name}</div>
                    <div className="text-sm text-gray-500">{story.location}</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">&quot;{story.story}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MINIMAL QUOTE SECTION */}
      <section className="py-32 px-6 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl md:text-4xl font-light mb-8 leading-relaxed">
            &quot;The best way to find yourself is to lose yourself in the service of others.&quot;
          </blockquote>
          <cite className="text-sm text-green-100 not-italic uppercase tracking-wider">
            — Mahatma Gandhi
          </cite>
        </div>
      </section>

      {/* MINIMAL STATS SECTION */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left - Stats */}
            <div className="space-y-12">
              <div>
                <span className="text-sm text-gray-500 uppercase tracking-wider">Transparency</span>
                <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-4">
                  Every dollar <span className="font-semibold text-green-600">tracked</span>
                </h2>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-8">
                  <div className="text-6xl font-light text-green-600">99%</div>
                  <div className="flex-1">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full transition-all duration-1000" style={{width: '99%'}} />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Goes directly to programs</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-6xl font-light text-green-600">100%</div>
                  <div className="flex-1">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full transition-all duration-1000" style={{width: '100%'}} />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Financial transparency</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group">
              <Image
              width={1000}
              height={1000}
                src="/nnn.jpg"
                alt="Impact"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MINIMAL CTA */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-green-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6">
              Ready to make an <span className="font-semibold">impact?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-green-100 mb-8 sm:mb-10 md:mb-12 font-light px-4">
              Join thousands of donors creating change around the world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/donate">
                <button className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-green-600 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 text-sm sm:text-base">
                  Donate Now
                  <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/20 text-white rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105 text-sm sm:text-base">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </section>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MinimalistCharity;