'use client';

import React, { useState } from 'react';
import { Activity, ShieldCheck, CheckCircle2, ChevronDown, ChevronRight, Radio, Clock, ShieldAlert, ArrowRight, RotateCcw, HeartHandshake, Layers } from 'lucide-react';
import { AuditEventItem } from '@/lib/razoragent/types';
export type { AuditEventItem };

interface WebhookStreamProps {
  events: AuditEventItem[];
}

export default function WebhookStream({ events }: WebhookStreamProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'order.created':
      case 'QUOTE_CREATED':
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">QUOTE CREATED</span>;
      case 'payment.captured':
      case 'PAYMENT_SUCCESS':
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">PAYMENT SETTLED</span>;
      case 'policy.evaluated':
      case 'POLICY_CHECK':
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-purple-50 text-purple-700 border border-purple-200">POLICY ENFORCED</span>;
      case 'CONSTRAINT_CONFLICT_DETECTED':
      case 'TRADEOFF_ALTERNATIVE_SELECTED':
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-violet-50 text-violet-800 border border-violet-200">TRADE-OFF ALTERNATIVE</span>;
      case 'PAYMENT_FAILURE_DETECTED':
      case 'RECOVERY_OPTIONS_GENERATED':
      case 'RECOVERY_OPTION_SELECTED':
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">ADAPTIVE RECOVERY</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 text-slate-700 border border-slate-200">AUDIT EVENT</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Plain-Language Audit Trail</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {events.length} Events
          </span>
        </div>

        <span className="text-[10px] font-mono text-slate-500">
          Append-Only Audit Ledger
        </span>
      </div>

      {/* Events Stream List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 font-sans text-xs scrollbar-thin">
        {events.map((evt) => {
          const isExpanded = expandedId === evt.id;

          return (
            <div
              key={evt.id}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getEventBadge(evt.eventType)}
                  <span className="font-mono text-[10px] text-slate-500">{evt.id}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400" suppressHydrationWarning>
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Plain language summary */}
              <p className="text-slate-700 mt-1.5 text-[11px] leading-relaxed">
                {evt.plainText}
              </p>

              {/* Expandable JSON details */}
              <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-mono">
                <button
                  onClick={() => toggleExpand(evt.id)}
                  className="flex items-center space-x-1 text-indigo-600 hover:underline font-semibold"
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  <span>{isExpanded ? 'Hide Payload' : 'View Event JSON'}</span>
                </button>

                {evt.verified && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> HMAC Verified
                  </span>
                )}
              </div>

              {isExpanded && (
                <pre className="mt-2 p-2.5 rounded-lg bg-slate-900 text-slate-100 text-[10px] font-mono overflow-x-auto">
                  {JSON.stringify(evt.payload, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
