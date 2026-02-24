"use client"

import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar, Users, ArrowRight, Quote, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
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

// A "displayable" completed item — could be a top-level project OR a completed sub-project
interface CompletedItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  goal: number;
  raised?: number;
  supporters?: number;
  image?: string;
  completionData?: CompletionData;
  // For sub-projects: who's the parent
  parentTitle?: string;
  communityName?: string;
  isSubProject?: boolean;
}

interface FirestoreProject {
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
  completionData?: CompletionData;
  subProjects?: Array<{
    id: string;
    title: string;
    description?: string;
    communityName?: string;
    goal: number;
    raised: number;
    isCompleted?: boolean;
    completionData?: CompletionData;
  }>;
}

export default function CompletedProjectsPage() {
  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We need ALL projects (active and completed) because
    // parent projects may be active but have completed sub-projects
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: CompletedItem[] = [];

      snapshot.docs.forEach(docSnap => {
        const data = { id: docSnap.id, ...docSnap.data() } as FirestoreProject;

        // Top-level completed project (non-parent)
        if (data.isCompleted && !data.isParent) {
          items.push({
            id: data.id,
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            category: data.category,
            goal: data.goal,
            raised: data.raised,
            supporters: data.supporters,
            image: data.image,
            completionData: data.completionData,
          });
        }

        // Completed sub-projects from parent projects
        if (data.isParent && data.subProjects) {
          data.subProjects
            .filter(sub => sub.isCompleted)
            .forEach(sub => {
              items.push({
                id: `${data.id}_${sub.id}`,
                title: sub.title,
                description: sub.description || data.description,
                category: data.category,
                goal: sub.goal,
                raised: sub.raised,
                // supporters lives on the parent level
                supporters: data.supporters,
                image: data.image,
                completionData: sub.completionData,
                parentTitle: data.title,
                communityName: sub.communityName,
                isSubProject: true,
              });
            });
        }
      });

      // Sort by completion date descending
      items.sort((a, b) => {
        const dateA = a.completionData?.completedDate ? new Date(a.completionData.completedDate).getTime() : 0;
        const dateB = b.completionData?.completedDate ? new Date(b.completionData.completedDate).getTime() : 0;
        return dateB - dateA;
      });

      setCompletedItems(items);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching completed projects:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafffa] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-light">Loading completed projects...</p>
        </div>
      </div>
    );
  }

  const totalRaised = completedItems.reduce((sum, p) => sum + (p.raised || 0), 0);
  const totalSupporters = completedItems.reduce((sum, p) => sum + (p.supporters || 0), 0);
  const totalPeopleHelped = completedItems.reduce((sum, p) => sum + (p.completionData?.impactStats?.peopleHelped || 0), 0);

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
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4" />
              Completed Projects
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight">
              Our Impact <span className="font-semibold text-green-600">in Action</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              See the tangible results of your generosity. Every completed community represents lives changed and dreams fulfilled.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="text-4xl font-light text-green-600 mb-2">{completedItems.length}</div>
              <div className="text-sm text-gray-600">Communities Completed</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="text-4xl font-light text-green-600 mb-2">{formatCurrency(totalRaised)}</div>
              <div className="text-sm text-gray-600">Total Funds Raised</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="text-4xl font-light text-green-600 mb-2">{totalSupporters.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Supporters</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="text-4xl font-light text-green-600 mb-2">{totalPeopleHelped.toLocaleString()}</div>
              <div className="text-sm text-gray-600">People Helped</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {completedItems.length === 0 ? (
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
            <div className="space-y-16">
              {completedItems.map(item => (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">

                  {/* Header */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                          <span className="bg-green-600 text-white text-xs px-4 py-1.5 rounded-full font-medium">COMPLETED</span>
                          {/* Community badge for sub-projects */}
                          {item.isSubProject && item.parentTitle && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-4 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" />
                              Part of {item.parentTitle}
                            </span>
                          )}
                        </div>
                        <h2 className="text-4xl font-light text-gray-900 mb-2">{item.title}</h2>
                        {item.communityName && (
                          <p className="text-lg text-gray-500 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />{item.communityName}
                          </p>
                        )}
                        {item.subtitle && !item.isSubProject && (
                          <p className="text-lg text-gray-600">{item.subtitle}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(item.completionData?.completedDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-white rounded-xl p-4">
                        <div className="text-xs text-gray-500 mb-1">Raised</div>
                        <div className="text-2xl font-light text-green-600">{formatCurrency(item.raised || 0)}</div>
                      </div>
                      <div className="bg-white rounded-xl p-4">
                        <div className="text-xs text-gray-500 mb-1">Goal</div>
                        <div className="text-2xl font-light text-gray-900">{formatCurrency(item.goal)}</div>
                      </div>
                      {!item.isSubProject && (
                        <div className="bg-white rounded-xl p-4">
                          <div className="text-xs text-gray-500 mb-1">Supporters</div>
                          <div className="text-2xl font-light text-gray-900">{(item.supporters || 0).toLocaleString()}</div>
                        </div>
                      )}
                      {item.completionData?.impactStats?.peopleHelped && item.completionData.impactStats.peopleHelped > 0 && (
                        <div className="bg-white rounded-xl p-4">
                          <div className="text-xs text-gray-500 mb-1">People Helped</div>
                          <div className="text-2xl font-light text-gray-900">
                            {item.completionData.impactStats.peopleHelped.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Completion Story */}
                  {item.completionData?.completionStory && (
                    <div className="p-8 border-b border-gray-100">
                      <h3 className="text-xl font-light text-gray-900 mb-4">Our Impact Story</h3>
                      <p className="text-gray-700 leading-relaxed text-lg">{item.completionData.completionStory}</p>
                    </div>
                  )}

                  {/* Before / After */}
                  {((item.completionData?.beforeImages && item.completionData.beforeImages.length > 0) ||
                    (item.completionData?.afterImages && item.completionData.afterImages.length > 0)) && (
                    <div className="p-8 border-b border-gray-100">
                      <h3 className="text-xl font-light text-gray-900 mb-6">Before & After</h3>
                      <div className="grid md:grid-cols-2 gap-8">
                        {item.completionData?.beforeImages && item.completionData.beforeImages.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">Before</h4>
                            <div className="space-y-4">
                              {item.completionData.beforeImages.map((img, idx) => (
                                <div key={idx} className="relative h-64 rounded-xl overflow-hidden bg-gray-100">
                                  <Image src={img} alt={`Before ${idx + 1}`} fill className="object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.completionData?.afterImages && item.completionData.afterImages.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-green-600 mb-3 uppercase tracking-wide">After</h4>
                            <div className="space-y-4">
                              {item.completionData.afterImages.map((img, idx) => (
                                <div key={idx} className="relative h-64 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-green-200">
                                  <Image src={img} alt={`After ${idx + 1}`} fill className="object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Gallery */}
                  {item.completionData?.progressImages && item.completionData.progressImages.length > 0 && (
                    <div className="p-8 border-b border-gray-100">
                      <h3 className="text-xl font-light text-gray-900 mb-6">Progress Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {item.completionData.progressImages.map((img, idx) => (
                          <div key={idx} className="relative h-48 rounded-xl overflow-hidden bg-gray-100">
                            <Image src={img} alt={`Progress ${idx + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Testimonials */}
                  {item.completionData?.testimonials && item.completionData.testimonials.length > 0 && (
                    <div className="p-8 bg-gray-50">
                      <h3 className="text-xl font-light text-gray-900 mb-6">Community Voices</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {item.completionData.testimonials.map((testimonial, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100">
                            <Quote className="w-8 h-8 text-green-200 mb-4" />
                            <p className="text-gray-700 mb-4 italic">&quot;{testimonial.text}&quot;</p>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-medium">{testimonial.name.charAt(0)}</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{testimonial.name}</div>
                                {testimonial.role && <div className="text-sm text-gray-500">{testimonial.role}</div>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Impact Stats */}
                  {item.completionData?.impactStats && (
                    <div className="p-8">
                      <h3 className="text-xl font-light text-gray-900 mb-6">Impact By The Numbers</h3>
                      <div className="flex flex-wrap gap-6">
                        {item.completionData.impactStats.peopleHelped && item.completionData.impactStats.peopleHelped > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-light text-gray-900">{item.completionData.impactStats.peopleHelped.toLocaleString()}</div>
                              <div className="text-sm text-gray-600">People Helped</div>
                            </div>
                          </div>
                        )}
                        {item.completionData.impactStats.itemsDistributed && item.completionData.impactStats.itemsDistributed > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-light text-gray-900">{item.completionData.impactStats.itemsDistributed.toLocaleString()}</div>
                              <div className="text-sm text-gray-600">Items Distributed</div>
                            </div>
                          </div>
                        )}
                        {item.completionData.impactStats.customMetric && (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <ArrowRight className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <div className="text-lg font-light text-gray-900">{item.completionData.impactStats.customMetric}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
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