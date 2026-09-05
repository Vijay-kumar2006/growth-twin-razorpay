'use client';

import React from 'react';
import { Activity, BookOpen, Github, Terminal, X, ShieldAlert, CheckCircle2, ChevronRight, Layers, FileCode } from 'lucide-react';

interface DeveloperDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRunBenchmarks: () => void;
  onOpenDocs: () => void;
  benchmarksLoading: boolean;
}

export default function DeveloperDrawer({
  isOpen,
  onClose,
  onRunBenchmarks,
  onOpenDocs,
  benchmarksLoading,
}: DeveloperDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-slate-50 border-b border-slate-200 p-4 animate-fade-in text-xs font-sans shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        {/* Left: Info & Description */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              DEVELOPER INSPECTOR
            </span>
            <span className="text-slate-800 font-semibold">Model Context Protocol (MCP) Tools & Automated Tests</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Access low-level protocol tests, integration specifications, and live JSON-RPC 2.0 endpoint discovery.
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRunBenchmarks}
            disabled={benchmarksLoading}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Activity className={`w-3.5 h-3.5 text-indigo-600 ${benchmarksLoading ? 'animate-spin' : ''}`} />
            <span>{benchmarksLoading ? 'Running Test Suite...' : 'Run Automated Tests (6/6)'}</span>
          </button>

          <button
            onClick={onOpenDocs}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Architecture & API Docs</span>
          </button>

          <a
            href="https://github.com/Vijay-kumar2006/growth-twin-razorpay"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center space-x-1.5 shadow-sm transition"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition ml-1"
            title="Collapse Developer Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
