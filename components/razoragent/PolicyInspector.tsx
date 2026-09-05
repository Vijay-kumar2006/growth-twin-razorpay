'use client';

import React, { useState } from 'react';
import { Sliders, Shield, Tag, DollarSign, Check, Info, Plus, X, Percent, Clock, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import { GuardrailPolicyConfig } from '@/lib/razoragent/types';

interface PolicyInspectorProps {
  onConfigChange?: (config: GuardrailPolicyConfig) => void;
}

export default function PolicyInspector({ onConfigChange }: PolicyInspectorProps) {
  // Merchant Policy State
  const [maxUnapprovedValue, setMaxUnapprovedValue] = useState<number>(20000);
  const [maxDiscountPercentage, setMaxDiscountPercentage] = useState<number>(15);
  const [quoteExpiryMinutes, setQuoteExpiryMinutes] = useState<number>(60);
  const [requireExplicitApprovalForLink, setRequireExplicitApprovalForLink] = useState<boolean>(false);

  const [permittedAddons, setPermittedAddons] = useState<string[]>([
    'custom_note',
    'priority_shipping',
    'premium_packaging',
    'addon_note_01',
    'addon_shipping_02',
    'addon_sweets_03',
    'addon_packaging_04',
  ]);

  const [protectedHardConstraints, setProtectedHardConstraints] = useState<string[]>([
    'jain',
    'vegan',
    'halal',
    'kosher',
    'gluten_free',
    'allergen_free',
  ]);

  const [newAddonInput, setNewAddonInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const triggerUpdate = (
    unapprovedVal: number,
    discountPct: number,
    expiryMins: number,
    reqApproval: boolean,
    addons: string[]
  ) => {
    setIsSaved(true);
    if (onConfigChange) {
      onConfigChange({
        maxSpendLimitINR: unapprovedVal,
        maxQuantityPerItem: 50,
        allowedCategories: ['gifting', 'specialty-coffee', 'home-office', 'wellness'],
        requireHumanApprovalAboveINR: unapprovedVal,
        idempotencyWindowSeconds: expiryMins * 60,
      });
    }
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleUnapprovedChange = (val: number) => {
    setMaxUnapprovedValue(val);
    triggerUpdate(val, maxDiscountPercentage, quoteExpiryMinutes, requireExplicitApprovalForLink, permittedAddons);
  };

  const handleDiscountChange = (val: number) => {
    setMaxDiscountPercentage(val);
    triggerUpdate(maxUnapprovedValue, val, quoteExpiryMinutes, requireExplicitApprovalForLink, permittedAddons);
  };

  const handleExpiryChange = (val: number) => {
    setQuoteExpiryMinutes(val);
    triggerUpdate(maxUnapprovedValue, maxDiscountPercentage, val, requireExplicitApprovalForLink, permittedAddons);
  };

  const toggleRequireApproval = () => {
    const nextVal = !requireExplicitApprovalForLink;
    setRequireExplicitApprovalForLink(nextVal);
    triggerUpdate(maxUnapprovedValue, maxDiscountPercentage, quoteExpiryMinutes, nextVal, permittedAddons);
  };

  const removeAddon = (addon: string) => {
    const next = permittedAddons.filter((a) => a !== addon);
    setPermittedAddons(next);
    triggerUpdate(maxUnapprovedValue, maxDiscountPercentage, quoteExpiryMinutes, requireExplicitApprovalForLink, next);
  };

  const handleAddPermittedAddon = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAddonInput.trim().toLowerCase();
    if (!trimmed || permittedAddons.includes(trimmed)) return;
    const next = [...permittedAddons, trimmed];
    setPermittedAddons(next);
    setNewAddonInput('');
    triggerUpdate(maxUnapprovedValue, maxDiscountPercentage, quoteExpiryMinutes, requireExplicitApprovalForLink, next);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">

      {/* Header with Philosophy Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Merchant Guardrail & Growth Policy Engine
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic bounds: <strong className="text-slate-800 font-semibold">The model recommends; server code authorizes.</strong>
            </p>
          </div>
        </div>

        {isSaved ? (
          <span className="text-xs font-mono text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 animate-fade-in font-semibold">
            <Check className="w-3.5 h-3.5" /> Policy Enforced Live
          </span>
        ) : (
          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            Active Contract: v1.0
          </span>
        )}
      </div>

      {/* Grid of Merchant Policy Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* 1. Max Unapproved Order Value */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Max Unapproved Order Value
              </label>
            </div>
            <div className="flex items-center space-x-1 font-mono font-bold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
              <span>₹</span>
              <input
                type="number"
                value={maxUnapprovedValue}
                onChange={(e) => handleUnapprovedChange(Number(e.target.value))}
                className="w-20 bg-transparent text-right text-slate-900 focus:outline-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Orders above this threshold require explicit human approval before Razorpay payment creation.
          </p>
          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={maxUnapprovedValue}
            onChange={(e) => handleUnapprovedChange(Number(e.target.value))}
            className="w-full accent-indigo-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>₹1,000 (Strict)</span>
            <span className="text-indigo-600 font-bold">₹20,000 (Default)</span>
            <span>₹50,000 (Enterprise)</span>
          </div>
        </div>

        {/* 2. Maximum Permitted Discount */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Maximum Permitted Discount
              </label>
            </div>
            <div className="flex items-center space-x-1 font-mono font-bold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
              <input
                type="number"
                min="0"
                max="50"
                value={maxDiscountPercentage}
                onChange={(e) => handleDiscountChange(Number(e.target.value))}
                className="w-10 bg-transparent text-right text-slate-900 focus:outline-none"
              />
              <span>%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Autonomous agent can never apply coupon discounts exceeding this percentage cap.
          </p>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={maxDiscountPercentage}
            onChange={(e) => handleDiscountChange(Number(e.target.value))}
            className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0% (No discounts)</span>
            <span className="text-emerald-600 font-bold">15% (Standard)</span>
            <span>50% (Max clearance)</span>
          </div>
        </div>

        {/* 3. Quote Expiry Window */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Quote Expiry Window
              </label>
            </div>
            <span className="font-mono font-bold text-sm text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {quoteExpiryMinutes} Minutes
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Time limit for signed quote validity before pricing and inventory must be re-verified.
          </p>
          <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
            {[15, 30, 60, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => handleExpiryChange(mins)}
                className={`py-1.5 rounded-lg border text-center transition ${
                  quoteExpiryMinutes === mins
                    ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* 4. Strict Human Approval Requirement Toggle */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Require Approval on All Payment Links
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              When enabled, forces human sign-off on 100% of generated orders regardless of amount.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-xs font-mono text-slate-600">
              Status: <strong className={requireExplicitApprovalForLink ? 'text-indigo-700' : 'text-slate-500'}>{requireExplicitApprovalForLink ? 'ENABLED (100% Sign-off)' : 'DISABLED (Threshold Only)'}</strong>
            </span>
            <button
              onClick={toggleRequireApproval}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition shadow-sm ${
                requireExplicitApprovalForLink
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {requireExplicitApprovalForLink ? 'ACTIVE' : 'TOGGLE'}
            </button>
          </div>
        </div>

      </div>

      {/* 5. Protected Hard Constraints (Dietary / Regulatory) */}
      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Protected Hard Constraints (Never Relaxed by AI Negotiation)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            100% Protected Invariant
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          These buyer requirements are treated as hard non-negotiables. The Constraint Trade-off Simulator and Recovery Agent will NEVER violate or relax these tags.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {protectedHardConstraints.map((constraint) => (
            <span
              key={constraint}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3 h-3 text-emerald-600" />
              <span>{constraint}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 6. Permitted Add-ons Configuration */}
      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Permitted Add-ons Whitelist ({permittedAddons.length} Approved)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Autonomous Upsell Pool</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Only items or tags matching this whitelist can be recommended and added to buyer quotes.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {permittedAddons.map((addon) => (
            <button
              key={addon}
              onClick={() => removeAddon(addon)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white text-indigo-700 border border-slate-200 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50 transition flex items-center gap-1 group shadow-sm"
              title="Click to remove add-on"
            >
              <span>{addon}</span>
              <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
            </button>
          ))}
        </div>

        {/* Add custom add-on */}
        <form onSubmit={handleAddPermittedAddon} className="flex gap-2 pt-1">
          <input
            type="text"
            value={newAddonInput}
            onChange={(e) => setNewAddonInput(e.target.value)}
            placeholder="Add permitted add-on tag or SKU (e.g. gift_box, satin_ribbon)..."
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-mono placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none shadow-sm"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-sans flex items-center gap-1 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Whitelist Add-on</span>
          </button>
        </form>
      </div>

    </div>
  );
}
