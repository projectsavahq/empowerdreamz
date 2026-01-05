"use client"

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X, AlertCircle } from 'lucide-react';
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
 createdAt?: { toDate: () => Date } | Date | null;
  updatedAt?: { toDate: () => Date } | Date | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tagline: '',
    description: '',
    callToAction: '',
    category: 'water',
    goal: 0,
    image: '',
    tag: '',
    isActive: true,
    isLive: false
  });

  // Fetch projects from Firebase with real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project));
        setProjects(projectsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (project: Project | null = null) => {
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
        image: project.image || '',
        tag: project.tag || '',
        isActive: project.isActive ?? true,
        isLive: project.isLive ?? false
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        subtitle: '',
        tagline: '',
        description: '',
        callToAction: '',
        category: 'water',
        goal: 0,
        image: '',
        tag: '',
        isActive: true,
        isLive: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleOpenDeleteModal = (project: Project) => {
    setDeletingProject(project);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || formData.goal <= 0) {
      alert('Please fill in all required fields (Title, Description, Goal)');
      return;
    }

    setSaving(true);
    
    try {
      if (editingProject) {
        const projectRef = doc(db, 'projects', editingProject.id);
        await updateDoc(projectRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        const projectId = formData.title.toLowerCase().replace(/\s+/g, '-');
        await addDoc(collection(db, 'projects'), {
          ...formData,
          id: projectId,
          raised: 0,
          supporters: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    
    setDeleting(true);
    
    try {
      await deleteDoc(doc(db, 'projects', deletingProject.id));
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-light text-gray-900">Projects</h1>
            <button 
              onClick={() => handleOpenModal()}
              className="px-6 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>

          <div className="grid gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-light text-gray-900">{project.title}</h3>
                      {project.isLive && (
                        <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                      )}
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        project.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {project.subtitle && (
                      <p className="text-sm text-gray-500 mb-1">{project.subtitle}</p>
                    )}
                    {project.tagline && (
                      <p className="text-sm text-gray-600 mb-3 italic">{project.tagline}</p>
                    )}
                    {project.tag && (
                      <span className="text-xs text-gray-400 uppercase tracking-wide">{project.tag}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(project)}
                      className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(project)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Raised</p>
                    <p className="text-2xl font-light text-green-600">
                      ${(project.raised || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Goal</p>
                    <p className="text-2xl font-light text-gray-900">
                      ${(project.goal || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Supporters</p>
                    <p className="text-2xl font-light text-gray-900">{project.supporters || 0}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>
                      {project.goal > 0 
                        ? ((project.raised || 0) / project.goal * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 rounded-full transition-all"
                      style={{ 
                        width: `${project.goal > 0 
                          ? Math.min((project.raised || 0) / project.goal * 100, 100) 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No projects yet</p>
                <button 
                  onClick={() => handleOpenModal()}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Create your first project
                </button>
              </div>
            )}
          </div>

        {/* Add/Edit Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-fadeIn">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 flex items-center justify-between">
            <h2 className="text-2xl font-light text-white">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <button 
              onClick={handleCloseModal} 
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              disabled={saving}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Modal Body - FIXED SCROLLBAR */}
          <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(85vh-120px)] scrollbar-hide">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="e.g., Drops Of Hope"
                  disabled={saving}
                  required
                />
              </div>

              {/* Subtitle & Tagline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Together for Change"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Empowering Lives"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Describe your project and its impact..."
                  disabled={saving}
                  required
                />
              </div>

              {/* Call to Action & Tag */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Call to Action</label>
                  <input
                    type="text"
                    value={formData.callToAction}
                    onChange={(e) => setFormData({...formData, callToAction: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Donate now"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tag</label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({...formData, tag: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Ongoing Initiative"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Category & Goal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={saving}
                  >
                    <option value="water">Water</option>
                    <option value="education">Education</option>
                    <option value="health">Health</option>
                    <option value="food">Food</option>
                    <option value="shelter">Shelter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Goal Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: Number(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={saving}
                    required
                    min="1"
                    placeholder="50000"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="/drpp.png"
                  disabled={saving}
                />
                {formData.image && (
                  <p className="text-xs text-gray-500 mt-1">Preview: {formData.image}</p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="flex gap-8 p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    disabled={saving}
                  />
                  <span className="text-sm font-medium text-gray-900">Active Project</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLive}
                    onChange={(e) => setFormData({...formData, isLive: e.target.checked})}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    disabled={saving}
                  />
                  <span className="text-sm font-medium text-gray-900">Show Live Badge</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/30"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : (
                    editingProject ? 'Update Project' : 'Create Project'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )}

    
    {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="bg-red-600 px-8 py-6 rounded-t-3xl">
              <div className="flex items-center gap-3 text-white">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-xl font-medium">Delete Project</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete
              </p>
              <p className="text-lg font-medium text-gray-900 mb-4">
                &quot;{deletingProject.title}&quot;?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone. All project data, including donation history, will be permanently removed.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-8 pb-8">
              <button
                onClick={handleCloseDeleteModal}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={deleting}
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </span>
                ) : (
                  'Delete Project'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}