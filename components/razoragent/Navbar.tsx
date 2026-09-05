'use client';

import React from 'react';
import { ShieldCheck, Bot, Package, Sliders, TrendingUp, Code2, RotateCcw, FlaskConical } from 'lucide-react';

export type DashboardTab = 'buyer-studio' | 'catalog' | 'guardrails' | 'analytics' | 'eval-lab';

interface NavbarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onToggleDevMode: () => void;
  isDevModeOpen: boolean;
  onOpenConnectStore?: () => void;
  liveStoreName?: string | null;
  onResetScenario?: () => void;
}

export default function Navbar({
  activeTab,
  onTabChange,
  onToggleDevMode,
  isDevModeOpen,
  onOpenConnectStore,
  liveStoreName,
  onResetScenario,
}: NavbarProps) {
  const isLive = Boolean(liveStoreName && !liveStoreName.includes('Demo'));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo & Product Identity */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => onTabChange('buyer-studio')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">
                  Growth Twin <span className="text-indigo-600 font-black">Razorpay</span>
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI AGENT
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide hidden sm:block">
                Merchant-Controlled Autonomous Commerce & Guardrails
              </p>
            </div>
          </div>

          {/* Clean Merchant-Facing Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
            <button
              onClick={() => onTabChange('buyer-studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'buyer-studio'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Buyer Studio</span>
            </button>

            <button
              onClick={() => onTabChange('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Corporate Gifting Catalog</span>
            </button>

            <button
              onClick={() => onTabChange('guardrails')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'guardrails'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Guardrails & Policy</span>
            </button>

            <button
              onClick={() => onTabChange('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => onTabChange('eval-lab')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'eval-lab'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
              <span>Evaluation Lab</span>
            </button>
          </nav>
        </div>

        {/* Right Status Indicator, Reset Action & Dev Mode Toggle */}
        <div className="flex items-center space-x-2">
          {/* New Scenario / Reset Button */}
          {onResetScenario && (
            <button
              onClick={onResetScenario}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs transition"
              title="Reset current quote, payment, and audit state"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span className="hidden sm:inline">Reset / New Scenario</span>
            </button>
          )}

          {/* Demo Mode / Live Store Status Badge */}
          <button
            onClick={onOpenConnectStore}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isLive
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300/80 text-amber-800 hover:bg-amber-100'
            }`}
            title="Click to toggle store connection mode"
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="font-bold font-mono">{isLive ? 'Live Store' : 'Demo/Test Simulation'}</span>
          </button>

          {/* Developer Mode Collapsed Button */}
          <button
            onClick={onToggleDevMode}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              isDevModeOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
            }`}
            title="Toggle Developer & Inspector Mode (Benchmarks, Docs, GitHub)"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden lg:inline">Developer Mode</span>
          </button>
        </div>

      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden px-4 py-2 border-t border-slate-200 bg-slate-50 overflow-x-auto space-x-1.5 scrollbar-none">
        <button
          onClick={() => onTabChange('buyer-studio')}
          className={`px-3 py-1 text-xs rounded-lg font-medium shrink-0 ${
            activeTab === 'buyer-studio' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600'
          }`}
        >
          AI Studio
        </button>
        <button
          onClick={() => onTabChange('catalog')}
          className={`px-3 py-1 text-xs rounded-lg font-medium shrink-0 ${
            activeTab === 'catalog' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600'
          }`}
        >
          Catalog
        </button>
        <button
          onClick={() => onTabChange('guardrails')}
          className={`px-3 py-1 text-xs rounded-lg font-medium shrink-0 ${
            activeTab === 'guardrails' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600'
          }`}
        >
          Guardrails
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-3 py-1 text-xs rounded-lg font-medium shrink-0 ${
            activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onTabChange('eval-lab')}
          className={`px-3 py-1 text-xs rounded-lg font-medium shrink-0 ${
            activeTab === 'eval-lab' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600'
          }`}
        >
          Eval Lab
        </button>
      </div>

    </header>
  );
}
