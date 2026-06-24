"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Search, 
  Loader2, 
  FileSpreadsheet, 
  ArrowUpDown, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  Code
} from "lucide-react";

export default function TasksHistoryPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [viewRawJson, setViewRawJson] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    // Automatically poll tasks every 5 seconds to capture running states finishing
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedTask === id) {
      setExpandedTask(null);
    } else {
      setExpandedTask(id);
      setViewRawJson(null);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "running":
        return <Badge variant="warning" className="animate-pulse">Running</Badge>;
      case "pending":
        return <Badge variant="info">Pending</Badge>;
      case "failed":
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <History className="h-7 w-7 text-brand-400" />
          <span>Execution Tasks Board</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor your deployed agents, view live outputs, and download raw lead results.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter tasks by keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchTasks} className="h-10 shrink-0">
          <Loader2 className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Reload List
        </Button>
      </div>

      {/* Tasks List */}
      {loading && tasks.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-10 w-10 text-brand-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Connecting to task database...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="bg-slate-900/10 border-slate-900/80 p-12 text-center max-w-2xl mx-auto">
          <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No tasks found</h3>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            {searchQuery 
              ? "No execution histories match your current keyword search." 
              : "You haven't dispatched any executive tasks yet. Go to your dashboard to launch your first agent."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isExpanded = expandedTask === task.id;
            const isViewingJson = viewRawJson === task.id;
            return (
              <Card 
                key={task.id} 
                className={`transition-all duration-200 border-slate-900 bg-slate-900/20 overflow-hidden ${
                  isExpanded ? "ring-1 ring-brand-500 border-transparent bg-slate-900/30 shadow-2xl" : "hover:border-slate-800"
                }`}
              >
                {/* Header Card */}
                <div 
                  onClick={() => toggleExpand(task.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <p className="text-xs font-mono text-slate-500 font-bold">ID: {task.id}</p>
                      <span className="text-slate-700 text-xs">•</span>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(task.created_at).toLocaleDateString()} at {new Date(task.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate leading-relaxed max-w-xl pr-6">
                      {task.description}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4 self-end md:self-auto">
                    {getStatusBadge(task.status)}
                    <span className="text-slate-700">|</span>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-white">
                      {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-900/80 pt-5 space-y-4">
                    {/* Prompt info */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Original Instruction</h4>
                      <p className="text-slate-300 text-sm bg-slate-950 p-4 rounded-lg border border-slate-900/80 font-mono text-xs leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {/* Result block */}
                    {task.status === "completed" && task.result && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agent Compilation Outputs</h4>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setViewRawJson(isViewingJson ? null : task.id)}
                              className="h-8 text-xs font-mono"
                            >
                              <Code className="h-3.5 w-3.5 mr-1.5" /> {isViewingJson ? "Hide JSON" : "Show JSON"}
                            </Button>
                            <a 
                              href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(task.result, null, 2))}`}
                              download={`axel_${task.id}.json`}
                            >
                              <Button size="sm" variant="accent" className="h-8 text-xs">
                                <Download className="h-3.5 w-3.5 mr-1.5" /> Download Lead File
                              </Button>
                            </a>
                          </div>
                        </div>

                        {isViewingJson ? (
                          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-900/80 text-[11px] font-mono text-brand-400 overflow-x-auto leading-relaxed max-h-96">
                            {JSON.stringify(task.result, null, 2)}
                          </pre>
                        ) : (
                          <div className="grid md:grid-cols-5 gap-6">
                            {/* Summary / Stats left */}
                            <div className="md:col-span-2 space-y-4">
                              <div className="bg-brand-500/5 border border-brand-500/10 p-4 rounded-lg space-y-1">
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Targets Scraped</p>
                                <p className="text-3xl font-extrabold text-white">
                                  {task.result.items_count || task.result.companies_found || 0}
                                </p>
                              </div>
                              <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Execution Time:</span>
                                  <span className="text-slate-300 font-mono font-bold">{task.result.execution_time || "N/A"}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Agent Strategy:</span>
                                  <span className="text-slate-300 font-medium">Browser Scraping</span>
                                </div>
                              </div>
                            </div>

                            {/* Leads Preview right */}
                            <div className="md:col-span-3 space-y-3">
                              <div className="rounded-lg border border-slate-900 overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-slate-900/40 border-b border-slate-900 text-slate-400 font-bold font-mono">
                                      <th className="p-3">Target Name</th>
                                      <th className="p-3">Domain/URL</th>
                                      <th className="p-3">Verified Contact Email</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-900/50 text-slate-300 bg-slate-900/10">
                                    {task.result.results_preview && task.result.results_preview.map((lead: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-slate-900/20">
                                        <td className="p-3 font-semibold text-white">{lead.name}</td>
                                        <td className="p-3 text-slate-400 font-mono">{lead.domain || lead.role}</td>
                                        <td className="p-3 text-brand-400 font-mono">{lead.email}</td>
                                      </tr>
                                    ))}
                                    {(!task.result.results_preview || task.result.results_preview.length === 0) && (
                                      <tr>
                                        <td colSpan={3} className="p-8 text-center text-slate-500 italic">
                                          Results extracted successfully. Click &quot;Download Lead File&quot; to extract all datasets.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pending state */}
                    {task.status === "pending" && (
                      <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-lg text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                        <Clock className="h-6 w-6 text-slate-500" />
                        <p className="text-sm font-semibold text-slate-300">Queued for Deployment</p>
                        <p className="text-xs text-slate-500 max-w-md">
                          Your job is positioned in our execution pipeline. The browser daemon is launching and should begin shortly.
                        </p>
                      </div>
                    )}

                    {/* Running state */}
                    {task.status === "running" && (
                      <div className="bg-brand-500/5 border border-brand-500/10 p-6 rounded-lg text-center text-slate-400 flex flex-col items-center justify-center space-y-3 animate-pulse">
                        <Loader2 className="h-8 w-8 text-brand-400 animate-spin" />
                        <p className="text-sm font-semibold text-white">Browser Daemon actively processing</p>
                        <p className="text-xs text-brand-400/80 max-w-md font-mono">
                          Axel AI is scrolling pages, bypassing antibots, and scraping parameters. Please wait...
                        </p>
                      </div>
                    )}

                    {/* Failed state */}
                    {task.status === "failed" && (
                      <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-lg text-center text-rose-400 flex flex-col items-center justify-center space-y-2">
                        <XCircle className="h-7 w-7 text-rose-500" />
                        <p className="text-sm font-semibold text-rose-300">Execution Failed</p>
                        <p className="text-xs text-slate-500 max-w-md">
                          The target website returned a connection block or was completely inaccessible. Review your URL/keyword parameters and try again.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
