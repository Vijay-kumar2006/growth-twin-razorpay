'use client';

import React, { useState } from 'react';
import Navbar, { DashboardTab } from '@/components/razoragent/Navbar';
import DeveloperDrawer from '@/components/razoragent/DeveloperDrawer';
import AgentTerminal from '@/components/razoragent/AgentTerminal';
import PolicyInspector from '@/components/razoragent/PolicyInspector';
import OrderReceiptCard from '@/components/razoragent/OrderReceiptCard';
import MerchantCatalogView from '@/components/razoragent/MerchantCatalogView';
import MerchantAnalytics from '@/components/razoragent/MerchantAnalytics';
import BenchmarkModal from '@/components/razoragent/BenchmarkModal';
import RazorpayCheckoutModal from '@/components/razoragent/RazorpayCheckoutModal';
import IntegrationDocsModal from '@/components/razoragent/IntegrationDocsModal';
import ConnectStoreModal from '@/components/razoragent/ConnectStoreModal';
import WebhookStream, { AuditEventItem } from '@/components/razoragent/WebhookStream';
import EvaluationLab from '@/components/razoragent/EvaluationLab';
import { GuardrailPolicyConfig, SimulationResult, TestResult, CartQuote } from '@/lib/razoragent/types';
import {
  GrowthTwinTransactionState,
  createInitialTransactionState,
  populateFromSimulation,
  applyTradeoffAlternative,
  triggerPaymentFailure,
  applyRecoveryOption,
  grantExplicitApproval,
  completePayment
} from '@/lib/razoragent/transaction-state';

export default function RazorAgentPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('buyer-studio');
  const [isDevModeOpen, setIsDevModeOpen] = useState(false);

  // Single Source of Truth Transaction State
  const [txState, setTxState] = useState<GrowthTwinTransactionState>(createInitialTransactionState());
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  // Razorpay Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Integration Docs Modal
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Merchant Connect Store Modal & Status
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [liveStoreName, setLiveStoreName] = useState<string | null>(null);

  // Benchmarks Modal state
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<TestResult[] | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);

  // 1. Run Simulation Loop
  const handleRunSimulation = async (prompt: string) => {
    setTxState((prev) => ({
      ...prev,
      isLoading: true,
      errorMessage: null,
      lastActionMessage: 'Parsing buyer intent and querying catalog...',
    }));

    // Add intent audit event
    const intentEvent: AuditEventItem = {
      id: `evt_int_${Math.random().toString(36).substring(2, 8)}`,
      eventType: 'INTENT_RECEIVED',
      timestamp: new Date().toISOString(),
      plainText: `Buyer agent intent parsed: "${prompt}"`,
      payload: { prompt, timestamp: new Date().toISOString() },
    };

    try {
      const res = await fetch('/api/razoragent/agent/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data: SimulationResult = await res.json();
      setSimulationResult(data);

      setTxState((prev) => {
        const nextState = populateFromSimulation(
          prev,
          prompt,
          data.finalCart,
          data.policyDecision,
          data.order
        );
        return {
          ...nextState,
          auditEvents: [intentEvent, ...nextState.auditEvents],
        };
      });
    } catch (err) {
      console.error('Agent simulation error:', err);
      setTxState((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage: 'Network error communicating with AI Buyer simulation endpoint.',
        lastActionMessage: 'Simulation request failed.',
      }));
    }
  };

  // 2. Safe Negotiation: Materialize Selected Trade-off Alternative
  const handleTradeoffSelect = (optionId: string) => {
    setTxState((prev) => applyTradeoffAlternative(prev, optionId));
  };

  // 3. Adaptive Recovery: Trigger Simulated Payment Failure
  const handleSimulatePaymentFailure = () => {
    setTxState((prev) => triggerPaymentFailure(prev));
  };

  // 4. Adaptive Recovery: Apply Selected Recovery Route
  const handleSelectRecoveryOption = (optionId: string) => {
    setTxState((prev) => applyRecoveryOption(prev, optionId));
  };

  // 5. Merchant Approval Sign-off
  const handleApproveQuote = () => {
    setTxState((prev) => grantExplicitApproval(prev));
  };

  // 6. Payment Success Settlement
  const handlePaymentSuccess = async (orderId: string, paymentId: string, signature: string) => {
    try {
      const res = await fetch('/api/razoragent/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, payment_id: paymentId, signature }),
      });

      const data = await res.json();
      setTxState((prev) => completePayment(prev, paymentId, data));
    } catch (err) {
      console.error('Payment verification error:', err);
      setTxState((prev) => ({
        ...prev,
        errorMessage: 'Simulated payment verification failed.',
      }));
    }
  };

  // 7. Reset / New Scenario
  const handleResetScenario = () => {
    setTxState(createInitialTransactionState());
    setSimulationResult(null);
    setIsCheckoutOpen(false);
  };

  // 8. Run Benchmarks
  const handleRunBenchmarks = async () => {
    setIsBenchmarkOpen(true);
    setBenchmarkLoading(true);

    try {
      const res = await fetch('/api/razoragent/test-suite', { method: 'POST' });
      const data = await res.json();
      setBenchmarkResults(data.results);
    } catch (err) {
      console.error('Benchmark execution error:', err);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  // 9. Policy Config Change
  const handlePolicyConfigChange = async (newConfig: GuardrailPolicyConfig) => {
    try {
      await fetch('/api/razoragent/guardrails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
    } catch (err) {
      console.error('Policy update error:', err);
    }
  };

  const handleSelectProductToTest = (productName: string) => {
    setActiveTab('buyer-studio');
    handleRunSimulation(`Order ${productName} with corporate discount coupon CORP15`);
  };

  // Synthesize CartQuote object from current transaction state for child modal compatibility
  const activeCartQuote: CartQuote | null = txState.quoteId ? {
    cartId: txState.quoteId,
    items: txState.cartItems,
    subtotal: txState.baseValue + txState.addonValue,
    discount: txState.discount,
    tax: txState.tax,
    shipping: txState.shipping,
    totalAmount: txState.finalTotal,
    currency: 'INR',
    expiresAt: txState.expiresAt || undefined,
  } : null;

  const activeOrder = txState.orderId ? {
    id: txState.orderId,
    entity: 'order' as const,
    amount: txState.orderAmountPaise || txState.finalTotal * 100,
    amount_paid: txState.paymentStatus === 'PAID_SETTLED' ? (txState.orderAmountPaise || txState.finalTotal * 100) : 0,
    amount_due: txState.paymentStatus === 'PAID_SETTLED' ? 0 : (txState.orderAmountPaise || txState.finalTotal * 100),
    currency: 'INR' as const,
    receipt: txState.orderReceipt || `rcpt_${txState.quoteId}`,
    status: (txState.paymentStatus === 'PAID_SETTLED' ? 'paid' : 'created') as 'created' | 'attempted' | 'paid',
    attempts: 1,
    notes: {},
    created_at: Math.floor(Date.now() / 1000),
  } : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleDevMode={() => setIsDevModeOpen(!isDevModeOpen)}
        isDevModeOpen={isDevModeOpen}
        onOpenConnectStore={() => setIsConnectOpen(true)}
        liveStoreName={liveStoreName}
        onResetScenario={handleResetScenario}
      />

      {/* Collapsible Developer Mode Drawer */}
      <DeveloperDrawer
        isOpen={isDevModeOpen}
        onClose={() => setIsDevModeOpen(false)}
        onRunBenchmarks={handleRunBenchmarks}
        onOpenDocs={() => setIsDocsOpen(true)}
        benchmarksLoading={benchmarkLoading}
      />

      {/* Main Merchant Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">

        {/* Tab 1: AI Buyer Studio (Default Landing Screen) */}
        {activeTab === 'buyer-studio' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Left Column: Interactive AI Buyer Studio (7 Cols) */}
              <div className="lg:col-span-7">
                <AgentTerminal
                  state={txState}
                  simulationResult={simulationResult}
                  onRunSimulation={handleRunSimulation}
                  onOpenCheckoutModal={() => setIsCheckoutOpen(true)}
                  onSelectTradeoff={handleTradeoffSelect}
                  onTriggerPaymentFailure={handleSimulatePaymentFailure}
                  onSelectRecoveryOption={handleSelectRecoveryOption}
                  onApproveQuote={handleApproveQuote}
                  onResetScenario={handleResetScenario}
                  liveStoreName={liveStoreName}
                />
              </div>

              {/* Right Column: Settlement Receipt Card & Plain-Language Audit Trail (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                <OrderReceiptCard
                  state={txState}
                  onOpenCheckoutModal={() => setIsCheckoutOpen(true)}
                />

                <WebhookStream events={txState.auditEvents} />
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Corporate Gifting Catalog */}
        {activeTab === 'catalog' && (
          <MerchantCatalogView onSelectProductToTest={handleSelectProductToTest} />
        )}

        {/* Tab 3: Guardrails & Policy Screen */}
        {activeTab === 'guardrails' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <PolicyInspector onConfigChange={handlePolicyConfigChange} />
            <WebhookStream events={txState.auditEvents} />
          </div>
        )}

        {/* Tab 4: Analytics Screen (Clearly Labeled Demo Telemetry) */}
        {activeTab === 'analytics' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <MerchantAnalytics state={txState} />
            <WebhookStream events={txState.auditEvents} />
          </div>
        )}

        {/* Tab 5: Evaluation Lab (Deterministic Synthetic Suite) */}
        {activeTab === 'eval-lab' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <EvaluationLab />
          </div>
        )}

      </main>

      {/* Connect Store Modal */}
      <ConnectStoreModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onStoreConnected={(name, isLive) => {
          setLiveStoreName(isLive ? name : null);
        }}
      />

      {/* Razorpay Standard Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        order={activeOrder}
        cart={activeCartQuote}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Merchant Integration Guide Modal */}
      <IntegrationDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Benchmark / Test Suite Modal */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        results={benchmarkResults}
        isLoading={benchmarkLoading}
        onRerun={handleRunBenchmarks}
      />

      {/* Merchant-Facing Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-slate-500 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-slate-900 font-bold">Growth Twin for Razorpay</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">Autonomous MCP Commerce & Settlement Gateway</span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-500">
            <button onClick={() => setIsDocsOpen(true)} className="hover:text-indigo-600 transition">
              Docs
            </button>
            <button onClick={handleRunBenchmarks} className="hover:text-indigo-600 transition">
              Run Tests
            </button>
            <a
              href="https://github.com/Vijay-kumar2006/growth-twin-razorpay"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              GitHub →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
