"use client"

import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, AlertCircle, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, onSnapshot, orderBy, query,
} from 'firebase/firestore';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date?: string;
  note?: string;
}

interface Workspace {
  id: string;
  name: string;
  logo?: string;
  totalReceived: number;
  date?: string;
  note?: string;
  expenses: Expense[];
}

const defaultWorkspaceForm = { name: '', logo: '', totalReceived: 0, date: new Date().toISOString().split('T')[0], note: '' };
const defaultExpenseForm = { description: '', amount: 0, date: new Date().toISOString().split('T')[0], note: '' };

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

const genId = () => `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export default function AdminGivingCirclePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Workspace modal
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [workspaceForm, setWorkspaceForm] = useState(defaultWorkspaceForm);

  // Expense modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseParent, setExpenseParent] = useState<Workspace | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState(defaultExpenseForm);

  // Delete modals
  const [showDeleteWorkspace, setShowDeleteWorkspace] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);
  const [showDeleteExpense, setShowDeleteExpense] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<{ expense: Expense; workspace: Workspace } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'workspaces'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setWorkspaces(snap.docs.map(d => ({ id: d.id, ...d.data() } as Workspace)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Workspace submit ──
  const openWorkspaceModal = (workspace: Workspace | null = null) => {
    setEditingWorkspace(workspace);
    setWorkspaceForm(workspace ? {
      name: workspace.name, logo: workspace.logo || '',
      totalReceived: workspace.totalReceived, date: workspace.date || '',
      note: workspace.note || '',
    } : defaultWorkspaceForm);
    setShowWorkspaceModal(true);
  };

  const handleWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceForm.name) return;
    setSaving(true);
    try {
      if (editingWorkspace) {
        await updateDoc(doc(db, 'workspaces', editingWorkspace.id), {
          ...workspaceForm, totalReceived: Number(workspaceForm.totalReceived),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'workspaces'), {
          ...workspaceForm, totalReceived: Number(workspaceForm.totalReceived),
          expenses: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
      }
      setShowWorkspaceModal(false);
    } catch (err) {
      alert('Failed: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!deletingWorkspace) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'workspaces', deletingWorkspace.id));
      setShowDeleteWorkspace(false); setDeletingWorkspace(null);
    } catch (err) {
      alert('Failed: ' + (err instanceof Error ? err.message : err));
    } finally {
      setDeleting(false);
    }
  };

  // ── Expense submit ──
  const openExpenseModal = (workspace: Workspace, expense: Expense | null = null) => {
    setExpenseParent(workspace);
    setEditingExpense(expense);
    setExpenseForm(expense ? {
      description: expense.description, amount: expense.amount,
      date: expense.date || '', note: expense.note || '',
    } : defaultExpenseForm);
    setShowExpenseModal(true);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseParent || !expenseForm.description) return;
    setSaving(true);
    try {
      const current = expenseParent.expenses || [];
      let updated: Expense[];
      if (editingExpense) {
        updated = current.map(ex => ex.id === editingExpense.id
          ? { ...ex, ...expenseForm, amount: Number(expenseForm.amount) } : ex);
      } else {
        updated = [...current, { id: genId(), ...expenseForm, amount: Number(expenseForm.amount) }];
      }
      await updateDoc(doc(db, 'workspaces', expenseParent.id), {
        expenses: updated, updatedAt: serverTimestamp(),
      });
      setShowExpenseModal(false);
    } catch (err) {
      alert('Failed: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;
    setDeleting(true);
    try {
      const updated = deletingExpense.workspace.expenses.filter(e => e.id !== deletingExpense.expense.id);
      await updateDoc(doc(db, 'workspaces', deletingExpense.workspace.id), {
        expenses: updated, updatedAt: serverTimestamp(),
      });
      setShowDeleteExpense(false); setDeletingExpense(null);
    } catch (err) {
      alert('Failed: ' + (err instanceof Error ? err.message : err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Giving Circle</h1>
          <p className="text-sm text-gray-500 mt-1">Manage workplace donations and how they were spent.</p>
        </div>
        <button onClick={() => openWorkspaceModal()}
          className="px-6 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Workspace
        </button>
      </div>

      {/* Summary */}
      {workspaces.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs text-gray-500 mb-1">Total Received</p>
            <p className="text-3xl font-light text-green-600">
              {formatCurrency(workspaces.reduce((s, w) => s + (w.totalReceived || 0), 0))}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs text-gray-500 mb-1">Workspaces</p>
            <p className="text-3xl font-light text-gray-900">{workspaces.length}</p>
          </div>
        </div>
      )}

      {/* Workspace list */}
      {workspaces.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No workspaces yet. Click "Add Workspace" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workspaces.map(workspace => {
            const isOpen = expanded.has(workspace.id);
            const expenses = workspace.expenses || [];
            const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);
            const remaining = (workspace.totalReceived || 0) - totalSpent;

            return (
              <div key={workspace.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

                {/* Workspace header */}
                <div className="flex items-center gap-4 p-6">
                  {/* Expand button */}
                  <button onClick={() => toggleExpand(workspace.id)} className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0">
                    {isOpen
                      ? <ChevronDown className="w-5 h-5 text-gray-500" />
                      : <ChevronRight className="w-5 h-5 text-gray-500" />}
                  </button>

                  {/* Logo */}
                  <div className="w-16 h-12 relative flex-shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-1.5">
                    {workspace.logo ? (
                      <Image src={workspace.logo} alt={workspace.name} fill className="object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-lg font-light text-green-600">{workspace.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{workspace.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {workspace.date && (
                        <span className="text-xs text-gray-400">
                          {new Date(workspace.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      )}
                      {workspace.note && <span className="text-xs text-gray-400 italic">{workspace.note}</span>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0 mr-4">
                    <p className="text-xs text-gray-400">Received</p>
                    <p className="text-2xl font-light text-green-600">{formatCurrency(workspace.totalReceived || 0)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Spent: {formatCurrency(totalSpent)} · Left: {formatCurrency(remaining)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openExpenseModal(workspace)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-full text-xs hover:bg-green-700 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Expense
                    </button>
                    <button onClick={() => openWorkspaceModal(workspace)}
                      className="px-3 py-1.5 border border-gray-200 rounded-full text-xs hover:bg-gray-50">
                      Edit
                    </button>
                    <button onClick={() => { setDeletingWorkspace(workspace); setShowDeleteWorkspace(true); }}
                      className="p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Expenses panel */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    {expenses.length === 0 ? (
                      <div className="px-8 py-6 text-sm text-gray-400 text-center">
                        No expenses yet. Click "+ Expense" to add one.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {expenses.map((expense, idx) => (
                          <div key={expense.id || idx} className="flex items-center justify-between gap-4 px-8 py-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 font-light">{expense.description}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                {expense.date && (
                                  <span className="text-xs text-gray-400">
                                    {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                )}
                                {expense.note && <span className="text-xs text-gray-400 italic">{expense.note}</span>}
                              </div>
                            </div>
                            <p className="text-lg font-light text-gray-900 flex-shrink-0">{formatCurrency(expense.amount || 0)}</p>
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => openExpenseModal(workspace, expense)}
                                className="px-3 py-1 border border-gray-200 rounded-full text-xs hover:bg-white">
                                Edit
                              </button>
                              <button onClick={() => { setDeletingExpense({ expense, workspace }); setShowDeleteExpense(true); }}
                                className="p-1 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Progress summary */}
                    {workspace.totalReceived > 0 && expenses.length > 0 && (
                      <div className="px-8 py-4 border-t border-gray-200">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                          <span>Allocated ({Math.round((totalSpent / workspace.totalReceived) * 100)}%)</span>
                          <span>{formatCurrency(totalSpent)} of {formatCurrency(workspace.totalReceived)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-600 rounded-full transition-all"
                            style={{ width: `${Math.min((totalSpent / workspace.totalReceived) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit Workspace Modal ── */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 flex items-center justify-between">
              <h2 className="text-xl font-light text-white">{editingWorkspace ? 'Edit Workspace' : 'Add Workspace'}</h2>
              <button onClick={() => setShowWorkspaceModal(false)} className="p-2 hover:bg-white/20 rounded-lg" disabled={saving}>
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <form onSubmit={handleWorkspaceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Workspace Name <span className="text-red-500">*</span></label>
                <input type="text" value={workspaceForm.name} onChange={e => setWorkspaceForm({ ...workspaceForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="e.g., Google" required disabled={saving} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Logo URL</label>
                  <input type="text" value={workspaceForm.logo} onChange={e => setWorkspaceForm({ ...workspaceForm, logo: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="/google-logo.png" disabled={saving} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Received ($) <span className="text-red-500">*</span></label>
                  <input type="number" value={workspaceForm.totalReceived} onChange={e => setWorkspaceForm({ ...workspaceForm, totalReceived: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    min="0" required disabled={saving} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Date</label>
                  <input type="date" value={workspaceForm.date} onChange={e => setWorkspaceForm({ ...workspaceForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    disabled={saving} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Note</label>
                  <input type="text" value={workspaceForm.note} onChange={e => setWorkspaceForm({ ...workspaceForm, note: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="e.g., Employee Giving 2024" disabled={saving} />
                </div>
              </div>
              {/* Logo preview */}
              {workspaceForm.logo && (
                <div className="w-24 h-12 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={workspaceForm.logo} alt="Preview" className="max-h-full max-w-full object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
              <div className="flex gap-3 pt-2 border-t border-gray-200">
                <button type="button" onClick={() => setShowWorkspaceModal(false)}
                  className="flex-1 px-5 py-2.5 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50" disabled={saving}>Cancel</button>
                <button type="submit"
                  className="flex-1 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-medium disabled:opacity-50" disabled={saving}>
                  {saving ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</span>
                    : editingWorkspace ? 'Update' : 'Add Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add/Edit Expense Modal ── */}
      {showExpenseModal && expenseParent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-light text-white">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
                <p className="text-green-200 text-sm mt-0.5">Under: {expenseParent.name}</p>
              </div>
              <button onClick={() => setShowExpenseModal(false)} className="p-2 hover:bg-white/20 rounded-lg" disabled={saving}>
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                <input type="text" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="e.g., Water filters for Kibera" required disabled={saving} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Amount ($) <span className="text-red-500">*</span></label>
                  <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    min="0" required disabled={saving} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Date</label>
                  <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    disabled={saving} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Note</label>
                <input type="text" value={expenseForm.note} onChange={e => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Optional details..." disabled={saving} />
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-200">
                <button type="button" onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-5 py-2.5 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50" disabled={saving}>Cancel</button>
                <button type="submit"
                  className="flex-1 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-medium disabled:opacity-50" disabled={saving}>
                  {saving ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</span>
                    : editingExpense ? 'Update' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Workspace Modal ── */}
      {showDeleteWorkspace && deletingWorkspace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="bg-red-600 px-8 py-6 rounded-t-3xl flex items-center gap-3 text-white">
              <AlertCircle className="w-6 h-6" /><h2 className="text-xl font-medium">Delete Workspace</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-2">Delete <span className="font-medium text-gray-900">"{deletingWorkspace.name}"</span>?</p>
              <p className="text-sm text-red-500">All expenses under this workspace will also be deleted. This cannot be undone.</p>
            </div>
            <div className="flex gap-3 px-8 pb-8">
              <button onClick={() => { setShowDeleteWorkspace(false); setDeletingWorkspace(null); }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50" disabled={deleting}>Cancel</button>
              <button onClick={handleDeleteWorkspace}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 disabled:opacity-50" disabled={deleting}>
                {deleting ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</span> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Expense Modal ── */}
      {showDeleteExpense && deletingExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="bg-red-600 px-8 py-6 rounded-t-3xl flex items-center gap-3 text-white">
              <AlertCircle className="w-6 h-6" /><h2 className="text-xl font-medium">Delete Expense</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-2">Delete <span className="font-medium text-gray-900">"{deletingExpense.expense.description}"</span>?</p>
              <p className="text-sm text-red-500">This cannot be undone.</p>
            </div>
            <div className="flex gap-3 px-8 pb-8">
              <button onClick={() => { setShowDeleteExpense(false); setDeletingExpense(null); }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50" disabled={deleting}>Cancel</button>
              <button onClick={handleDeleteExpense}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 disabled:opacity-50" disabled={deleting}>
                {deleting ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</span> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}