"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Calendar, Users, ArrowRight, Quote, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CompletionData {
  completedDate?: string;
  completionStory?: string;
  beforeImages?: string[];
  afterImages?: string[];
  progressImages?: string[];
  testimonials?: Array<{ name: string; text: string; role?: string }>;
  impactStats?: {
    peopleHelped?: number;
    itemsDistributed?: number;
    customMetric?: string;
  };
}

interface SubProject {
  id: string;
  title: string;
  communityName?: string;
  description?: string;
  goal: number;
  raised?: number;
  isCompleted?: boolean;
  completionData?: CompletionData;
}

interface Project {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  goal: number;
  raised?: number;
  supporters?: number;
  image?: string;
  isCompleted?: boolean;
  isParent?: boolean;
  subProjects?: SubProject[];
  completionData?: CompletionData;
}

// What we actually render — could be a main project or a sub-project
interface CardItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  goal: number;
  raised?: number;
  supporters?: number;
  image?: string;
  completionData?: CompletionData;
  parentTitle?: string;       // only for sub-projects
  parentId?: string;          // only for sub-projects
  isMainProject?: boolean;    // true = clicking goes to detail page
  completedSubsCount?: number; // only for main projects
}

// ── Slideshow ──────────────────────────────────────────────────────
function ImageSlideshow({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(() => setCurrent(c => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(c => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prev, next]);

  if (!images.length) return null;

  return (
    <>
      <div
        className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[3/4] group cursor-pointer"
        onClick={() => setLightbox(true)}
      >
        <Image src={images[current]} alt={`slide ${current + 1}`} fill className="object-contain transition-opacity duration-500" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/40 px-4 py-2 rounded-full">
            Click to expand
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
          {current + 1} / {images.length}
        </div>
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10" onClick={() => setLightbox(false)}>
            <X className="w-6 h-6" />
          </button>
          {images.length > 1 && (
            <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-10" onClick={e => { e.stopPropagation(); prev(); }}>
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          <div className="relative w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <Image src={images[current]} alt={`slide ${current + 1}`} fill className="object-contain" />
          </div>
          {images.length > 1 && (
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-10" onClick={e => { e.stopPropagation(); next(); }}>
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {current + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

// ── Card ───────────────────────────────────────────────────────────
function ProjectCard({ item }: { item: CardItem }) {
  const [expanded, setExpanded] = useState(false);

  const allImages = [
    ...(item.completionData?.beforeImages?.filter(u => u.trim()) || []),
    ...(item.completionData?.afterImages?.filter(u => u.trim()) || []),
    ...(item.completionData?.progressImages?.filter(u => u.trim()) || []),
  ];

  const hasTestimonials = (item.completionData?.testimonials?.length || 0) > 0;
  const hasImpact = item.completionData?.impactStats && (
    (item.completionData.impactStats.peopleHelped || 0) > 0 ||
    (item.completionData.impactStats.itemsDistributed || 0) > 0 ||
    !!item.completionData.impactStats.customMetric
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">

      {/* Slideshow / fallback */}
      <div className="p-4 pb-0">
        {allImages.length > 0 ? (
          <ImageSlideshow images={allImages} />
        ) : item.image ? (
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
            <Image src={item.image} alt={item.title} fill className="object-contain" />
          </div>
        ) : (
          <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-green-300" />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
          {/* Sub-project: show parent name */}
          {item.parentTitle && (
            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
              {item.parentTitle}
            </span>
          )}
          {/* Main project: show communities count */}
          {item.isMainProject && item.completedSubsCount && item.completedSubsCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Users className="w-3 h-3" /> {item.completedSubsCount} {item.completedSubsCount === 1 ? 'Community' : 'Communities'}
            </span>
          )}
        </div>

        <h2 className="text-xl font-medium text-gray-900 mb-1">{item.title}</h2>
        {item.subtitle && <p className="text-sm text-gray-500 mb-3">{item.subtitle}</p>}

        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(item.completionData?.completedDate)}
        </div>

        {/* Story preview */}
        {item.completionData?.completionStory && (
          <p className={`text-sm text-gray-600 leading-relaxed mb-4 ${!expanded ? 'line-clamp-3' : ''}`}>
            {item.completionData.completionStory}
          </p>
        )}

        {/* Expanded extras — only for sub-projects / standalone projects */}
        {!item.isMainProject && expanded && (
          <div className="space-y-4 mb-4">
            {hasImpact && (
              <div className="flex flex-wrap gap-4 p-4 bg-green-50 rounded-2xl">
                {(item.completionData!.impactStats!.peopleHelped || 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.completionData!.impactStats!.peopleHelped!.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">People Helped</div>
                    </div>
                  </div>
                )}
                {(item.completionData!.impactStats!.itemsDistributed || 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.completionData!.impactStats!.itemsDistributed!.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Items Distributed</div>
                    </div>
                  </div>
                )}
                {item.completionData!.impactStats!.customMetric && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{item.completionData!.impactStats!.customMetric}</div>
                  </div>
                )}
              </div>
            )}

            {hasTestimonials && (
              <div className="space-y-3">
                {item.completionData!.testimonials!.map((t, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-4">
                    <Quote className="w-5 h-5 text-green-300 mb-2" />
                    <p className="text-sm text-gray-700 italic mb-3">&quot;{t.text}&quot;</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-900">{t.name}</div>
                        {t.role && <div className="text-xs text-gray-400">{t.role}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA button */}
        <div className="mt-auto pt-2">
          {item.isMainProject ? (
            // Main project → navigate to detail page
            <Link href={`/completed-projects/${item.id}`}>
              <button className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2">
                View All Communities
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          ) : (
            // Sub-project / standalone → expand inline
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2.5 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1.5"
            >
              {expanded ? 'Show Less' : 'View Full Story'}
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function CompletedProjectsPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const result: CardItem[] = [];

      snapshot.docs.forEach(doc => {
        const project = { id: doc.id, ...doc.data() } as Project;

        if (project.isCompleted) {
          const completedSubs = (project.subProjects || []).filter(s => s.isCompleted);
          const previewImages = [
            ...(project.completionData?.beforeImages?.filter(u => u.trim()) || []),
            ...(project.completionData?.afterImages?.filter(u => u.trim()) || []),
            ...(project.completionData?.progressImages?.filter(u => u.trim()) || []),
            ...completedSubs.flatMap(s => s.completionData?.afterImages?.filter(u => u.trim()) || []),
          ].slice(0, 8);

          result.push({
            id: project.id,
            title: project.title,
            subtitle: project.subtitle,
            description: project.description,
            goal: project.goal,
            raised: project.raised,
            supporters: project.supporters,
            image: project.image,
            completionData: {
              ...project.completionData,
              afterImages: previewImages,
            },
            isMainProject: true,
            completedSubsCount: completedSubs.length,
          });

        } else if (project.subProjects?.length) {
          project.subProjects
            .filter(sub => sub.isCompleted)
            .forEach(sub => {
              result.push({
                id: sub.id,
                title: sub.title,
                subtitle: sub.communityName,
                description: sub.description || project.description,
                goal: sub.goal,
                raised: sub.raised,
                supporters: project.supporters,
                image: project.image,
                completionData: sub.completionData,
                parentTitle: project.title,
                parentId: project.id,
                isMainProject: false,
              });
            });
        }
      });

      setCards(result);
      setLoading(false);
    }, (error) => { console.error(error); setLoading(false); });

    return () => unsubscribe();
  }, []);

  const totalStats = {
    count: cards.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafffa] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#fafffa]">

      {/* HERO */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(22 163 74) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" /> Completed Projects
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight">
            Our Impact <span className="font-semibold text-green-600">in Action</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-16">
            See the tangible results of your generosity. Every completed project represents lives changed, communities empowered, and dreams fulfilled.
          </p>

          {/* Stats — Projects Completed only */}
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center min-w-[200px]">
              <div className="text-4xl font-light text-green-600 mb-2">{totalStats.count}</div>
              <div className="text-sm text-gray-600">Projects Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {cards.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-light text-gray-900 mb-2">No Completed Projects Yet</h3>
              <p className="text-gray-600 mb-8">Check back soon to see our completed work!</p>
              <Link href="/projects">
                <button className="px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all">
                  View Active Projects
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {cards.map(card => <ProjectCard key={card.id} item={card} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-6">
            Want to create <span className="font-semibold">similar impact?</span>
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Join us in our active projects and be part of the next success story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects">
              <button className="px-8 py-4 bg-white text-green-600 rounded-full hover:bg-gray-100 transition-all duration-300">
                View Active Projects
              </button>
            </Link>
            <Link href="/donate">
              <button className="px-8 py-4 border-2 border-white/20 text-white rounded-full hover:bg-white/10 transition-all duration-300">
                Donate Now
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}