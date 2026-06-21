"use client";

import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  FileText, 
  DollarSign, 
  CheckSquare, 
  Folder, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  FolderPlus,
  Trash2,
  Edit,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrganizerPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    folders: [],
    jobs: [],
    invoices: [],
    transactions: [],
    deliverables: []
  });
  const [activeTab, setActiveTab] = useState("jobs");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/organizer");
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Error fetching organizer data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (action: string, payload: any) => {
    try {
      const res = await fetch("/api/organizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: payload })
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
      }
    } catch (err) {
      console.error(`Error performing action ${action}:`, err);
    }
  };

  // Summary stats
  const totalInvoiced = data.invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);
  const totalPaid = data.invoices.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + inv.amount, 0);
  const activeJobs = data.jobs.filter((job: any) => job.status === 'active').length;
  const pendingDeliverables = data.deliverables.filter((del: any) => del.status !== 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Business Organizer</span>
            <Briefcase className="h-6 w-6 text-brand-400" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your jobs, invoices, income, and deliverables in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="secondary" size="sm">
            <Clock className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => {}} className="bg-brand-600 hover:bg-brand-700">
            <Plus className="h-4 w-4 mr-2" /> New Task
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/30 border-slate-900">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Invoiced</p>
          <h3 className="text-xl font-bold text-white mt-1">${totalInvoiced.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-2">
            <ArrowUpRight className="h-3 w-3" />
            <span>+12.5% vs last month</span>
          </div>
        </Card>
        <Card className="p-4 bg-slate-900/30 border-slate-900">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Received</p>
          <h3 className="text-xl font-bold text-emerald-400 mt-1">${totalPaid.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
            <CheckCircle2 className="h-3 w-3" />
            <span>{Math.round((totalPaid / totalInvoiced) * 100 || 0)}% collection rate</span>
          </div>
        </Card>
        <Card className="p-4 bg-slate-900/30 border-slate-900">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Jobs</p>
          <h3 className="text-xl font-bold text-white mt-1">{activeJobs}</h3>
          <div className="flex items-center gap-1 text-[10px] text-brand-400 mt-2">
            <TrendingUp className="h-3 w-3" />
            <span>4 due this week</span>
          </div>
        </Card>
        <Card className="p-4 bg-slate-900/30 border-slate-900">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deliverables</p>
          <h3 className="text-xl font-bold text-white mt-1">{pendingDeliverables}</h3>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-2">
            <AlertCircle className="h-3 w-3" />
            <span>2 past due</span>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="jobs" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
          <TabsTrigger value="jobs" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            <Briefcase className="h-4 w-4 mr-2" /> Jobs
          </TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" /> Invoices
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            <DollarSign className="h-4 w-4 mr-2" /> Ledger
          </TabsTrigger>
          <TabsTrigger value="deliverables" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            <CheckSquare className="h-4 w-4 mr-2" /> Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar with Folders */}
            <div className="w-full md:w-64 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Folders</h4>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => {
                  const name = prompt("Folder Name:");
                  if (name) handleAction('create_folder', { name });
                }}>
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm text-slate-200 bg-slate-800/40">
                  <Folder className="h-4 w-4 mr-2 text-brand-400" />
                  All Jobs
                </Button>
                {data.folders.map((folder: any) => (
                  <Button key={folder.id} variant="ghost" className="w-full justify-start text-sm text-slate-400 hover:text-slate-200">
                    <Folder className="h-4 w-4 mr-2" />
                    {folder.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Jobs List */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input 
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="Search jobs..."
                  />
                </div>
                <Button variant="secondary" size="sm" onClick={() => {
                  const title = prompt("Job Title:");
                  if (title) handleAction('create_job', { title });
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Job
                </Button>
              </div>

              <div className="grid gap-4">
                {data.jobs.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
                    <Briefcase className="h-10 w-10 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500">No jobs yet. Create your first job to get started.</p>
                  </div>
                ) : (
                  data.jobs.map((job: any) => (
                    <Card key={job.id} className="p-4 bg-slate-900/20 border-slate-900 hover:border-slate-800 transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="h-12 w-12 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 shrink-0">
                            <Briefcase className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors">{job.title}</h4>
                            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{job.description || "No description provided"}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <Badge variant="secondary" className="bg-slate-800/50 border-slate-700 text-[10px] text-slate-400 capitalize">
                                {job.status}
                              </Badge>
                              <span className="text-[10px] text-slate-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Created {new Date(job.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Invoice Management</h3>
              <Button onClick={() => {
                const client = prompt("Client Name:");
                const amount = prompt("Amount:");
                if (client && amount) handleAction('create_invoice', { client_name: client, amount: parseFloat(amount) });
              }} className="bg-brand-600 hover:bg-brand-700">
                <Plus className="h-4 w-4 mr-2" /> Create Invoice
              </Button>
            </div>

            <Card className="overflow-hidden bg-slate-900/20 border-slate-900">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/30">
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Due Date</th>
                    <th className="p-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {data.invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500">No invoices found.</td>
                    </tr>
                  ) : (
                    data.invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-white">{inv.client_name}</div>
                          <div className="text-[10px] text-slate-500">{inv.client_email || "No email"}</div>
                        </td>
                        <td className="p-4 font-bold text-white">${inv.amount.toLocaleString()}</td>
                        <td className="p-4">
                          <Badge className={`
                            text-[10px] uppercase font-bold px-2 py-0.5
                            ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              inv.status === 'overdue' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-slate-800 text-slate-400 border-slate-700'}
                          `}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-slate-500">{inv.due_date || "Not set"}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {inv.status !== 'paid' && (
                              <Button variant="secondary" size="sm" className="h-8 text-[10px] border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleAction('mark_invoice_paid', { id: inv.id })}>
                                Mark Paid
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">General Ledger</h3>
              <div className="flex gap-2">
                <Button variant="secondary" className="border-slate-800 text-slate-400 hover:text-white" onClick={() => {
                  const desc = prompt("Expense Description:");
                  const amount = prompt("Amount:");
                  if (desc && amount) handleAction('create_transaction', { type: 'expense', amount: parseFloat(amount), description: desc });
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Expense
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  const desc = prompt("Income Description:");
                  const amount = prompt("Amount:");
                  if (desc && amount) handleAction('create_transaction', { type: 'income', amount: parseFloat(amount), description: desc });
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Income
                </Button>
              </div>
            </div>

            <Card className="bg-slate-900/20 border-slate-900">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-slate-400">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                    <span className="text-xs text-slate-400">Expense</span>
                  </div>
                </div>
                <Badge variant="secondary" className="border-slate-800 text-slate-500">All Time</Badge>
              </div>
              <div className="divide-y divide-slate-800/50">
                {data.transactions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No transactions recorded.</div>
                ) : (
                  data.transactions.map((tx: any) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-800/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {tx.type === 'income' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{tx.description}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{tx.category || "General"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deliverables" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Content & Tasks</h3>
              <Button onClick={() => {
                const title = prompt("Task/Deliverable Title:");
                const jobId = prompt("Job ID (optional):");
                if (title) handleAction('create_deliverable', { title, job_id: jobId || data.jobs[0]?.id });
              }} className="bg-brand-600 hover:bg-brand-700">
                <Plus className="h-4 w-4 mr-2" /> New Task
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Tasks */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Upcoming</h4>
                <div className="space-y-3">
                  {data.deliverables.filter((d: any) => d.status !== 'completed').length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-sm">No upcoming tasks.</div>
                  ) : (
                    data.deliverables.filter((d: any) => d.status !== 'completed').map((del: any) => (
                      <Card key={del.id} className="p-4 bg-slate-900/30 border-slate-800 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full border border-slate-700 text-slate-700 hover:text-emerald-400 hover:border-emerald-400" onClick={() => handleAction('update_deliverable', { ...del, status: 'completed' })}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <div>
                            <p className="text-sm font-medium text-white">{del.title}</p>
                            <p className="text-[10px] text-brand-400/70 mt-0.5">{del.job_title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="h-3 w-3" />
                            {del.due_date || "No date"}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Completed Tasks */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Recently Completed</h4>
                <div className="space-y-3">
                  {data.deliverables.filter((d: any) => d.status === 'completed').length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-sm">No completed tasks yet.</div>
                  ) : (
                    data.deliverables.filter((d: any) => d.status === 'completed').map((del: any) => (
                      <Card key={del.id} className="p-4 bg-slate-900/10 border-slate-900/50 flex items-center justify-between opacity-60">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-400 line-through">{del.title}</p>
                            <p className="text-[10px] text-slate-600 mt-0.5">{del.job_title}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-700 italic">Done</span>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Loading your workspace...</p>
          </div>
        </div>
      )}
    </div>
  );
}
