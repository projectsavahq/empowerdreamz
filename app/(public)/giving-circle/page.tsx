"use client"

import React, { useState, useEffect } from 'react';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  expenses?: Expense[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

export default function GivingCirclePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const q = query(collection(db, 'workspaces'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWorkspaces(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workspace)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalAllReceived = workspaces.reduce((sum, w) => sum + (w.totalReceived || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafffa] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#fafffa] min-h-screen">

      {/* HERO */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(22 163 74) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            <span className="text-sm text-gray-500 tracking-wider uppercase">Transparency</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-6 leading-tight">
            Giving <span className="font-semibold text-green-600">Circle</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed mb-12">
            Companies and their employees who chose to support our mission. Every dollar received is fully accounted for below.
          </p>

          {/* Total received stat */}
          {totalAllReceived > 0 && (
            <div className="inline-flex items-center gap-6 bg-white border border-gray-100 rounded-2xl px-8 py-5 shadow-sm">
              <div className="text-left">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Received</p>
                <p className="text-3xl font-light text-green-600">{formatCurrency(totalAllReceived)}</p>
              </div>
              <div className="w-px h-12 bg-gray-100" />
              <div className="text-left">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Organisations</p>
                <p className="text-3xl font-light text-gray-900">{workspaces.length}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* WORKSPACES */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {workspaces.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-500 font-light">No workplace donations yet.</p>
            </div>
          ) : (
            workspaces.map(workspace => {
              const isOpen = expanded.has(workspace.id);
              const expenses = workspace.expenses || [];
              const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
              const remaining = (workspace.totalReceived || 0) - totalSpent;

              return (
                <div key={workspace.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">

                  {/* Header row — logo + total + toggle */}
                  <button
                    onClick={() => toggleExpand(workspace.id)}
                    className="w-full flex items-center justify-between gap-6 p-8 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-6">
                      {/* Logo */}
                      <div className="w-20 h-14 relative flex-shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-2">
                        {workspace.logo ? (
                          <Image src={workspace.logo} alt={workspace.name} fill className="object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl font-light text-green-600">{workspace.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>

                      {/* Name + date */}
                      <div>
                        <h3 className="text-2xl font-light text-gray-900">{workspace.name}</h3>
                        {workspace.date && (
                          <p className="text-sm text-gray-400 mt-0.5">
                            {new Date(workspace.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        )}
                        {workspace.note && (
                          <p className="text-sm text-gray-500 italic mt-0.5">{workspace.note}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-8 flex-shrink-0">
                      {/* Total received */}
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Received</p>
                        <p className="text-3xl font-light text-green-600">{formatCurrency(workspace.totalReceived || 0)}</p>
                      </div>

                      {/* Expand toggle */}
                      <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0">
                        {isOpen
                          ? <ChevronUp className="w-5 h-5 text-gray-500" />
                          : <ChevronDown className="w-5 h-5 text-gray-500" />
                        }
                      </div>
                    </div>
                  </button>

                  {/* Expenses breakdown — shown when expanded */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-8 pb-8">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-6 mb-4">
                        How it was spent
                      </h4>

                      {expenses.length === 0 ? (
                        <p className="text-gray-400 text-sm italic">No expenses recorded yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {expenses.map((expense, idx) => (
                            <div key={expense.id || idx} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-900 font-light">{expense.description}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  {expense.date && (
                                    <span className="text-xs text-gray-400">
                                      {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                  )}
                                  {expense.note && (
                                    <span className="text-xs text-gray-400 italic">{expense.note}</span>
                                  )}
                                </div>
                              </div>
                              <p className="text-lg font-light text-gray-900 flex-shrink-0">
                                {formatCurrency(expense.amount || 0)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Summary bar */}
                      <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <p className="text-xs text-gray-400 mb-1">Received</p>
                          <p className="text-xl font-light text-green-600">{formatCurrency(workspace.totalReceived || 0)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <p className="text-xs text-gray-400 mb-1">Spent</p>
                          <p className="text-xl font-light text-gray-900">{formatCurrency(totalSpent)}</p>
                        </div>
                        <div className={`rounded-xl p-4 text-center ${remaining > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-400 mb-1">Remaining</p>
                          <p className={`text-xl font-light ${remaining > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {formatCurrency(remaining)}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {workspace.totalReceived > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                            <span>Allocated</span>
                            <span>{Math.min(Math.round((totalSpent / workspace.totalReceived) * 100), 100)}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((totalSpent / workspace.totalReceived) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-6">
            Does your workplace <span className="font-semibold">give back?</span>
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            If your company has a workplace giving programme, nominate us. Every contribution is fully transparent and publicly reported.
          </p>
          <Link href="/contact">
            <button className="px-8 py-4 bg-white text-green-600 rounded-full hover:bg-gray-100 transition-all duration-300 font-light">
              Get In Touch
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}