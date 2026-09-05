'use client';

import React from 'react';
import { X, CheckCircle2, XCircle, Activity, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { TestResult } from '@/lib/razoragent/types';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: TestResult[] | null;
  isLoading: boolean;
  onRerun: () => void;
}

export default function BenchmarkModal({ isOpen, onClose, results, isLoading, onRerun }: BenchmarkModalProps) {
  if (!isOpen) return null;

  const passedCount = results ? results.filter((r) => r.status === 'PASSED').length : 0;
  const totalCount = results ? results.length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-wide">Automated System Benchmarks</h3>
              <p className="text-[11px] text-slate-500">Verifying Guardrails, Idempotency Locks & Razorpay APIs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 font-mono text-xs flex-1">

          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
              <p className="font-sans text-sm font-medium text-slate-700">Running 5 Automated Test Suites...</p>
            </div>
          )}

          {!isLoading && results && (
            <>
              {/* Scorecard */}
              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-xs font-sans">Verification Score:</span>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    <span className="text-emerald-700">{passedCount}</span> / {totalCount} Test Suites Passed
                  </div>
                </div>
                <button
                  onClick={onRerun}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-sans font-semibold shadow-sm transition"
                >
                  Re-run All
                </button>
              </div>

              {/* List of Test Cases */}
              <div className="space-y-2 pt-2">
                {results.map((test) => (
                  <div
                    key={test.testId}
                    className={`p-3 rounded-xl border ${
                      test.status === 'PASSED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                        : 'bg-rose-50/60 border-rose-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {test.status === 'PASSED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-bold text-xs text-slate-900">{test.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono shadow-sm">
                          {test.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {test.durationMs}ms
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-[11px] text-slate-600 pl-6">
                      <p><strong className="text-slate-800">Expected:</strong> {test.expected}</p>
                      <p><strong className="text-slate-800">Actual:</strong> {test.actual}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold font-sans shadow-sm transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
