'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, QrCode, CreditCard, Smartphone, ArrowRight, Lock } from 'lucide-react';
import { RazorpayOrderResponse, CartQuote } from '@/lib/razoragent/types';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: RazorpayOrderResponse | null;
  cart: CartQuote | null;
  onPaymentSuccess: (orderId: string, paymentId: string, signature: string) => Promise<void>;
}

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  order,
  cart,
  onPaymentSuccess,
}: RazorpayCheckoutModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentId, setPaymentId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsPaid(false);
      setPaymentId('');
    }
  }, [isOpen]);

  if (!isOpen || !order || !cart) return null;

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    const mockPayId = `pay_${Math.random().toString(36).substring(2, 12)}`;
    setPaymentId(mockPayId);

    // Simulate gateway 800ms authorization
    await new Promise((r) => setTimeout(r, 800));

    // Generate mock HMAC signature for test validation
    const mockSig = `sig_${Math.random().toString(36).substring(2, 14)}`;

    await onPaymentSuccess(order.id, mockPayId, mockSig);
    setIsProcessing(false);
    setIsPaid(true);
  };

  const handleClose = () => {
    setIsProcessing(false);
    setIsPaid(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">

        {/* Header */}
        <div className="bg-slate-50 p-5 text-slate-900 border-b border-slate-200 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200 transition text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0C8CE9] text-white font-black text-sm flex items-center justify-center shadow-sm">
              R
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 text-slate-900">
                Razorpay Checkout
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold">
                  DEMO/TEST SIMULATION
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">Order: {order.id} · Idempotency Protected</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-xs text-slate-500 font-medium">Amount to Pay:</span>
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
              ₹{cart.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">

          {!isPaid ? (
            <>
              {/* Payment Methods Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition flex flex-col items-center gap-1 ${
                    selectedMethod === 'upi'
                      ? 'bg-blue-50 border-[#0C8CE9] text-[#0C8CE9] font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>

                <button
                  onClick={() => setSelectedMethod('card')}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition flex flex-col items-center gap-1 ${
                    selectedMethod === 'card'
                      ? 'bg-blue-50 border-[#0C8CE9] text-[#0C8CE9] font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cards</span>
                </button>

                <button
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition flex flex-col items-center gap-1 ${
                    selectedMethod === 'netbanking'
                      ? 'bg-blue-50 border-[#0C8CE9] text-[#0C8CE9] font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>NetBanking</span>
                </button>
              </div>

              {/* Dynamic Method Content */}
              {selectedMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                    <QrCode className="w-28 h-28 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Scan & Pay via any UPI App</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">GPay · PhonePe · Paytm · CRED</p>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-slate-500 text-[10px]">Test Card Number</label>
                    <input
                      type="text"
                      disabled
                      value="4111 2222 3333 4444"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-500 text-[10px]">Expiry</label>
                      <input
                        type="text"
                        disabled
                        value="12/28"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 text-[10px]">CVV</label>
                      <input
                        type="text"
                        disabled
                        value="123"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 text-xs">
                  <p className="text-slate-800 font-medium">All Major Indian Banks Supported</p>
                  <p className="text-[11px] text-slate-500 font-mono">HDFC · ICICI · SBI · Axis · Kotak</p>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-[#0C8CE9] hover:bg-[#0972BD] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isProcessing ? 'Authorizing in Demo Sandbox...' : `Authorize Payment (₹${cart.totalAmount.toLocaleString('en-IN')})`}</span>
                {!isProcessing && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </>
          ) : (
            /* Payment Success Screen */
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">Payment Simulation Successful</h4>
                <p className="text-xs text-slate-500 mt-1">Simulated signature verification in demo mode (HMAC SHA-256)</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-left font-mono text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="text-emerald-700 font-semibold">{paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="text-indigo-600">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="text-slate-900 font-bold">₹{cart.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
              >
                Return to Dashboard
              </button>
            </div>
          )}

        </div>

        {/* Footer Security Badge */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#0C8CE9]" /> 256-Bit SSL Encrypted
          </span>
          <span>Simulation Mode</span>
        </div>

      </div>
    </div>
  );
}
