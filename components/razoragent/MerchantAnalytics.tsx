'use client';

import React from 'react';
import { TrendingUp, Activity, CheckCircle2, Info, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { GrowthTwinTransactionState } from '@/lib/razoragent/transaction-state';

interface MerchantAnalyticsProps {
  state?: GrowthTwinTransactionState;
}

export default function MerchantAnalytics({ state }: MerchantAnalyticsProps) {
  const hasActiveQuote = Boolean(state && state.quoteId && state.quoteVersion > 0);
  const currentAddonValue = state?.addonValue || 0;
  const currentBaseValue = state?.baseValue || 0;
  const currentTotal = state?.finalTotal || 0;
  const isPaid = state?.paymentStatus === 'PAID_SETTLED';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 font-sans">

      {/* Header with Clear Demo Sandbox Labeling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                Demo Session Analytics & Benchmark Aggregation
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulated measurements of explainable add-on recommendations, payment recovery paths, and safety guardrails.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
          Demo/Test Simulation
        </span>
      </div>

      {/* Mandatory Explanatory Note */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-900 font-semibold">Note on Telemetry:</strong> All metrics displayed below are deterministic demo session values generated within this sandbox. Production telemetry streams directly from verified Razorpay Webhook settlements.
        </p>
      </div>

      {/* Section 1: Active Transaction Telemetry */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Active Transaction Telemetry</span>
          </span>
          {hasActiveQuote && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Quote: {state?.quoteId} (v{state?.quoteVersion})
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Metric 1: Current Add-on Value */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Attached Add-on Value</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              +₹{currentAddonValue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500">
              {hasActiveQuote
                ? `Attached to active quote (Base: ₹${currentBaseValue.toLocaleString('en-IN')}).`
                : 'No active quote selected in studio.'}
            </p>
          </div>

          {/* Metric 2: Duplicate Orders Prevented */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Duplicate Orders Prevented</span>
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-indigo-600 font-mono">100% Suppressed</div>
            <p className="text-[11px] text-slate-500">
              Zero duplicate charges via SHA-256 idempotency locks ({state?.idempotencyKey || 'active'}).
            </p>
          </div>

          {/* Metric 3: Constraint Satisfaction Rate */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Dietary Compliance</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono">100.0%</div>
            <p className="text-[11px] text-slate-500">
              Jain dietary, allergen, and non-negotiable buyer constraints preserved.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Multi-Session Benchmark Aggregation */}
      <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Deterministic Sandbox Aggregate — Multi-Session Telemetry
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-sm">
            Multi-Session Benchmark Data
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 block">Cumulative Base Merchandise:</span>
            <span className="text-base font-bold text-slate-900">₹4,85,000</span>
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 block">Simulated Add-on Value:</span>
            <span className="text-base font-bold text-emerald-700">+₹1,42,800</span>
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 block">Simulated Recovered Value:</span>
            <span className="text-base font-bold text-violet-700">₹89,500</span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 text-[11px]">Aggregate Sandbox Breakdown</span>
            <span className="text-indigo-600 font-bold">Total Simulated Sandbox Value: ₹7,17,300</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
            <div className="h-full bg-slate-400" style={{ width: '67.6%' }} title="Base Merchandise (67.6%)"></div>
            <div className="h-full bg-indigo-500" style={{ width: '19.9%' }} title="Simulated Add-on Value (19.9%)"></div>
            <div className="h-full bg-emerald-500" style={{ width: '12.5%' }} title="Simulated Recovered Value (12.5%)"></div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> Base (₹4,85,000)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Add-on Value (₹1,42,800)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Recovered (₹89,500)
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
