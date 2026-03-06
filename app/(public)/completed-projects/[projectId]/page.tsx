"use client"

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Calendar, Users, ArrowRight, Quote, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams } from 'next/navigation';

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
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video group cursor-pointer" onClick={() => setLightbox(true)}>
        <Image src={images[current]} alt={`slide ${current + 1}`} fill className="object-cover transition-opacity duration-500" />
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

// ── Community Card ─────────────────────────────────────────────────
function CommunityCard({ sub, projectImage }: { sub: SubProject; projectImage?: string }) {
  const [expanded, setExpanded] = useState(false);

  const allImages = [
    ...(sub.completionData?.beforeImages?.filter(u => u.trim()) || []),
    ...(sub.completionData?.afterImages?.filter(u => u.trim()) || []),
    ...(sub.completionData?.progressImages?.filter(u => u.trim()) || []),
  ];

  const hasTestimonials = (sub.completionData?.testimonials?.length || 0) > 0;
  const hasImpact = sub.completionData?.impactStats && (
    (sub.completionData.impactStats.peopleHelped || 0) > 0 ||
    (sub.completionData.impactStats.itemsDistributed || 0) > 0 ||
    !!sub.completionData.impactStats.customMetric
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

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
        ) : projectImage ? (
          <div className="relative h-48 rounded-2xl overflow-hidden bg-gray-100">
            <Image src={projectImage} alt={sub.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="h-48 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-green-300" />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-1">{sub.title}</h3>
        {sub.communityName && <p className="text-sm text-gray-500 mb-3">{sub.communityName}</p>}

        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(sub.completionData?.completedDate)}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Raised', value: formatCurrency(sub.raised || 0), color: 'text-green-600' },
            { label: 'Goal', value: formatCurrency(sub.goal), color: 'text-gray-900' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <div className={`text-sm font-semibold ${color}`}>{value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Story preview */}
        {sub.completionData?.completionStory && (
          <p className={`text-sm text-gray-600 leading-relaxed mb-4 ${!expanded ? 'line-clamp-3' : ''}`}>
            {sub.completionData.completionStory}
          </p>
        )}

        {/* Expanded extras */}
        {expanded && (
          <div className="space-y-4 mb-4">
            {hasImpact && (
              <div className="flex flex-wrap gap-4 p-4 bg-green-50 rounded-2xl">
                {(sub.completionData!.impactStats!.peopleHelped || 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{sub.completionData!.impactStats!.peopleHelped!.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">People Helped</div>
                    </div>
                  </div>
                )}
                {(sub.completionData!.impactStats!.itemsDistributed || 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{sub.completionData!.impactStats!.itemsDistributed!.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Items Distributed</div>
                    </div>
                  </div>
                )}
                {sub.completionData!.impactStats!.customMetric && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{sub.completionData!.impactStats!.customMetric}</div>
                  </div>
                )}
              </div>
            )}

            {hasTestimonials && (
              <div className="space-y-3">
                {sub.completionData!.testimonials!.map((t, i) => (
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

        {/* Toggle */}
        <div className="mt-auto pt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2.5 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1.5"
          >
            {expanded ? 'Show Less' : 'View Full Story'}
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Page ────────────────────────────────────────────────────
export default function CompletedProjectDetailPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const unsubscribe = onSnapshot(doc(db, 'projects', projectId), (snap) => {
      if (snap.exists()) setProject({ id: snap.id, ...snap.data() } as Project);
      setLoading(false);
    }, (error) => { console.error(error); setLoading(false); });
    return () => unsubscribe();
  }, [projectId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const mainImages = project ? [
    ...(project.completionData?.beforeImages?.filter(u => u.trim()) || []),
    ...(project.completionData?.afterImages?.filter(u => u.trim()) || []),
    ...(project.completionData?.progressImages?.filter(u => u.trim()) || []),
  ] : [];

  const completedSubs = (project?.subProjects || []).filter(s => s.isCompleted);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafffa] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#fafffa] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Project not found</h2>
          <Link href="/completed-projects">
            <button className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700">
              Back to Completed Projects
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafffa]">

      {/* Back button */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Link href="/completed-projects">
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Completed Projects
          </button>
        </Link>
      </div>

      {/* Project Hero */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">

            {/* Header */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="bg-green-600 text-white text-xs px-4 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> COMPLETED
                </span>
                {completedSubs.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {completedSubs.length} {completedSubs.length === 1 ? 'Community' : 'Communities'}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2">{project.title}</h1>
              {project.subtitle && <p className="text-lg text-gray-600 mb-4">{project.subtitle}</p>}

              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
                <Calendar className="w-4 h-4" />
                Completed {formatDate(project.completionData?.completedDate)}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Raised', value: formatCurrency(project.raised || 0), color: 'text-green-600' },
                  { label: 'Goal', value: formatCurrency(project.goal), color: 'text-gray-900' },
                  { label: 'Supporters', value: (project.supporters || 0).toLocaleString(), color: 'text-gray-900' },
                  { label: 'Communities', value: completedSubs.length.toString(), color: 'text-blue-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-4">
                    <div className={`text-2xl font-light ${color} mb-1`}>{value}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main project images + story */}
            <div className="p-8 md:p-12 grid md:grid-cols-2 gap-8">
              {mainImages.length > 0 && (
                <div>
                  <ImageSlideshow images={mainImages} />
                </div>
              )}
              {project.completionData?.completionStory && (
                <div className={mainImages.length === 0 ? 'md:col-span-2' : ''}>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">Our Impact Story</h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {project.completionData.completionStory}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Communities Grid */}
      {completedSubs.length > 0 && (
        <section className="pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-light text-gray-900">
                Communities <span className="font-semibold text-green-600">Served</span>
              </h2>
              <p className="text-gray-500 mt-2">Each community below represents a completed phase of this project.</p>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {completedSubs.map(sub => (
                <CommunityCard key={sub.id} sub={sub} projectImage={project.image} />
              ))}
            </div>
          </div>
        </section>
      )}

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