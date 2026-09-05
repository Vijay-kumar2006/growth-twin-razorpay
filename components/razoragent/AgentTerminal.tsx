'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Clock,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Lock,
  Layers,
  DollarSign,
  Zap,
  Check,
  X,
  FileText,
  CreditCard,
  RefreshCw,
  HeartHandshake,
  Info
} from 'lucide-react';
import { GrowthTwinTransactionState, isCheckoutEligible } from '@/lib/razoragent/transaction-state';
import { SimulationResult } from '@/lib/razoragent/types';

interface AgentTerminalProps {
  state: GrowthTwinTransactionState;
  simulationResult: SimulationResult | null;
  onRunSimulation: (prompt: string) => Promise<void>;
  onOpenCheckoutModal: () => void;
  onSelectTradeoff: (optionId: string) => void;
  onTriggerPaymentFailure: () => void;
  onSelectRecoveryOption: (optionId: string) => void;
  onApproveQuote: () => void;
  onResetScenario: () => void;
  liveStoreName?: string | null;
}

const PRESET_SCENARIOS = [
  {
    id: 'preset_corporate_hamper',
    badge: '🌟 Primary Demo',
    title: '25x Jain Festive Hampers + Add-ons',
    prompt: 'Order 25 Jain-friendly gourmet hampers with custom wax notes and Friday priority delivery under budget ₹18,000',
    desc: 'Demonstrates intent parsing, quote generation, explainable add-on scoring & policy approval.',
    color: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  {
    id: 'preset_tradeoff_conflict',
    badge: '⚖️ Safe Negotiation',
    title: 'Constraint Conflict & Trade-off Simulator',
    prompt: 'Simulate 25 Jain hampers with all luxury add-ons exceeding ₹18k budget to trigger Trade-off Simulator',
    desc: 'Preserves hard dietary constraint 100%, relaxes soft preferences into 3 safe alternatives.',
    color: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  {
    id: 'preset_approval_gate',
    badge: '🛡️ Merchant Gate',
    title: 'High-Value Quote Gating (> ₹20,000)',
    prompt: 'Order 50 Executive Luxury Hampers worth ₹1,25,000 with custom branding for annual corporate event',
    desc: 'Exceeds auto-approval limit → Blocks payment creation until explicit merchant approval.',
    color: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    id: 'preset_payment_recovery',
    badge: '⚡ Adaptive Recovery',
    title: 'Payment Failure & Revenue Recovery',
    prompt: 'Simulate payment gateway timeout on checkout to test Adaptive Revenue Recovery pathways',
    desc: 'Generates 3 deterministic recovery pathways, preserving hard constraints and preventing duplicates.',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    id: 'preset_budget_guardrail',
    badge: '🚫 Budget Guardrail',
    title: 'Over-Cap Spend Interception',
    prompt: 'Buy Sony WH-1000XM5 active noise cancelling headphones for ₹18,990',
    desc: 'Exceeds autonomous spend limit → Deterministically intercepted before payment.',
    color: 'border-rose-200 bg-rose-50 text-rose-700',
  },
];

export default function AgentTerminal({
  state,
  simulationResult,
  onRunSimulation,
  onOpenCheckoutModal,
  onSelectTradeoff,
  onTriggerPaymentFailure,
  onSelectRecoveryOption,
  onApproveQuote,
  onResetScenario,
  liveStoreName,
}: AgentTerminalProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [openDrawer, setOpenDrawer] = useState<'none' | 'why_recommended' | 'tradeoff' | 'recovery' | 'raw_mcp'>('none');
  const [selectedTradeoffId, setSelectedTradeoffId] = useState<string>('alt_budget_strict');
  const [selectedRecoveryId, setSelectedRecoveryId] = useState<string>('rec_retry_exact');

  const checkoutCheck = isCheckoutEligible(state);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || state.isLoading) return;
    onRunSimulation(inputPrompt.trim());
  };

  const handleSelectPreset = (promptText: string, presetId?: string) => {
    setInputPrompt(promptText);
    if (presetId === 'preset_tradeoff_conflict') {
      setOpenDrawer('tradeoff');
    } else if (presetId === 'preset_payment_recovery') {
      setOpenDrawer('recovery');
    }
    onRunSimulation(promptText);
  };

  const isQuoteActive = Boolean(state.quoteId && state.quoteVersion > 0);

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-0 font-sans">

      {/* 1. Header Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border-b border-slate-200 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                AI BUYER STUDIO
              </span>
              <span className="text-xs font-mono text-slate-500">
                Mode: <strong className="text-amber-700 font-semibold">Demo/Test Simulation</strong>
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Growth Twin for Razorpay
            </h1>
            <p className="text-xs text-slate-600 font-normal mt-0.5">
              Merchant-controlled AI commerce agent that creates explainable revenue opportunities and prevents unsafe payments.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-xs flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-indigo-600" />
              <span className="truncate max-w-[150px]">{state.idempotencyKey || 'SHA-256 Idempotency Lock'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Preset Intent Scenario Selector */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Demo Scenario:</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">1-Click Simulation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleSelectPreset(scenario.prompt, scenario.id)}
              disabled={state.isLoading}
              className="text-left p-3 rounded-xl bg-white hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-sm transition group flex flex-col justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${scenario.color}`}>
                    {scenario.badge}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 leading-tight">
                  {scenario.title}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{scenario.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Transaction Flow & Active Quote */}
      <div className="p-5 space-y-4">

        {/* Error Toast */}
        {state.errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{state.errorMessage}</span>
            </div>
          </div>
        )}

        {/* Active Quote Breakdown Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs">
                ₹
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Current Quote Breakdown & Status
                </h3>
                <p className="text-[10px] font-mono text-slate-500">
                  {isQuoteActive ? (
                    <>Quote: <strong className="text-slate-800">{state.quoteId}</strong> (v{state.quoteVersion}) · Expiry: <span className="text-amber-700 font-semibold">Valid 15 Mins</span></>
                  ) : (
                    <>No active quote · Select a preset scenario or enter an intent prompt below</>
                  )}
                </p>
              </div>
            </div>

            {/* Reactive Status Badge */}
            <div className="flex items-center space-x-2">
              {state.paymentStatus === 'PAID_SETTLED' ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PAID & SETTLED
                </span>
              ) : state.paymentStatus === 'SIMULATED_FAILED' ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> PAYMENT FAILED
                </span>
              ) : state.approvalStatus === 'POLICY_BLOCKED' ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> POLICY BLOCKED
                </span>
              ) : state.approvalStatus === 'AWAITING_APPROVAL' ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> AWAITING APPROVAL
                </span>
              ) : state.approvalStatus === 'EXPLICIT_APPROVED' ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> EXPLICIT APPROVED
                </span>
              ) : isQuoteActive ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> AUTO-APPROVED
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-slate-100 text-slate-600 border border-slate-200">
                  READY
                </span>
              )}
            </div>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans font-medium">Base Order Value:</span>
              <span className="text-sm font-bold text-slate-900">₹{state.baseValue.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Core Merchandise</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans font-medium">Add-on Value:</span>
              <span className="text-sm font-bold text-indigo-600">+₹{state.addonValue.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-emerald-600 font-medium block mt-0.5">Attached Add-ons</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans font-medium">Taxes & Courier:</span>
              <span className="text-sm font-bold text-slate-800">+₹{(state.tax + state.shipping).toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">18% GST (₹{state.tax})</span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200">
              <span className="text-[10px] text-indigo-900 block font-sans font-semibold">Final Settlement Total:</span>
              <span className="text-base font-extrabold text-indigo-950">₹{state.finalTotal.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-indigo-700 block mt-0.5">{state.currency}</span>
            </div>
          </div>

          {/* Constraints and Policy Indicator */}
          {isQuoteActive && (
            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono text-slate-500">Guaranteed Compliance:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" /> Jain Dietary Protected (100%)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Check className="w-3 h-3 text-indigo-600" /> Soft Preferences Formatted
                </span>
              </div>

              <span className="text-[10px] font-mono text-slate-500">
                Threshold: Max Auto-Approval ₹20,000
              </span>
            </div>
          )}
        </div>

        {/* Merchant Approval Gate Banner (When Awaiting Approval) */}
        {state.approvalStatus === 'AWAITING_APPROVAL' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Approval Gate: High-Value Threshold Exceeded
                </h4>
                <p className="text-[11px] text-amber-800/90 mt-0.5">
                  Total value (₹{state.finalTotal.toLocaleString('en-IN')}) exceeds auto-approval ceiling of ₹20,000. Payment creation is blocked until explicit merchant approval.
                </p>
              </div>
            </div>

            <button
              onClick={onApproveQuote}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs font-sans transition shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Check className="w-4 h-4" /> Grant Merchant Approval
            </button>
          </div>
        )}

        {/* Primary Action Button Area */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-600">
            <span className={`w-2 h-2 rounded-full ${
              state.paymentStatus === 'PAID_SETTLED' ? 'bg-emerald-500' :
              state.paymentStatus === 'SIMULATED_FAILED' ? 'bg-rose-500' :
              state.approvalStatus === 'AWAITING_APPROVAL' ? 'bg-amber-500' : 'bg-indigo-600'
            } animate-pulse`}></span>
            <span>Gateway: <strong className="text-slate-800">Demo/Test Simulation</strong></span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            {/* Simulate Payment Failure Button (For Testing Recovery) */}
            {isQuoteActive && state.paymentStatus === 'UNPAID' && (
              <button
                onClick={() => {
                  onTriggerPaymentFailure();
                  setOpenDrawer('recovery');
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-xs"
                title="Simulate bank gateway timeout and test recovery"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulate Failure</span>
              </button>
            )}

            {/* Launch Checkout Primary Action */}
            {state.paymentStatus === 'PAID_SETTLED' ? (
              <button
                onClick={onResetScenario}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Order Settled · Start New Scenario</span>
              </button>
            ) : (
              <button
                onClick={onOpenCheckoutModal}
                disabled={!checkoutCheck.eligible}
                title={checkoutCheck.reason || 'Launch Razorpay Checkout'}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Launch Razorpay Checkout (₹{state.finalTotal.toLocaleString('en-IN')})</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Progressive Disclosure Drawers / Tabs */}
        <div className="space-y-2.5 pt-1">

          {/* Drawer 1: Why Was This Recommended? */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenDrawer(openDrawer === 'why_recommended' ? 'none' : 'why_recommended')}
              className="w-full px-4 py-3 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Why was this recommended? (Explainable Add-on Scoring)</span>
              </div>
              {openDrawer === 'why_recommended' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
            </button>

            {openDrawer === 'why_recommended' && (
              <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1 shadow-xs">
                  <div className="text-indigo-700 font-bold font-sans">100-Point Scoring Formula:</div>
                  <div>Score = Budget Headroom (0-40) + Buyer Relevance (0-30) + Merchant Priority (0-20) + Inventory Confidence (0-10)</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Personalized Foil Gift Note</span>
                      <span className="text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">Score 100</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Matches requested preference: note · 100% dietary compatible</p>
                    <span className="text-[10px] font-mono text-indigo-700 font-semibold block">+₹1,250 Add-on Value (25x ₹50)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Jain Dry Fruit Mithai Box</span>
                      <span className="text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">Score 98</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Matches requested dietary preference: jain · Certified pure</p>
                    <span className="text-[10px] font-mono text-indigo-700 font-semibold block">+₹2,500 Add-on Value (25x ₹100)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer 2: Constraint Trade-off Simulator */}
          <div className="border border-violet-200 rounded-xl bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenDrawer(openDrawer === 'tradeoff' ? 'none' : 'tradeoff')}
              className="w-full px-4 py-3 text-left text-xs font-bold text-violet-900 hover:bg-violet-50/50 flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-2">
                <HeartHandshake className="w-3.5 h-3.5 text-violet-600" />
                <span>Constraint Trade-off Simulator (Safe Negotiation Mode)</span>
                {state.tradeoffAlternatives.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-violet-100 text-violet-800 border border-violet-200">
                    {state.tradeoffAlternatives.length} Alternatives
                  </span>
                )}
              </div>
              {openDrawer === 'tradeoff' ? <ChevronDown className="w-4 h-4 text-violet-600" /> : <ChevronRight className="w-4 h-4 text-violet-600" />}
            </button>

            {openDrawer === 'tradeoff' && (
              <div className="p-4 border-t border-violet-200 bg-violet-50/40 space-y-3">
                <p className="text-[11px] text-violet-900">
                  Hard constraints (Jain dietary) are 100% preserved. Soft delivery/packaging preferences are safely negotiated to fit budget limits.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
                  {state.tradeoffAlternatives.map((alt) => (
                    <div
                      key={alt.optionId}
                      onClick={() => setSelectedTradeoffId(alt.optionId)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        selectedTradeoffId === alt.optionId
                          ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-50 text-violet-800 border border-violet-200">
                          {alt.optionId}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 font-mono">₹{alt.finalTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{alt.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{alt.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onSelectTradeoff(selectedTradeoffId);
                      setOpenDrawer('none');
                    }}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply & Materialize ({selectedTradeoffId})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer 3: Adaptive Payment Recovery Engine */}
          <div className="border border-emerald-200 rounded-xl bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenDrawer(openDrawer === 'recovery' ? 'none' : 'recovery')}
              className="w-full px-4 py-3 text-left text-xs font-bold text-emerald-900 hover:bg-emerald-50/50 flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Adaptive Payment Recovery (3 Deterministic Routes)</span>
                {state.paymentStatus === 'SIMULATED_FAILED' && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    Action Required
                  </span>
                )}
              </div>
              {openDrawer === 'recovery' ? <ChevronDown className="w-4 h-4 text-emerald-600" /> : <ChevronRight className="w-4 h-4 text-emerald-600" />}
            </button>

            {openDrawer === 'recovery' && (
              <div className="p-4 border-t border-emerald-200 bg-emerald-50/40 space-y-3">
                <p className="text-[11px] text-emerald-900">
                  When bank networks fail, the recovery agent preserves quote integrity, offering a policy-compliant recovery option and preventing duplicate charges via SHA-256 idempotency locks.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
                  {state.recoveryOptions.map((opt) => (
                    <div
                      key={opt.optionId}
                      onClick={() => setSelectedRecoveryId(opt.optionId)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        selectedRecoveryId === opt.optionId
                          ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {opt.optionId}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 font-mono">₹{opt.finalTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{opt.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{opt.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onSelectRecoveryOption(selectedRecoveryId);
                      setOpenDrawer('none');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Recovery Route ({selectedRecoveryId})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer 4: Raw MCP JSON-RPC Protocol Trace */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenDrawer(openDrawer === 'raw_mcp' ? 'none' : 'raw_mcp')}
              className="w-full px-4 py-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>View Raw MCP Trace & Contract</span>
              </div>
              {openDrawer === 'raw_mcp' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
            </button>

            {openDrawer === 'raw_mcp' && (
              <div className="p-3.5 border-t border-slate-200 bg-slate-50 font-mono text-[11px] space-y-2 max-h-64 overflow-y-auto">
                {simulationResult?.steps?.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-xs">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span className="text-indigo-600 font-bold">#{s.stepIndex} [{s.phase}]</span>
                      <span>{new Date(s.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-800 font-sans">{s.thought}</p>
                    {s.toolCall && (
                      <pre className="p-1.5 bg-slate-900 text-slate-100 rounded text-[10px] overflow-x-auto">
                        {JSON.stringify(s.toolCall, null, 2)}
                      </pre>
                    )}
                  </div>
                )) || <p className="text-slate-500 text-center py-2">No raw MCP trace available for current quote.</p>}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 5. Custom Intent Prompt Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Instruct Growth Twin AI Buyer (e.g. 'Order 25 Jain-friendly gourmet hampers under ₹18,000')..."
            className="w-full pl-3.5 pr-28 py-2.5 bg-white border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-sans focus:outline-none transition shadow-xs disabled:opacity-50"
            disabled={state.isLoading}
          />
          <button
            type="submit"
            disabled={state.isLoading || !inputPrompt.trim()}
            className="absolute right-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold font-sans flex items-center space-x-1.5 transition shadow-xs"
          >
            {state.isLoading ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <span>Execute</span>
                <Send className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
}
