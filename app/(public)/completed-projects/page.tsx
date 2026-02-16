"use client"

import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar, Users, ArrowRight, Quote, Loader2 } from 'lucide-react';
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
  testimonials?: Array<{
    name: string;
    text: string;
    role?: string;
  }>;
  impactStats?: {
    peopleHelped?: number;
    itemsDistributed?: number;
    customMetric?: string;
  };
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
  completionData?: CompletionData;
}

export default function CompletedProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('isCompleted', '==', true),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
      
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching completed projects:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
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

  return (
    <div className="bg-[#fafffa]">
      {/* HERO Section */}
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
              See the tangible results of your generosity. Every completed project represents lives changed, communities empowered, and dreams fulfilled.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="text-4xl font-light text-green-600 mb-2">{projects.length}</div>
              <div className="text-sm text-gray-600">Projects Completed</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="text-4xl font-light text-green-600 mb-2">
                {formatCurrency(projects.reduce((sum, p) => sum + (p.raised || 0), 0))}
              </div>
              <div className="text-sm text-gray-600">Total Funds Raised</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="text-4xl font-light text-green-600 mb-2">
                {projects.reduce((sum, p) => sum + (p.supporters || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Supporters</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="text-4xl font-light text-green-600 mb-2">
                {projects.reduce((sum, p) => sum + (p.completionData?.impactStats?.peopleHelped || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">People Helped</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {projects.length === 0 ? (
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
              {projects.map((project, index) => (
                <div key={project.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  {/* Project Header */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                          <span className="bg-green-600 text-white text-xs px-4 py-1.5 rounded-full font-medium">
                            COMPLETED
                          </span>
                        </div>
                        <h2 className="text-4xl font-light text-gray-900 mb-2">{project.title}</h2>
                        {project.subtitle && (
                          <p className="text-lg text-gray-600">{project.subtitle}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(project.completionData?.completedDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-white rounded-xl p-4">
                        <div className="text-xs text-gray-500 mb-1">Raised</div>
                        <div className="text-2xl font-light text-green-600">
                          {formatCurrency(project.raised || 0)}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4">
                        <div className="text-xs text-gray-500 mb-1">Goal</div>
                        <div className="text-2xl font-light text-gray-900">
                          {formatCurrency(project.goal)}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4">
                        <div className="text-xs text-gray-500 mb-1">Supporters</div>
                        <div className="text-2xl font-light text-gray-900">
                          {(project.supporters || 0).toLocaleString()}
                        </div>
                      </div>
                      {project.completionData?.impactStats?.peopleHelped && project.completionData.impactStats.peopleHelped > 0 && (
                        <div className="bg-white rounded-xl p-4">
                          <div className="text-xs text-gray-500 mb-1">People Helped</div>
                          <div className="text-2xl font-light text-gray-900">
                            {project.completionData.impactStats.peopleHelped.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Completion Story */}
                  {project.completionData?.completionStory && (
                    <div className="p-8 border-b border-gray-100">
                      <h3 className="text-xl font-light text-gray-900 mb-4">Our Impact Story</h3>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {project.completionData.completionStory}
                      </p>
                    </div>
                  )}

                  {/* Before/After Section */}
                  {((project.completionData?.beforeImages && project.completionData.beforeImages.length > 0) || 
                    (project.completionData?.afterImages && project.completionData.afterImages.length > 0)) && (
                    <div className="p-8 border-b border-gray-100">
                      <h3 className="text-xl font-light text-gray-900 mb-6">Before & After</h3>
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Before Images */}
                        {project.completionData?.beforeImages && project.completionData.beforeImages.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">Before</h4>
                            <div className="space-y-4">
                              {project.completionData.beforeImages.map((img, idx) => (
                                <div key={idx} className="relative h-64 rounded-xl overflow-hidden bg-gray-100">
                                  <Image
                                    src={img}
                                    alt={`Before ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* After Images */}
                        {project.completionData?.afterImages && project.completionData.afterImages.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-green-600 mb-3 uppercase tracking-wide">After</h4>
                            <div className="space-y-4">
                              {project.completionData.afterImages.map((img, idx) => (
                                <div key={idx} className="relative h-64 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-green-200">
                                  <Image
                                    src={img}
                                    alt={`After ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Gallery */}
                  {project.completionData?.progressImages && project.completionData.progressImages.length > 0 && (
                    <div className="p-8 border-b border-gray-100">
                      <h3 className="text-xl font-light text-gray-900 mb-6">Progress Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {project.completionData.progressImages.map((img, idx) => (
                          <div key={idx} className="relative h-48 rounded-xl overflow-hidden bg-gray-100">
                            <Image
                              src={img}
                              alt={`Progress ${idx + 1}`}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Testimonials */}
                  {project.completionData?.testimonials && project.completionData.testimonials.length > 0 && (
                    <div className="p-8 bg-gray-50">
                      <h3 className="text-xl font-light text-gray-900 mb-6">Community Voices</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {project.completionData.testimonials.map((testimonial, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100">
                            <Quote className="w-8 h-8 text-green-200 mb-4" />
                            <p className="text-gray-700 mb-4 italic">
                              &quot;{testimonial.text}&quot;
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-medium">
                                  {testimonial.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{testimonial.name}</div>
                                {testimonial.role && (
                                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Impact Stats */}
                  {project.completionData?.impactStats && (
                    <div className="p-8">
                      <h3 className="text-xl font-light text-gray-900 mb-6">Impact By The Numbers</h3>
                      <div className="flex flex-wrap gap-6">
                        {project.completionData.impactStats.peopleHelped && project.completionData.impactStats.peopleHelped > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-light text-gray-900">
                                {project.completionData.impactStats.peopleHelped.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">People Helped</div>
                            </div>
                          </div>
                        )}
                        {project.completionData.impactStats.itemsDistributed && project.completionData.impactStats.itemsDistributed > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-light text-gray-900">
                                {project.completionData.impactStats.itemsDistributed.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">Items Distributed</div>
                            </div>
                          </div>
                        )}
                        {project.completionData.impactStats.customMetric && (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <ArrowRight className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <div className="text-lg font-light text-gray-900">
                                {project.completionData.impactStats.customMetric}
                              </div>
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