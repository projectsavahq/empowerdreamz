"use client"

import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, AlertCircle, ExternalLink, Building2 } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';

interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  amount?: number;
  project?: string;
  note?: string;
  date?: string;
  createdAt?: any;
}

const defaultForm = {
  name: '',
  logo: '',
  website: '',
  amount: 0,
  project: '',
  note: '',
  date: new Date().toISOString().split('T')[0],
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'partners'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPartners(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Partner)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, []);

  const openModal = (partner: Partner | null = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name || '',
        logo: partner.logo || '',
        website: partner.website || '',
        amount: partner.amount || 0,
        project: partner.project || '',
        note: partner.note || '',
        date: partner.date || new Date().toISOString().split('T')[0],
      });
    } else {
      setEditingPartner(null);
      setFormData(defaultForm);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) { alert('Partner name is required'); return; }
    setSaving(true);
    try {
      if (editingPartner) {
        await updateDoc(doc(db, 'partners', editingPartner.id), {
          ...formData,
          amount: Number(formData.amount),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'partners'), {
          ...formData,
          amount: Number(formData.amount),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      setEditingPartner(null);
    } catch (err) {
      alert('Failed to save: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPartner) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'partners', deletingPartner.id));
      setShowDeleteModal(false);
      setDeletingPartner(null);
    } catch (err) {
      alert('Failed to delete: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  const totalContributed = partners.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Partners</h1>
          <p className="text-sm text-gray-500 mt-1">
            Partners added here will show on the public Partners page and Ledger.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-6 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Summary card */}
      {partners.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs text-gray-500 mb-1">Total Partners</p>
            <p className="text-3xl font-light text-gray-900">{partners.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs text-gray-500 mb-1">Total Contributions</p>
            <p className="text-3xl font-light text-green-600">{formatCurrency(totalContributed)}</p>
          </div>
        </div>
      )}

      {/* Partners list */}
      <div className="grid gap-4">
        {partners.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">No partners added yet</p>
            <p className="text-sm text-gray-400">Click "Add Partner" to get started</p>
          </div>
        ) : (
          partners.map(partner => (
            <div key={partner.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-5 flex-1 min-w-0">
                {/* Logo preview */}
                <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {partner.logo ? (
                    <div className="relative w-full h-full p-2">
                      <Image src={partner.logo} alt={partner.name} fill className="object-contain p-1" />
                    </div>
                  ) : (
                    <span className="text-2xl font-light text-gray-300">{partner.name.charAt(0)}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-medium text-gray-900">{partner.name}</h3>
                    {partner.website && (
                      <a href={partner.website} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-green-600 flex items-center gap-1 hover:underline">
                        <ExternalLink className="w-3 h-3" />
                        {partner.website.replace(/^https?:\/\//, '').split('/')[0]}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {partner.amount && partner.amount > 0 && (
                      <span className="text-sm text-green-600 font-medium">{formatCurrency(partner.amount)}</span>
                    )}
                    {partner.project && (
                      <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">{partner.project}</span>
                    )}
                    {partner.date && (
                      <span className="text-xs text-gray-400">
                        {new Date(partner.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    )}
                    {partner.note && (
                      <span className="text-xs text-gray-500 italic">{partner.note}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openModal(partner)}
                  className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50">
                  Edit
                </button>
                <button onClick={() => { setDeletingPartner(partner); setShowDeleteModal(true); }}
                  className="p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 flex items-center justify-between">
              <h2 className="text-xl font-light text-white">
                {editingPartner ? 'Edit Partner' : 'Add Partner'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg" disabled={saving}>
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name + Logo preview */}
              <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Partner Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="e.g., Google.org" required disabled={saving} />
                </div>
                {formData.logo && (
                  <div className="w-16 h-10 relative bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                    <Image src={formData.logo} alt="Preview" fill className="object-contain p-1" />
                  </div>
                )}
              </div>

              {/* Logo + Website */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Logo URL</label>
                  <input type="text" value={formData.logo} onChange={e => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="/logo.png" disabled={saving} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Website</label>
                  <input type="text" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="https://..." disabled={saving} />
                </div>
              </div>

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Amount ($) <span className="text-gray-400 font-normal">optional</span></label>
                  <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    min="0" placeholder="0" disabled={saving} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    disabled={saving} />
                </div>
              </div>

              {/* Project + Note */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Project</label>
                  <input type="text" value={formData.project} onChange={e => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="Drops of Hope" disabled={saving} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Note</label>
                  <input type="text" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="e.g., Grant 2024" disabled={saving} />
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-5 py-2.5 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50" disabled={saving}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-medium disabled:opacity-50 shadow-lg shadow-green-500/30" disabled={saving}>
                  {saving
                    ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</span>
                    : editingPartner ? 'Update Partner' : 'Add Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {showDeleteModal && deletingPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="bg-red-600 px-8 py-6 rounded-t-3xl flex items-center gap-3 text-white">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl font-medium">Remove Partner</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-2">Are you sure you want to remove</p>
              <p className="text-lg font-medium text-gray-900 mb-4">&quot;{deletingPartner.name}&quot;?</p>
              <p className="text-sm text-gray-500">
                This will remove them from the public Partners page and Ledger. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 px-8 pb-8">
              <button onClick={() => { setShowDeleteModal(false); setDeletingPartner(null); }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50" disabled={deleting}>
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 disabled:opacity-50" disabled={deleting}>
                {deleting
                  ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Removing...</span>
                  : 'Remove Partner'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}