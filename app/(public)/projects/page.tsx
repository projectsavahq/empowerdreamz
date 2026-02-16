"use client"
import React, { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Users, Droplet, GraduationCap, UtensilsCrossed, Loader2, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust path to your firebase config

interface Project {
  id: string;
  image: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  tagline: string;
  callToAction: string;
  raised: number;
  goal: number;
  progress: number;
  supporters: number;
  tag: string;
  isLive: boolean;
  category: string;
}

const CharityProjectsPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);

  // Fetch projects from Firestore with real-time updates
  useEffect(() => {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          image: data.image || "/drpp.png",
          icon: data.category === 'water' ? Droplet : 
                data.category === 'education' ? GraduationCap : 
                UtensilsCrossed,
          title: data.title || "Project",
          subtitle: data.subtitle || "",
          description: data.description || "",
          tagline: data.tagline || "",
          callToAction: data.callToAction || "Donate to make a difference",
          raised: data.raised || 0,
          goal: data.goal || 50000,
          progress: data.goal > 0 ? Math.round((data.raised / data.goal) * 100) : 0,
          supporters: data.supporters || 0,
          tag: data.tag || "Ongoing Initiative",
          isLive: data.isLive || false,
          category: data.category || 'general'
        };
      });

      // Always set projects data (use Firestore data if available, otherwise fallback)
      if (projectsData.length === 0) {
        setIsLiveData(false);
        setProjects([
          {
            id: 'default-1',
            image: "/drpp.png",
            icon: Droplet,
            title: "Drops of Hope",
            subtitle: "Together for Change",
            description: "Help us provide clean water access for rural communities in Nigeria.",
            tagline: "Empowering Lives with Water",
            callToAction: "Donate to make a difference",
            raised: 0,
            goal: 50000,
            progress: 0,
            supporters: 0,
            tag: "Ongoing Initiative",
            isLive: true,
            category: 'water'
          }
        ]);
      } else {
        setIsLiveData(true);
        setProjects(projectsData);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Error fetching projects:', error);
      // Even on error, show fallback data
      setIsLiveData(false);
      setProjects([
        {
          id: 'default-1',
          image: "/drpp.png",
          icon: Droplet,
          title: "Drops of Hope",
          subtitle: "Together for Change",
          description: "Help us provide clean water access for rural communities in Nigeria.",
          tagline: "Empowering Lives with Water",
          callToAction: "Donate to make a difference",
          raised: 0,
          goal: 50000,
          progress: 0,
          supporters: 0,
          tag: "Ongoing Initiative",
          isLive: true,
          category: 'water'
        }
      ]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const donorImages = [
    "/da.jpg",
    "/db.jpg",
    "/dc.jpg",
    "/dd.jpg",
    "/ca.jpg",
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafffa] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-light">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Remove the "no projects" check - always show the page with fallback data

  return (
    <div className="bg-[#fafffa]">
      {/* HERO Section */}
      <section className="min-h-screen flex items-center px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(22 163 74) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <span className="text-sm text-gray-500 uppercase tracking-wider">Our Projects</span>
                <h1 className="text-6xl md:text-7xl font-light text-gray-900 mt-4 mb-6 leading-tight">
                  We stand by the
                  <br />
                  <span className="font-semibold text-green-600">helpless children</span>
                </h1>
                <p className="text-xl text-gray-500 font-light leading-relaxed">
                  There are many variations of passages available, but the majority have suffered alteration in some form.
                </p>
              </div>

              {/* Donor Section */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex -space-x-2">
                    {donorImages.slice(0, 5).map((img, i) => (
                      <div
                        key={i}
                        className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                      >
                        <Image
                          width={1000}
                          height={1000}
                          src={img}
                          alt={`Donor ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-light text-gray-900">Be Part of Our Mission</p>
                    <p className="text-sm text-gray-500">
                      Together, we can create lasting change.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link href="/donate">
                <button className="px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300">
                  Support a Project
                </button>
              </Link>
            </div>

            {/* Right - Image Grid */}
            <div className="relative">
              <div className="space-y-4">
                {/* Top Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100">
                    <Image
                        width={1000}
                        height={1000}
                        src="/c1.jpg" 
                        alt="Community" 
                        className="w-full h-full object-cover" />
                  </div>
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100 mt-8">
                    <Image
                      width={1000}
                      height={1000} 
                      src="/c2.jpg" 
                      alt="Education"
                      className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Middle Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100">
                    <Image
                      width={1000}
                      height={1000}
                        src="/c9.jpg" 
                        alt="Volunteers" 
                        className="w-full h-full object-cover" />
                  </div>
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100 mt-8">
                    <Image
                      width={1000}
                      height={1000} 
                      src="/cf.jpg" 
                      alt="Impact"
                      className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100 mt-4">
                    <Image
                      width={1000}
                      height={1000}
                        src="/c3.jpg" 
                        alt="Healthcare" 
                        className="w-full h-full object-cover" />
                  </div>
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100">
                    <Image
                      width={1000}
                      height={1000} 
                      src="/c4.jpg" 
                      alt="Development" 
                      className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute top-6 -right-4 bg-white rounded-2xl p-4 w-[140px] shadow-xl z-20">
                <div className="relative w-full h-[80px] rounded-lg overflow-hidden mb-2 bg-gray-100">
                  <Image
                                  width={1}
                                  height={1}
                   src="/c8.jpg" alt="Project" className="w-full h-full object-cover" />
                </div>
                <p className="text-green-600 font-light text-sm">Stand With Us</p>
                <p className="text-xs text-gray-500">Join our mission</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Images */}
            <div className="grid grid-cols-2 gap-6">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  width={1000}
                  height={1000} 
                  src="/6.jpg" 
                  alt="Volunteers" 
                  className="w-full h-full object-cover" />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mt-8">
                <Image
                  width={1000}
                  height={1000} 
                  src="/cf.jpg"                           
                  alt="Community"
                  className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="text-sm text-gray-500 uppercase tracking-wider">Our Mission</span>
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-4 mb-6 leading-tight">
                Creating sustainable <span className="font-semibold text-green-600">impact</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Every project we undertake is designed with sustainability and community ownership in mind. We work directly with local leaders and organizations to ensure that our initiatives create lasting positive change.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Our approach focuses on empowerment rather than dependency, providing communities with the tools, resources, and knowledge they need to thrive independently.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div>
                  <div className="text-4xl font-light text-green-600 mb-1">25+</div>
                  <div className="text-sm text-gray-500">Active Projects</div>
                </div>
                <div>
                  <div className="text-4xl font-light text-green-600 mb-1">150K+</div>
                  <div className="text-sm text-gray-500">Lives Impacted</div>
                </div>
                <div>
                  <div className="text-4xl font-light text-green-600 mb-1">5</div>
                  <div className="text-sm text-gray-500">Countries</div>
                </div>
              </div>

              <Link href="/contact">
                <button className="px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 flex items-center gap-2">
                  Next Project
                  <Image
                                 src="/grl.png" width={24} height={24} alt="Arrow" className="w-6 h-6" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION - WITH LIVE DATA */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="inline-flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600" />
                <span className="text-sm text-gray-500 tracking-wider uppercase">Ongoing Initiatives</span>
              </div>
              <div className="relative w-24 h-24">
                <Image
                  src="/nobg.png"
                  alt="Empowering Dreamers Foundation"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
              Drops of <span className="font-semibold text-green-600">Hope</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light">
              Together for change. Each project represents a promise to communities in need.
            </p>
            
            {/* Data Source Indicator */}
            
          </div>

          {/* Featured Project Showcase */}
          <div className="mb-20">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="grid lg:grid-cols-2">
                {/* Image Side */}
                <div className="relative h-[500px] lg:h-auto bg-gray-100">
                  <Image
                    fill
                    src={projects[currentSlide].image}
                    alt={projects[currentSlide].title}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  
                  {/* Category Tag */}
                  <div className="absolute top-6 left-6 flex items-center gap-3">
                    {/* Live Indicator */}
                    {projects[currentSlide].isLive && (
                      <div className="bg-red-600 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-lg border-2 border-white">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </div>
                        <span className="text-sm font-semibold text-white uppercase tracking-wide">LIVE NOW</span>
                      </div>
                    )}
                    
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                      {React.createElement(projects[currentSlide].icon, { className: "h-4 w-4 text-green-600" })}
                      <span className="text-sm font-light text-gray-900">{projects[currentSlide].tag}</span>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-10 lg:p-12 flex flex-col justify-between">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-5xl md:text-6xl font-light text-gray-900 mb-3 leading-tight uppercase tracking-wide">
                        {projects[currentSlide].title}
                      </h3>
                      {projects[currentSlide].subtitle && (
                        <p className="text-xl md:text-2xl font-light text-green-600 uppercase tracking-wide">
                          {projects[currentSlide].subtitle}
                        </p>
                      )}
                    </div>

                    <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed mb-8">
                      {projects[currentSlide].description}
                    </p>

                    {projects[currentSlide].tagline && (
                      <div className="mb-10">
                        <p className="text-2xl md:text-3xl font-light text-gray-900 leading-relaxed">
                          {projects[currentSlide].tagline}
                        </p>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="text-sm text-gray-500 mb-1">Raised</div>
                        <div className="text-3xl font-light text-green-600">
                          {formatCurrency(projects[currentSlide].raised)}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="text-sm text-gray-500 mb-1">Goal</div>
                        <div className="text-3xl font-light text-gray-900">
                          {formatCurrency(projects[currentSlide].goal)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-500">Campaign Progress</span>
                        <span className="text-sm font-light text-green-600">{projects[currentSlide].progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600 rounded-full transition-all duration-1000"
                          style={{ width: `${projects[currentSlide].progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Supporters */}
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                      <div className="flex -space-x-2">
                        {donorImages.slice(0, 4).map((img, i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                          >
                            <Image
                              width={1}
                              height={1}
                              src={img}
                              alt={`Supporter ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-light text-gray-900">{projects[currentSlide].supporters} supporters</p>
                        <p className="text-xs text-gray-500">Join them in making a difference</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    {projects[currentSlide].callToAction && (
                      <p className="text-base font-light text-gray-600 uppercase tracking-wide">
                        {projects[currentSlide].callToAction}
                      </p>
                    )}
                    <div className="flex gap-4">
                      <Link href="/donate" className="flex-1">
                        <button className="w-full px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 font-light">
                          Support This Project
                        </button>
                      </Link>
                      <button className="px-6 py-4 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                        <Heart className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center items-center gap-6 mt-8">
              <button
                onClick={prevSlide}
                className="p-4 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-300 hover:border-green-600 group"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 group-hover:text-green-600" />
              </button>
              
              <div className="flex gap-3">
                {projects.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide 
                        ? 'bg-green-600 w-12 h-2' 
                        : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-4 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-300 hover:border-green-600 group"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-green-600" />
              </button>
            </div>
          </div>

          {/* All Projects Grid */}
          <div>
            <h3 className="text-2xl font-light text-gray-900 mb-8">All Active Projects</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`text-left bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border ${
                    index === currentSlide ? 'border-green-600 shadow-md' : 'border-gray-100'
                  }`}
                >
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      fill
                      src={project.image}
                      alt={project.title}
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-light text-green-600">
                      {project.progress}% funded
                    </div>
                    
                    {/* Live Badge */}
                    {project.isLive && (
                      <div className="absolute top-4 left-4 bg-red-600 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md border border-white">
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </div>
                        <span className="text-xs font-semibold text-white uppercase">LIVE</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {React.createElement(project.icon, { className: "h-4 w-4 text-green-600" })}
                      <span className="text-xs text-gray-500 uppercase tracking-wider">{project.tag}</span>
                    </div>
                    <h4 className="text-lg font-light text-gray-900 mb-2 leading-tight">
                      {project.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{project.supporters} supporters</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-6">
            Ready to make a <span className="font-semibold">difference?</span>
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Join thousands of supporters who are already making an impact. Every contribution helps us create positive change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="px-8 py-4 bg-white text-green-600 rounded-full hover:bg-gray-100 transition-all duration-300">
                Start Supporting Today
              </button>
            </Link>
            <Link href="/about">
              <button className="px-8 py-4 border-2 border-white/20 text-white rounded-full hover:bg-white/10 transition-all duration-300">
                Learn More About Us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CharityProjectsPage;