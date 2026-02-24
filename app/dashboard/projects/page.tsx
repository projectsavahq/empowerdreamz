"use client"

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';

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
  description?: string;
  communityName?: string;
  goal: number;
  raised: number; // ← added
  isCompleted?: boolean;
  completionData?: CompletionData;
  createdAt?: string;
}

interface Project {
  id: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  description: string;
  callToAction?: string;
  category: string;
  goal: number;
  raised?: number;
  supporters?: number;
  image?: string;
  tag?: string;
  isActive: boolean;
  isLive: boolean;
  isCompleted?: boolean;
  isParent?: boolean;
  subProjects?: SubProject[];
  completionData?: CompletionData;
  createdAt?: { toDate: () => Date } | Date | null;
  updatedAt?: { toDate: () => Date } | Date | null;
}

const defaultFormData = {
  title: '', subtitle: '', tagline: '', description: '',
  callToAction: '', category: 'water', goal: 0, raised: 0,
  supporters: 0, image: '', tag: '',
  isActive: true, isLive: false, isCompleted: false, isParent: false,
};

const defaultSubProjectForm = {
  title: '', description: '', communityName: '', goal: 0, raised: 0,
};

const defaultCompletionForm = {
  completedDate: new Date().toISOString().split('T')[0],
  completionStory: '',
  beforeImages: [''],
  afterImages: [''],
  progressImages: [''],
  testimonials: [{ name: '', text: '', role: '' }],
  impactStats: { peopleHelped: 0, itemsDistributed: 0, customMetric: '' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const [showSubModal, setShowSubModal] = useState(false);
  const [subModalParent, setSubModalParent] = useState<Project | null>(null);
  const [editingSubProject, setEditingSubProject] = useState<SubProject | null>(null);
  const [subFormData, setSubFormData] = useState(defaultSubProjectForm);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingProject, setCompletingProject] = useState<Project | null>(null);
  const [completingSubProject, setCompletingSubProject] = useState<SubProject | null>(null);
  const [completionFormData, setCompletionFormData] = useState(defaultCompletionForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [showDeleteSubModal, setShowDeleteSubModal] = useState(false);
  const [deletingSubProject, setDeletingSubProject] = useState<{ sub: SubProject; parent: Project } | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
        setProjects(data);
        setLoading(false);
      },
      (error) => { console.error(error); setLoading(false); }
    );
    return () => unsubscribe();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const generateSubId = () => `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // ── Completion form helpers ──
  const addImageField = (type: 'beforeImages' | 'afterImages' | 'progressImages') =>
    setCompletionFormData(prev => ({ ...prev, [type]: [...prev[type], ''] }));

  const updateImageField = (type: 'beforeImages' | 'afterImages' | 'progressImages', index: number, value: string) => {
    const arr = [...completionFormData[type]];
    arr[index] = value;
    setCompletionFormData(prev => ({ ...prev, [type]: arr }));
  };

  const removeImageField = (type: 'beforeImages' | 'afterImages' | 'progressImages', index: number) => {
    const arr = completionFormData[type].filter((_, i) => i !== index);
    setCompletionFormData(prev => ({ ...prev, [type]: arr.length > 0 ? arr : [''] }));
  };

  const addTestimonial = () =>
    setCompletionFormData(prev => ({ ...prev, testimonials: [...prev.testimonials, { name: '', text: '', role: '' }] }));

  const updateTestimonial = (index: number, field: 'name' | 'text' | 'role', value: string) => {
    const arr = [...completionFormData.testimonials];
    arr[index][field] = value;
    setCompletionFormData(prev => ({ ...prev, testimonials: arr }));
  };

  const removeTestimonial = (index: number) => {
    const arr = completionFormData.testimonials.filter((_, i) => i !== index);
    setCompletionFormData(prev => ({ ...prev, testimonials: arr.length > 0 ? arr : [{ name: '', text: '', role: '' }] }));
  };

  const buildCleanCompletionData = (): CompletionData => ({
    completedDate: completionFormData.completedDate,
    completionStory: completionFormData.completionStory,
    beforeImages: completionFormData.beforeImages.filter(u => u.trim()),
    afterImages: completionFormData.afterImages.filter(u => u.trim()),
    progressImages: completionFormData.progressImages.filter(u => u.trim()),
    testimonials: completionFormData.testimonials.filter(t => t.name.trim() && t.text.trim()),
    impactStats: completionFormData.impactStats,
  });

  const prefillCompletionForm = (data?: CompletionData) => {
    if (data) {
      setCompletionFormData({
        completedDate: data.completedDate || new Date().toISOString().split('T')[0],
        completionStory: data.completionStory || '',
        beforeImages: data.beforeImages?.length ? data.beforeImages : [''],
        afterImages: data.afterImages?.length ? data.afterImages : [''],
        progressImages: data.progressImages?.length ? data.progressImages : [''],
        testimonials: data.testimonials?.length
          ? data.testimonials.map(t => ({ name: t.name, text: t.text, role: t.role || '' }))
          : [{ name: '', text: '', role: '' }],
        impactStats: {
          peopleHelped: data.impactStats?.peopleHelped ?? 0,
          itemsDistributed: data.impactStats?.itemsDistributed ?? 0,
          customMetric: data.impactStats?.customMetric ?? '',
        },
      });
    } else {
      setCompletionFormData(defaultCompletionForm);
    }
  };

  // ── Project modal ──
  const openProjectModal = (project: Project | null = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title || '',
        subtitle: project.subtitle || '',
        tagline: project.tagline || '',
        description: project.description || '',
        callToAction: project.callToAction || '',
        category: project.category || 'water',
        goal: project.goal || 0,
        raised: project.raised || 0,
        supporters: project.supporters || 0,
        image: project.image || '',
        tag: project.tag || '',
        isActive: project.isActive ?? true,
        isLive: project.isLive ?? false,
        isCompleted: project.isCompleted ?? false,
        isParent: project.isParent ?? false,
      });
    } else {
      setEditingProject(null);
      setFormData(defaultFormData);
    }
    setShowModal(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || formData.goal <= 0) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'projects'), {
          ...formData,
          subProjects: [],
          isCompleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      setEditingProject(null);
    } catch (err) {
      alert('Failed to save: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'projects', deletingProject.id));
      setShowDeleteModal(false);
      setDeletingProject(null);
    } catch (err) {
      alert('Failed to delete: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  // ── Sub-project modal ──
  const openSubModal = (parent: Project, sub: SubProject | null = null) => {
    setSubModalParent(parent);
    if (sub) {
      setEditingSubProject(sub);
      setSubFormData({
        title: sub.title || '',
        description: sub.description || '',
        communityName: sub.communityName || '',
        goal: sub.goal || 0,
        raised: sub.raised || 0,
      });
    } else {
      setEditingSubProject(null);
      setSubFormData(defaultSubProjectForm);
    }
    setShowSubModal(true);
  };

  const handleSubProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subModalParent || !subFormData.title || subFormData.goal <= 0) {
      alert('Please fill in Title and Goal');
      return;
    }
    setSaving(true);
    try {
      const currentSubs: SubProject[] = subModalParent.subProjects || [];
      let updatedSubs: SubProject[];

      if (editingSubProject) {
        updatedSubs = currentSubs.map(s =>
          s.id === editingSubProject.id ? { ...s, ...subFormData } : s
        );
      } else {
        const newSub: SubProject = {
          id: generateSubId(),
          ...subFormData,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        };
        updatedSubs = [...currentSubs, newSub];
      }

      await updateDoc(doc(db, 'projects', subModalParent.id), {
        subProjects: updatedSubs,
        updatedAt: serverTimestamp(),
      });

      setShowSubModal(false);
      setSubModalParent(null);
      setEditingSubProject(null);
    } catch (err) {
      alert('Failed to save community: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubProject = async () => {
    if (!deletingSubProject) return;
    setDeleting(true);
    try {
      const { sub, parent } = deletingSubProject;
      const updatedSubs = (parent.subProjects || []).filter(s => s.id !== sub.id);
      await updateDoc(doc(db, 'projects', parent.id), {
        subProjects: updatedSubs,
        updatedAt: serverTimestamp(),
      });
      setShowDeleteSubModal(false);
      setDeletingSubProject(null);
    } catch (err) {
      alert('Failed to delete: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  // ── Completion modal ──
  const openCompletionModal = (project: Project) => {
    setCompletingProject(project);
    setCompletingSubProject(null);
    prefillCompletionForm(project.completionData);
    setShowCompletionModal(true);
  };

  const openSubCompletionModal = (parent: Project, sub: SubProject) => {
    setCompletingProject(parent);
    setCompletingSubProject(sub);
    prefillCompletionForm(sub.completionData);
    setShowCompletionModal(true);
  };

  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingProject) return;
    setSaving(true);
    try {
      const cleanData = buildCleanCompletionData();

      if (completingSubProject) {
        const updatedSubs = (completingProject.subProjects || []).map(s =>
          s.id === completingSubProject.id
            ? { ...s, isCompleted: true, completionData: cleanData }
            : s
        );
        await updateDoc(doc(db, 'projects', completingProject.id), {
          subProjects: updatedSubs,
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, 'projects', completingProject.id), {
          isCompleted: true,
          completionData: cleanData,
          updatedAt: serverTimestamp(),
        });
      }

      setShowCompletionModal(false);
      setCompletingProject(null);
      setCompletingSubProject(null);
      alert('Marked as completed successfully!');
    } catch (err) {
      alert('Failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const progressPct = (raised = 0, goal = 1) =>
    goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  const activeProjects = projects.filter(p => !p.isCompleted);
  const completedProjects = projects.filter(p => p.isCompleted);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light text-gray-900">Projects</h1>
        <button
          onClick={() => openProjectModal()}
          className="px-6 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Active Projects */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Active Projects ({activeProjects.length})</h2>
        <div className="grid gap-6">
          {activeProjects.map(project => {
            const isExpanded = expandedProjects.has(project.id);
            const subs = project.subProjects || [];
            const completedSubs = subs.filter(s => s.isCompleted).length;
            const activeSub = subs.find(s => !s.isCompleted);

            return (
              <div key={project.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {project.isParent && (
                          <button onClick={() => toggleExpand(project.id)} className="p-1 hover:bg-gray-100 rounded-lg">
                            {isExpanded
                              ? <ChevronDown className="w-5 h-5 text-gray-500" />
                              : <ChevronRight className="w-5 h-5 text-gray-500" />}
                          </button>
                        )}
                        <h3 className="text-xl font-light text-gray-900">{project.title}</h3>
                        {project.isParent && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">Umbrella</span>
                        )}
                        {project.isLive && (
                          <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
                          </span>
                        )}
                        <span className={`text-xs px-3 py-1 rounded-full ${project.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                          {project.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {project.subtitle && <p className="text-sm text-gray-500 ml-8">{project.subtitle}</p>}
                      {project.isParent && subs.length > 0 && (
                        <p className="text-xs text-gray-400 ml-8 mt-1 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {completedSubs}/{subs.length} communities completed
                          {activeSub && <span className="ml-1">· Active: <span className="text-blue-600">{activeSub.title}</span></span>}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {!project.isParent && (
                        <button
                          onClick={() => openCompletionModal(project)}
                          className="px-4 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />Mark Complete
                        </button>
                      )}
                      {project.isParent && (
                        <button
                          onClick={() => openSubModal(project)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />Add Community
                        </button>
                      )}
                      <button onClick={() => openProjectModal(project)} className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50">
                        Edit
                      </button>
                      <button onClick={() => { setDeletingProject(project); setShowDeleteModal(true); }} className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Raised</p>
                      <p className="text-2xl font-light text-green-600">${(project.raised || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Goal</p>
                      <p className="text-2xl font-light text-gray-900">${(project.goal || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Supporters</p>
                      <p className="text-2xl font-light text-gray-900">{project.supporters || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{progressPct(project.raised, project.goal).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full transition-all" style={{ width: `${progressPct(project.raised, project.goal)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Sub-projects panel */}
                {project.isParent && isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    {subs.length === 0 ? (
                      <div className="px-8 py-6 text-center text-sm text-gray-400">
                        No communities yet. Click "Add Community" to get started.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {subs.map(sub => (
                          <div key={sub.id} className={`px-8 py-5 ${sub.isCompleted ? 'bg-green-50' : ''}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {sub.isCompleted
                                    ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    : <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex-shrink-0" />}
                                  <h4 className="font-medium text-gray-900">{sub.title}</h4>
                                  {sub.communityName && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{sub.communityName}</span>
                                  )}
                                  {sub.isCompleted
                                    ? <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">COMPLETED</span>
                                    : <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">ACTIVE</span>}
                                </div>
                                {sub.description && <p className="text-sm text-gray-500 ml-6">{sub.description}</p>}

                                {/* Sub-project raised/goal */}
                                <div className="ml-6 mt-2 flex items-center gap-6">
                                  <div>
                                    <p className="text-xs text-gray-400">Raised</p>
                                    <p className="text-lg font-light text-green-600">${(sub.raised || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400">Goal</p>
                                    <p className="text-lg font-light text-gray-900">${sub.goal.toLocaleString()}</p>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                      <span>Progress</span>
                                      <span>{progressPct(sub.raised, sub.goal).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-green-500 rounded-full transition-all"
                                        style={{ width: `${progressPct(sub.raised, sub.goal)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {sub.isCompleted && sub.completionData?.completedDate && (
                                  <p className="text-xs text-gray-400 ml-6 mt-1">
                                    Completed: {new Date(sub.completionData.completedDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => openSubCompletionModal(project, sub)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                    sub.isCompleted
                                      ? 'border border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  {sub.isCompleted ? 'View/Edit' : 'Mark Complete'}
                                </button>
                                <button onClick={() => openSubModal(project, sub)} className="px-3 py-1.5 border border-gray-200 rounded-full text-xs hover:bg-gray-100">
                                  Edit
                                </button>
                                <button onClick={() => { setDeletingSubProject({ sub, parent: project }); setShowDeleteSubModal(true); }} className="p-1.5 hover:bg-red-50 rounded-lg">
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {activeProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">No active projects</div>
          )}
        </div>
      </div>

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Completed Projects ({completedProjects.length})</h2>
          <div className="grid gap-6">
            {completedProjects.map(project => (
              <div key={project.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h3 className="text-xl font-light text-gray-900">{project.title}</h3>
                      <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">COMPLETED</span>
                    </div>
                    {project.completionData?.completedDate && (
                      <p className="text-sm text-gray-600">Completed: {new Date(project.completionData.completedDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openCompletionModal(project)} className="px-4 py-2 border border-green-600 text-green-600 rounded-full text-sm hover:bg-green-600 hover:text-white transition-colors">
                      View/Edit
                    </button>
                    <button onClick={() => openProjectModal(project)} className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50">Edit</button>
                    <button onClick={() => { setDeletingProject(project); setShowDeleteModal(true); }} className="p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-xs text-gray-500 mb-1">Final Amount</p><p className="text-xl font-light text-green-600">${(project.raised || 0).toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Goal</p><p className="text-xl font-light text-gray-900">${(project.goal || 0).toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Supporters</p><p className="text-xl font-light text-gray-900">{project.supporters || 0}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ MODALS ══════════ */}

      {/* Add/Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-light text-white">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg" disabled={saving}>
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <form onSubmit={handleProjectSubmit} className="p-8 overflow-y-auto max-h-[calc(85vh-88px)] space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Title <span className="text-red-500">*</span></label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required disabled={saving} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Subtitle</label>
                  <input type="text" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" disabled={saving} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tagline</label>
                  <input type="text" value={formData.tagline} onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" disabled={saving} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description <span className="text-red-500">*</span></label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={4} required disabled={saving} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Call to Action</label>
                  <input type="text" value={formData.callToAction} onChange={e => setFormData({ ...formData, callToAction: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" disabled={saving} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tag</label>
                  <input type="text" value={formData.tag} onChange={e => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" disabled={saving} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" disabled={saving}>
                    <option value="water">Water</option>
                    <option value="education">Education</option>
                    <option value="health">Health</option>
                    <option value="food">Food</option>
                    <option value="shelter">Shelter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Goal ($) <span className="text-red-500">*</span></label>
                  <input type="number" value={formData.goal} onChange={e => setFormData({ ...formData, goal: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1" required disabled={saving} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Raised ($)</label>
                  <input type="number" value={formData.raised} onChange={e => setFormData({ ...formData, raised: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0" disabled={saving} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Supporters</label>
                  <input type="number" value={formData.supporters} onChange={e => setFormData({ ...formData, supporters: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0" disabled={saving} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Image URL</label>
                <input type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="/drpp.png" disabled={saving} />
              </div>
              <div className="flex flex-wrap gap-6 p-4 bg-gray-50 rounded-xl">
                {[
                  { key: 'isActive', label: 'Active Project' },
                  { key: 'isLive', label: 'Show Live Badge' },
                  { key: 'isCompleted', label: 'Completed' },
                  { key: 'isParent', label: '🌐 Umbrella / Parent Project' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox"
                      checked={formData[key as keyof typeof formData] as boolean}
                      onChange={e => setFormData({ ...formData, [key]: e.target.checked })}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded" disabled={saving} />
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                  </label>
                ))}
              </div>
              {formData.isParent && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                  ℹ️ Umbrella project — add individual communities after saving.
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50" disabled={saving}>Cancel</button>
                <button type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 shadow-lg shadow-green-500/30" disabled={saving}>
                  {saving ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</span>
                    : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Community Modal */}
      {showSubModal && subModalParent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-light text-white">{editingSubProject ? 'Edit Community' : 'Add Community'}</h2>
                <p className="text-blue-200 text-sm mt-0.5">Under: {subModalParent.title}</p>
              </div>
              <button onClick={() => setShowSubModal(false)} className="p-2 hover:bg-white/20 rounded-lg" disabled={saving}>
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <form onSubmit={handleSubProjectSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Title <span className="text-red-500">*</span></label>
                <input type="text" value={subFormData.title} onChange={e => setSubFormData({ ...subFormData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Phase 1 — Kibera" required disabled={saving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Community Name</label>
                <input type="text" value={subFormData.communityName} onChange={e => setSubFormData({ ...subFormData, communityName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Kibera, Nairobi" disabled={saving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea value={subFormData.description} onChange={e => setSubFormData({ ...subFormData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3} disabled={saving} />
              </div>
              {/* Goal and Raised side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Goal ($) <span className="text-red-500">*</span></label>
                  <input type="number" value={subFormData.goal} onChange={e => setSubFormData({ ...subFormData, goal: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1" required disabled={saving} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Raised ($)</label>
                  <input type="number" value={subFormData.raised} onChange={e => setSubFormData({ ...subFormData, raised: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0" disabled={saving} />
                  <p className="text-xs text-gray-400 mt-1">Update this as donations come in</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-200">
                <button type="button" onClick={() => setShowSubModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50" disabled={saving}>Cancel</button>
                <button type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-lg shadow-blue-500/30" disabled={saving}>
                  {saving ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</span>
                    : editingSubProject ? 'Update Community' : 'Add Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && completingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-2xl font-light text-white">
                    {completingSubProject ? 'Mark Community as Completed' : 'Mark Project as Completed'}
                  </h2>
                  <p className="text-green-200 text-sm mt-0.5">
                    {completingSubProject
                      ? `${completingProject.title} → ${completingSubProject.title}`
                      : completingProject.title}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCompletionModal(false)} className="p-2 hover:bg-white/20 rounded-lg" disabled={saving}>
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <form onSubmit={handleCompletionSubmit} className="p-8 overflow-y-auto max-h-[calc(85vh-120px)] space-y-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-1">
                  {completingSubProject ? completingSubProject.title : completingProject.title}
                </h3>
                <p className="text-sm text-gray-600">
                  Goal: ${(completingSubProject ? completingSubProject.goal : completingProject.goal).toLocaleString()}
                  {completingSubProject && ` · Raised: $${(completingSubProject.raised || 0).toLocaleString()}`}
                  {!completingSubProject && ` · Raised: $${(completingProject.raised || 0).toLocaleString()}`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Completion Date <span className="text-red-500">*</span></label>
                <input type="date" value={completionFormData.completedDate}
                  onChange={e => setCompletionFormData({ ...completionFormData, completedDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required disabled={saving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Completion Story <span className="text-red-500">*</span></label>
                <textarea value={completionFormData.completionStory}
                  onChange={e => setCompletionFormData({ ...completionFormData, completionStory: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={6} required disabled={saving} placeholder="Tell the story of how this was completed..." />
              </div>
              {(['beforeImages', 'afterImages', 'progressImages'] as const).map(type => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-900">
                      {type === 'beforeImages' ? 'Before Images' : type === 'afterImages' ? 'After Images' : 'Progress/Gallery Images (Optional)'}
                    </label>
                    <button type="button" onClick={() => addImageField(type)} className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                      <Plus className="w-4 h-4" />Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {completionFormData[type].map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <input type="text" value={url} onChange={e => updateImageField(type, i, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Image URL" disabled={saving} />
                        {completionFormData[type].length > 1 && (
                          <button type="button" onClick={() => removeImageField(type, i)} className="p-3 text-red-600 hover:bg-red-50 rounded-xl">
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-4">Impact Statistics (Optional)</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">People Helped</label>
                    <input type="number" value={completionFormData.impactStats.peopleHelped}
                      onChange={e => setCompletionFormData({ ...completionFormData, impactStats: { ...completionFormData.impactStats, peopleHelped: Number(e.target.value) } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" min="0" disabled={saving} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Items Distributed</label>
                    <input type="number" value={completionFormData.impactStats.itemsDistributed}
                      onChange={e => setCompletionFormData({ ...completionFormData, impactStats: { ...completionFormData.impactStats, itemsDistributed: Number(e.target.value) } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" min="0" disabled={saving} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Custom Metric</label>
                    <input type="text" value={completionFormData.impactStats.customMetric}
                      onChange={e => setCompletionFormData({ ...completionFormData, impactStats: { ...completionFormData.impactStats, customMetric: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 5 wells built" disabled={saving} />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-900">Testimonials (Optional)</label>
                  <button type="button" onClick={addTestimonial} className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                    <Plus className="w-4 h-4" />Add
                  </button>
                </div>
                <div className="space-y-4">
                  {completionFormData.testimonials.map((t, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-gray-500">Testimonial #{i + 1}</span>
                        {completionFormData.testimonials.length > 1 && (
                          <button type="button" onClick={() => removeTestimonial(i)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input type="text" value={t.name} onChange={e => updateTestimonial(i, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Name" disabled={saving} />
                        <input type="text" value={t.role} onChange={e => updateTestimonial(i, 'role', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Role" disabled={saving} />
                        <textarea value={t.text} onChange={e => updateTestimonial(i, 'text', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none text-sm" rows={3} placeholder="Testimonial text..." disabled={saving} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button type="button" onClick={() => setShowCompletionModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50" disabled={saving}>Cancel</button>
                <button type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-medium disabled:opacity-50 shadow-lg shadow-green-500/30" disabled={saving}>
                  {saving ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</span> : 'Mark as Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && deletingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="bg-red-600 px-8 py-6 rounded-t-3xl flex items-center gap-3 text-white">
              <AlertCircle className="w-6 h-6" /><h2 className="text-xl font-medium">Delete Project</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-2">Are you sure you want to delete</p>
              <p className="text-lg font-medium text-gray-900 mb-4">&quot;{deletingProject.title}&quot;?</p>
              <p className="text-sm text-gray-500">This cannot be undone. All data including communities will be permanently removed.</p>
            </div>
            <div className="flex gap-3 px-8 pb-8">
              <button onClick={() => { setShowDeleteModal(false); setDeletingProject(null); }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50" disabled={deleting}>Cancel</button>
              <button onClick={handleDeleteProject}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 disabled:opacity-50" disabled={deleting}>
                {deleting ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</span> : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Community Modal */}
      {showDeleteSubModal && deletingSubProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="bg-red-600 px-8 py-6 rounded-t-3xl flex items-center gap-3 text-white">
              <AlertCircle className="w-6 h-6" /><h2 className="text-xl font-medium">Delete Community</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-2">Remove</p>
              <p className="text-lg font-medium text-gray-900 mb-1">&quot;{deletingSubProject.sub.title}&quot;</p>
              <p className="text-sm text-gray-500 mb-4">from {deletingSubProject.parent.title}?</p>
              <p className="text-sm text-red-500">This cannot be undone.</p>
            </div>
            <div className="flex gap-3 px-8 pb-8">
              <button onClick={() => { setShowDeleteSubModal(false); setDeletingSubProject(null); }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50" disabled={deleting}>Cancel</button>
              <button onClick={handleDeleteSubProject}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 disabled:opacity-50" disabled={deleting}>
                {deleting ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</span> : 'Delete Community'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}