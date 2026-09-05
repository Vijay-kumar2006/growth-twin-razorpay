'use client';

import React, { useState, useEffect } from 'react';
import { Store, ShoppingBag, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, X, RefreshCw, Layers } from 'lucide-react';
import { ProductItem } from '@/lib/razoragent/types';

interface ConnectStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreConnected?: (providerName: string, isLive: boolean) => void;
}

export default function ConnectStoreModal({ isOpen, onClose, onStoreConnected }: ConnectStoreModalProps) {
  const [platform, setPlatform] = useState<'shopify' | 'woocommerce' | 'demo'>('shopify');
  const [domain, setDomain] = useState('');
  const [token, setToken] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    isLive?: boolean;
    provider?: string;
    productCount?: number;
    preview?: ProductItem[];
    message?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Check current connection status
      fetch('/api/razoragent/catalog/connect')
        .then((res) => res.json())
        .then((data) => {
          if (data.isLive) {
            setResult({
              success: true,
              isLive: true,
              provider: data.provider,
              productCount: data.productCount,
              message: `Active Live Store: ${data.provider}`,
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/razoragent/catalog/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          domain: domain.trim(),
          token: token.trim(),
          siteUrl: siteUrl.trim(),
          consumerKey: consumerKey.trim(),
          consumerSecret: consumerSecret.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setResult({ error: data.error || 'Failed to connect to store.' });
      } else {
        setResult(data);
        if (onStoreConnected) {
          onStoreConnected(data.provider, data.isLive);
        }
      }
    } catch (err: any) {
      setResult({ error: err.message || 'Network error connecting to store.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/razoragent/catalog/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'demo' }),
      });
      const data = await res.json();
      setResult(data);
      if (onStoreConnected) {
        onStoreConnected(data.provider, false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Merchant Storefront Onboarding</h3>
              <p className="text-xs text-slate-500">Try the full store-connect and settlement flow yourself — in production, install <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">razoragent</code> to run your own private gateway.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">

          {/* Step 1: Platform Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 font-mono uppercase tracking-wider">
              Step 1: Choose Your Platform
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => { setPlatform('shopify'); setResult(null); }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  platform === 'shopify'
                    ? 'bg-indigo-50/50 border-indigo-600 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#95BF47]"></span>
                  Shopify
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Storefront GraphQL API</div>
              </button>

              <button
                type="button"
                onClick={() => { setPlatform('woocommerce'); setResult(null); }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  platform === 'woocommerce'
                    ? 'bg-indigo-50/50 border-indigo-600 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7F54B3]"></span>
                  WooCommerce
                </div>
                <div className="text-[11px] text-slate-500 mt-1">REST API v3</div>
              </button>

              <button
                type="button"
                onClick={() => { setPlatform('demo'); handleUseDemo(); }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  platform === 'demo'
                    ? 'bg-indigo-50/50 border-indigo-600 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Demo Catalog
                </div>
                <div className="text-[11px] text-slate-500 mt-1">28+ Sample SKUs</div>
              </button>
            </div>
          </div>

          {/* Step 2: Credentials Form */}
          {platform === 'shopify' && (
            <form onSubmit={handleTestConnection} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="font-mono text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                Step 2: Enter Shopify Storefront Credentials
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Shopify Store Domain</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="your-store.myshopify.com"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-indigo-500 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Storefront API Access Token</label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-indigo-500 shadow-sm"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <span>Hint: In Shopify Admin → Settings → Apps → Develop apps → Storefront API.</span>
                  <a
                    href="https://help.shopify.com/en/manual/apps/app-types/custom-apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    Docs <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !domain || !token}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Test Connection & Activate Live Catalog</span>
                </button>
              </div>
            </form>
          )}

          {platform === 'woocommerce' && (
            <form onSubmit={handleTestConnection} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="font-mono text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                Step 2: Enter WooCommerce REST Credentials
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Store URL</label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://your-store.com"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-indigo-500 shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Consumer Key</label>
                  <input
                    type="password"
                    value={consumerKey}
                    onChange={(e) => setConsumerKey(e.target.value)}
                    placeholder="ck_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-indigo-500 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Consumer Secret</label>
                  <input
                    type="password"
                    value={consumerSecret}
                    onChange={(e) => setConsumerSecret(e.target.value)}
                    placeholder="cs_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-indigo-500 shadow-sm"
                    required
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500 mt-1">
                Hint: WordPress Admin → WooCommerce → Settings → Advanced → REST API.
              </p>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !siteUrl || !consumerKey || !consumerSecret}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Test Connection & Activate Live Catalog</span>
                </button>
              </div>
            </form>
          )}

          {/* Connection Test Results */}
          {result && (
            <div className={`p-4 rounded-2xl border transition ${
              result.error
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : result.isLive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs">
                {result.error ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Connection Failed</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{result.isLive ? '🟢 LIVE STORE CONNECTED' : '🟡 DEMO MODE ACTIVE'}</span>
                  </>
                )}
              </div>

              <p className="mt-1 text-[11px] text-slate-700">{result.message || result.error}</p>

              {result.preview && result.preview.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
                    Live Product Preview ({result.productCount} SKUs total):
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {result.preview.map((p) => (
                      <div key={p.id} className="p-2 rounded-xl bg-white border border-slate-200 flex items-center space-x-2 shadow-sm">
                        <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div className="truncate">
                          <p className="text-slate-900 text-[11px] font-medium truncate">{p.name}</p>
                          <p className="text-emerald-700 text-[10px] font-mono font-bold">₹{p.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scope Note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
            <span className="font-bold text-slate-700">Demo Note:</span> For this showcase, credentials are used for your live session to query your store's public Storefront API and are not stored in any permanent database.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600">
            Active Mode: {result?.isLive ? '🟢 LIVE STORE' : '🟡 DEMO DATA'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
