"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Search, Download, ArrowUpRight, ArrowDownRight, TrendingUp, Target } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';

interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  project: string;
  receipt?: string;
  paymentMethod?: string;
  donorEmail?: string;
  createdAt?: any;
}

interface Project {
  id: string;
  title: string;
  raised: number;
  goal: number;
  category: string;
  isActive: boolean;
}

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch projects first
      const projectsSnapshot = await getDocs(
        query(collection(db, 'projects'), where('isActive', '==', true), orderBy('createdAt', 'desc'))
      );

      const projectsData: Project[] = projectsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Project',
          raised: data.raised || 0,
          goal: data.goal || 0,
          category: data.category || 'general',
          isActive: data.isActive || false
        };
      });

      setProjects(projectsData);

      // Fetch transactions
      const allTransactions: Transaction[] = [];

      // Fetch donations (income)
      const donationsSnapshot = await getDocs(
        query(collection(db, 'donations'), orderBy('createdAt', 'desc'))
      );

      donationsSnapshot.forEach((doc) => {
        const data = doc.data();
        allTransactions.push({
          id: doc.id,
          type: 'income',
          date: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          category: 'donation',
          description: `Donation from ${data.donorEmail || 'Anonymous'}`,
          amount: data.amount || 0,
          project: data.projectId || 'General',
          paymentMethod: 'Stripe',
          donorEmail: data.donorEmail,
          createdAt: data.createdAt
        });
      });

      // Fetch expenses
      const expensesSnapshot = await getDocs(
        query(collection(db, 'expenses'), orderBy('createdAt', 'desc'))
      );

      expensesSnapshot.forEach((doc) => {
        const data = doc.data();
        
        let expenseDate;
        if (data.createdAt?.toDate) {
          expenseDate = data.createdAt.toDate().toISOString();
        } else if (data.createdAt?.seconds) {
          expenseDate = new Date(data.createdAt.seconds * 1000).toISOString();
        } else if (data.date) {
          expenseDate = data.date;
        } else {
          expenseDate = new Date().toISOString();
        }
        
        allTransactions.push({
          id: doc.id,
          type: 'expense',
          date: expenseDate,
          category: data.category || 'general',
          description: data.description || 'Expense',
          amount: data.amount || 0,
          project: data.project || 'General',
          receipt: data.receipt,
          createdAt: data.createdAt
        });
      });

      // Sort by date (newest first)
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      setTransactions(allTransactions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate total raised across all projects
  const totalProjectFunds = projects.reduce((sum, p) => sum + p.raised, 0);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = selectedFilter === 'all' || transaction.type === selectedFilter;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.project.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Project', 'Amount', 'Category', 'Receipt/Payment'];
    const csvData = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.description,
      t.project,
      t.amount,
      t.category,
      t.receipt || t.paymentMethod || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-emerald-100 font-medium">
                Financial Transparency
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extralight mb-6 tracking-tight">
              Public <span className="font-medium">Ledger</span>
            </h1>
            <p className="text-lg text-emerald-50 max-w-xl mx-auto font-light leading-relaxed">
              Every dollar tracked. Every transaction visible. Complete transparency.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Total Income</span>
              </div>
              <p className="text-5xl font-extralight text-gray-900 mb-2">
                ${totalIncome.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 font-light">
                {transactions.filter(t => t.type === 'income').length} donations received
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 rounded-2xl">
                  <ArrowDownRight className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Total Expenses</span>
              </div>
              <p className="text-5xl font-extralight text-gray-900 mb-2">
                ${totalExpenses.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 font-light">
                {transactions.filter(t => t.type === 'expense').length} expenses tracked
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT FUNDS BREAKDOWN - NEW SECTION */}
      <section className="max-w-6xl mx-auto px-6 -mt-8 mb-12">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-2">
                Project Funds <span className="font-normal text-emerald-600">Breakdown</span>
              </h2>
              <p className="text-sm text-gray-500 font-light">
                Live tracking of funds raised for each active project
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Total Project Funds</p>
              <p className="text-3xl font-extralight text-emerald-600">
                ${totalProjectFunds.toLocaleString()}
              </p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-light">No active projects yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-normal text-gray-900 mb-1">
                        {project.title}
                      </h3>
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                        {project.category.replace(/-/g, ' ')}
                      </span>
                    </div>
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <Target className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Raised</p>
                        <p className="text-3xl font-extralight text-emerald-600">
                          ${project.raised.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Goal</p>
                        <p className="text-xl font-light text-gray-700">
                          ${project.goal.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs font-medium text-emerald-600">
                          {project.goal > 0 ? Math.round((project.raised / project.goal) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${project.goal > 0 ? Math.min((project.raised / project.goal) * 100, 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Rest of the component continues... */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100/50">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-5 py-2.5 rounded-full text-sm font-light transition-all duration-200 ${
                  selectedFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                All <span className="opacity-70">({transactions.length})</span>
              </button>
              <button
                onClick={() => setSelectedFilter('income')}
                className={`px-5 py-2.5 rounded-full text-sm font-light transition-all duration-200 ${
                  selectedFilter === 'income'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Income <span className="opacity-70">({transactions.filter(t => t.type === 'income').length})</span>
              </button>
              <button
                onClick={() => setSelectedFilter('expense')}
                className={`px-5 py-2.5 rounded-full text-sm font-light transition-all duration-200 ${
                  selectedFilter === 'expense'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Expenses <span className="opacity-70">({transactions.filter(t => t.type === 'expense').length})</span>
              </button>
            </div>

            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-light text-sm"
              />
            </div>

            <button 
              onClick={exportToCSV}
              className="px-5 py-2.5 bg-gray-50 rounded-full text-sm hover:bg-gray-100 flex items-center gap-2 whitespace-nowrap transition-all font-light"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-gray-900">
            Transaction <span className="font-normal text-emerald-600">History</span>
          </h2>
          <p className="text-sm text-gray-500 font-light mt-1">
            Complete record of all financial activities
          </p>
        </div>

        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100/50">
              <p className="text-gray-500 font-light">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 hover:shadow-md hover:border-gray-200/50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-normal text-gray-900 mb-1 truncate">
                        {transaction.description}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="font-light">
                          {transaction.project.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        {transaction.category && (
                          <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="font-light capitalize">{transaction.category.replace(/-/g, ' ')}</span>
                          </>
                        )}
                        {transaction.paymentMethod && (
                          <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="font-light">via {transaction.paymentMethod}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`text-3xl font-extralight mb-1 ${
                      transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '−'}${transaction.amount.toLocaleString()}
                    </p>
                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium ${
                      transaction.type === 'income'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-white border-t border-gray-100 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extralight text-gray-900 mb-4">
            Built on <span className="font-normal text-emerald-600">Transparency</span>
          </h2>
          <p className="text-base text-gray-600 mb-16 font-light leading-relaxed max-w-2xl mx-auto">
            We believe in complete transparency. Every donation tracked, every expense documented, 
            every project's funds clearly displayed. Your trust is our foundation.
          </p>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-normal text-gray-900 mb-2">100% Tracked</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                Every transaction recorded and publicly visible
              </p>
            </div>
            <div className="group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-normal text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                Ledger updates immediately with new transactions
              </p>
            </div>
            <div className="group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Download className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-normal text-gray-900 mb-2">Downloadable</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                Export complete financial reports anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}