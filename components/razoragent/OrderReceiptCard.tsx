'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle, ArrowUpRight, Copy, Check, ShieldCheck, Lock } from 'lucide-react';
import { GrowthTwinTransactionState, isCheckoutEligible } from '@/lib/razoragent/transaction-state';

interface OrderReceiptCardProps {
  state: GrowthTwinTransactionState;
  onOpenCheckoutModal: () => void;
}

export default function OrderReceiptCard({
  state,
  onOpenCheckoutModal,
}: OrderReceiptCardProps) {
  const [copied, setCopied] = useState(false);

  const hasActiveOrder = Boolean(state.quoteId && state.quoteVersion > 0);

  if (!hasActiveOrder) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center space-y-3 min-h-[240px]">
        <div className="p-3 rounded-full bg-slate-50 border border-slate-200 text-slate-400">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <p className="text-slate-800 font-bold text-xs">No Active Razorpay Order</p>
          <p className="text-slate-500 text-[11px] mt-1 max-w-xs">
            Execute a buyer flow from the studio to generate a verified, policy-guarded Razorpay order.
          </p>
        </div>
      </div>
    );
  }

  const handleCopyOrderId = () => {
    if (state.orderId) {
      navigator.clipboard.writeText(state.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPaid = state.paymentStatus === 'PAID_SETTLED';
  const isFailed = state.paymentStatus === 'SIMULATED_FAILED';
  const checkoutCheck = isCheckoutEligible(state);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 font-sans">

      {/* Header with Honest Demo Notice */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-600/30 font-black text-white text-xs">
            R
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-wide">Razorpay Settlement Gateway</h4>
            <p className="text-[10px] text-amber-700 font-mono font-medium">Mode: Demo/Test Simulation</p>
          </div>
        </div>

        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase border ${
          isPaid
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : isFailed
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : state.approvalStatus === 'AWAITING_APPROVAL'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
        }`}>
          {isPaid ? 'PAID & SETTLED' : isFailed ? 'PAYMENT FAILED' : state.approvalStatus === 'AWAITING_APPROVAL' ? 'AWAITING APPROVAL' : 'AWAITING PAYMENT'}
        </span>
      </div>

      {/* Payable Amount & Subunit */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-slate-500 font-medium">Total Settlement:</span>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              ₹{state.finalTotal.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">
              Subunit: {state.orderAmountPaise || state.finalTotal * 100} paise (18% GST ₹{state.tax})
            </span>
          </div>
        </div>

        {/* Itemized list */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
          {state.cartItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-slate-700 text-[11px] gap-2">
              <span className="truncate flex-1 text-slate-800 font-sans" title={item.name}>
                {item.quantity}x {item.name}
              </span>
              <span className="font-semibold text-slate-900 shrink-0">₹{item.subtotal.toLocaleString('en-IN')}</span>
            </div>
          ))}
          {state.discount > 0 && (
            <div className="flex justify-between text-emerald-700 text-[11px] pt-1.5 border-t border-slate-200">
              <span className="font-sans">Coupon Discount</span>
              <span>-₹{state.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        {/* Order Details Metadata */}
        <div className="space-y-1.5 text-[11px] font-mono text-slate-600">
          <div className="flex justify-between items-center">
            <span>Razorpay Order ID:</span>
            <button
              onClick={handleCopyOrderId}
              className="flex items-center space-x-1 text-indigo-600 hover:underline font-bold"
            >
              <span>{state.orderId || `order_${state.quoteId}`}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex justify-between">
            <span>Receipt Token:</span>
            <span className="text-slate-800">{state.orderReceipt || `rcpt_${state.quoteId}`}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Idempotency Key:</span>
            <span className="text-emerald-700 truncate max-w-[180px]">{state.idempotencyKey || 'idem_lock_v1'}</span>
          </div>
        </div>
      </div>

      {/* Action: Launch Razorpay Modal */}
      {!isPaid && (
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={onOpenCheckoutModal}
            disabled={!checkoutCheck.eligible}
            title={checkoutCheck.reason || 'Launch Razorpay Checkout'}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Launch Razorpay Checkout</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HMAC SHA-256 Verification Stamp (When Paid) */}
      {isPaid && state.verificationResult && (
        <div className="p-3.5 rounded-xl text-xs font-mono border bg-emerald-50 border-emerald-200 text-emerald-900 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold font-sans">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Demo/Test Simulation — simulated signature verification</span>
          </div>
          <p className="text-[11px] text-slate-600 font-sans">
            Payment {state.paymentAttemptId} settled via mock gateway simulation.
          </p>
          {state.verificationResult.signature && (
            <p className="text-[10px] text-slate-500 truncate pt-0.5">
              HMAC Signature: {state.verificationResult.signature}
            </p>
          )}
        </div>
      )}

    </div>
  );
}
