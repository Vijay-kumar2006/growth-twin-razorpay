'use client';

import React, { useState } from 'react';
import { Package, Tag, Star, Plus, Search, Edit2, Check, Sparkles, ArrowRight, X, Gift, Truck, FileText } from 'lucide-react';
import { MERCHANT_CATALOG, AVAILABLE_COUPONS } from '@/lib/razoragent/catalog-data';
import { ProductItem, ProductCategory } from '@/lib/razoragent/types';

interface MerchantCatalogViewProps {
  onSelectProductToTest?: (productName: string) => void;
}

export default function MerchantCatalogView({ onSelectProductToTest }: MerchantCatalogViewProps) {
  const [catalog, setCatalog] = useState<ProductItem[]>(MERCHANT_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<string>('gifting');
  const [newPrice, setNewPrice] = useState(1200);
  const [newStock, setNewStock] = useState(30);
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80');

  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'hampers') return matchesSearch && (item.tags.includes('hamper') || item.name.toLowerCase().includes('hamper'));
    if (selectedCategory === 'addons') return matchesSearch && (item.tags.includes('addon') || item.id.startsWith('addon_'));
    if (selectedCategory === 'jain') return matchesSearch && item.tags.includes('jain');
    return matchesSearch && item.category === selectedCategory;
  });

  const toggleStock = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: item.stock > 0 ? 0 : 25 } : item))
    );
  };

  const startEditPrice = (item: ProductItem) => {
    setEditingId(item.id);
    setTempPrice(item.price);
  };

  const savePrice = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: tempPrice } : item))
    );
    setEditingId(null);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProduct: ProductItem = {
      id: `hamp_custom_${Date.now()}`,
      name: newName.trim(),
      category: 'specialty-coffee',
      price: Number(newPrice),
      stock: Number(newStock),
      rating: 5.0,
      reviewCount: 1,
      image: newImage.trim() || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
      description: `Custom corporate gifting package added live to MCP inventory.`,
      specs: { 'Custom Item': 'Live Added to Catalog' },
      tags: ['hamper', 'gifting', 'corporate', 'custom'],
      eligibleCoupons: ['CORP15', 'AGENT500'],
    };

    setCatalog((prev) => [newProduct, ...prev]);
    setIsAddModalOpen(false);
    setNewName('');
  };

  return (
    <div className="space-y-6 font-sans">

      {/* Top Search, Category Filters & Actions */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hampers, notes, packaging, delivery options..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold shadow-xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            All Items ({catalog.length})
          </button>

          <button
            onClick={() => setSelectedCategory('hampers')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedCategory === 'hampers'
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold shadow-xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            🎁 Hampers
          </button>

          <button
            onClick={() => setSelectedCategory('addons')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedCategory === 'addons'
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold shadow-xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            ✨ Add-ons & Packaging
          </button>

          <button
            onClick={() => setSelectedCategory('jain')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedCategory === 'jain'
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold shadow-xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            🌱 Jain-Certified
          </button>
        </div>

        {/* Add Product Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-md shadow-indigo-600/20 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Hamper</span>
        </button>

      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCatalog.map((product) => {
          const isOutOfStock = product.stock === 0;
          const isHamper = product.tags.includes('hamper') || product.name.toLowerCase().includes('hamper');
          const isAddon = product.tags.includes('addon') || product.id.startsWith('addon_');
          const isJain = product.tags.includes('jain');

          return (
            <div
              key={product.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col ${
                isOutOfStock ? 'border-rose-200 opacity-80' : 'border-slate-200'
              }`}
            >
              <div className="h-44 w-full relative bg-slate-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition duration-300 hover:scale-105"
                />

                {/* Badges */}
                <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                  {isJain && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/95 backdrop-blur-md text-emerald-800 border border-emerald-200 shadow-xs uppercase">
                      Jain Certified
                    </span>
                  )}
                  {isAddon && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/95 backdrop-blur-md text-indigo-700 border border-indigo-200 shadow-xs uppercase">
                      Add-on SKU
                    </span>
                  )}
                  {isHamper && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/95 backdrop-blur-md text-purple-700 border border-purple-200 shadow-xs uppercase">
                      Corporate Hamper
                    </span>
                  )}
                </div>

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-white/85 flex items-center justify-center p-3 text-center backdrop-blur-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-xs font-mono font-bold border border-rose-200">
                      OUT OF STOCK (AI Agent Intercepted)
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center space-x-1 text-amber-500 text-xs font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span className="font-bold text-slate-800">{product.rating}</span>
                    <span className="text-slate-400 text-[10px]">({product.reviewCount} reviews)</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mt-1 line-clamp-2 leading-snug">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Price & Stock Controls */}
                <div className="pt-2.5 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Unit Price:</span>
                      {editingId === product.id ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="w-20 px-1.5 py-0.5 bg-white border border-indigo-600 rounded text-slate-900 text-xs font-mono"
                          />
                          <button
                            onClick={() => savePrice(product.id)}
                            className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => startEditPrice(product)}>
                          <span className="text-sm font-extrabold text-slate-900 font-mono">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <Edit2 className="w-2.5 h-2.5 text-slate-400 group-hover:text-indigo-600 transition" />
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono block">Stock Level:</span>
                      <button
                        onClick={() => toggleStock(product.id)}
                        className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                          isOutOfStock
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                        title="Click to toggle out of stock (test safety guardrails)"
                      >
                        {isOutOfStock ? '0 in stock' : `${product.stock} available`}
                      </button>
                    </div>
                  </div>

                  {onSelectProductToTest && (
                    <button
                      onClick={() => onSelectProductToTest(product.name)}
                      className="w-full py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-900 text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Simulate AI Buyer Purchase</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" /> Add Custom Corporate Hamper to Catalog
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 font-sans text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Hamper Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Diwali Royal Gourmet Gift Box"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Inventory Quantity</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Image URL</label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  Save to Catalog
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
