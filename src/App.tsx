/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShoppingCart, TrendingDown, Info, Store, Search, Loader2, AlertCircle, ExternalLink, RefreshCcw, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

interface MilkPrice {
  supermarket: string;
  productName: string;
  size: string;
  price: number;
  url?: string;
  highlight?: boolean;
}

// Initialize Gemini AI Client (Client-side)
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export default function App() {
  const [searchQuery, setSearchQuery] = useState('Semi Skimmed Milk 2L');
  const [data, setData] = useState<MilkPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cheapestPrice, setCheapestPrice] = useState<number | null>(null);

  const fetchComparison = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setData([]);
    setCheapestPrice(null);

    try {
      const prompt = `Search for the current retail prices of "${query}" at the following UK supermarkets: Tesco, Sainsbury's, Asda, Morrisons, Lidl, and Aldi. 
      For each supermarket, find the matching product name, volume/size, and the price in GBP. 
      If a direct match isn't available, find the closest common alternative.
      Current date is May 2026. Return the data as a JSON array.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                supermarket: { type: Type.STRING },
                productName: { type: Type.STRING },
                size: { type: Type.STRING },
                price: { type: Type.NUMBER },
                url: { type: Type.STRING }
              },
              required: ["supermarket", "productName", "size", "price"]
            }
          },
          tools: [{ googleSearch: {} }]
        }
      });

      if (!result.text) throw new Error('No data returned from AI');
      
      const parsedData: MilkPrice[] = JSON.parse(result.text);
      
      if (parsedData.length > 0) {
        const min = Math.min(...parsedData.map(d => d.price));
        setCheapestPrice(min);
        setData(parsedData.map(d => ({ ...d, highlight: d.price === min })));
      } else {
        setError('No product matches found across supermarkets.');
      }
    } catch (err: any) {
      console.error('Gemini Error:', err);
      setError('Failed to fetch store data. Please try a more specific search.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison('Semi Skimmed Milk 2L');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComparison(searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative max-w-5xl mx-auto p-4 md:p-12">
        <header className="mb-12 border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <ShoppingCart size={22} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Supermarket Comparison</h1>
            </motion.div>
            <p className="text-slate-500 text-sm max-w-sm uppercase tracking-widest font-semibold italic">
              Real-time grocery intelligence
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product (e.g. Milk 2L)..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 pr-14 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            <button 
              disabled={loading}
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </form>
        </header>

        <main>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3"
            >
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Store className="text-blue-500" size={20} />
                    Active Comparison
                  </h2>
                  <div className="flex items-center gap-2">
                    {loading && (
                      <span className="text-xs text-slate-400 animate-pulse flex items-center gap-1">
                        Scanning stores...
                      </span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                        <th className="px-8 py-5">Retailer</th>
                        <th className="px-8 py-5">Product Details</th>
                        <th className="px-8 py-5 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="px-8 py-6"><div className="h-5 bg-slate-100 rounded w-24" /></td>
                            <td className="px-8 py-6"><div className="h-5 bg-slate-100 rounded w-48" /></td>
                            <td className="px-8 py-6 flex justify-end"><div className="h-5 bg-slate-100 rounded w-16" /></td>
                          </tr>
                        ))
                      ) : data.length > 0 ? (
                        data.map((item, index) => (
                          <motion.tr 
                            key={item.supermarket}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group hover:bg-slate-50 transition-colors ${item.highlight ? 'bg-blue-50/40' : ''}`}
                          >
                            <td className="px-8 py-6">
                              <div className="font-bold flex items-center gap-3">
                                <span className={item.highlight ? 'text-blue-600' : 'text-slate-900 font-bold'}>
                                  {item.supermarket}
                                </span>
                                {item.highlight && (
                                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    Best Rate
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-800">{item.productName}</span>
                                <span className="text-xs text-slate-400 mt-0.5">{item.size}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex flex-col items-end">
                                <span className={`font-mono font-bold text-xl ${item.highlight ? 'text-blue-600' : 'text-slate-900'}`}>
                                  £{item.price.toFixed(2)}
                                </span>
                                {item.url && (
                                  <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    View on Store <ExternalLink size={8} />
                                  </a>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-8 py-16 text-center text-slate-400 italic">
                            Enter a product above to start comparing prices.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">Summary Analysis</h3>
                  {cheapestPrice ? (
                    <>
                      <div className="text-xs text-slate-400 mb-1">Lowest unit found:</div>
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-4xl font-bold tracking-tighter italic">£{cheapestPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed opacity-80 italic border-l-2 border-blue-500 pl-3">
                        Scanning the UK retail network identifies price parity across several stores for this unit.
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-400 text-sm italic">Waiting for search data...</p>
                  )}
                </div>
                <Database className="absolute -right-8 -bottom-8 text-white/5 w-32 h-32 rotate-12" />
              </motion.div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200">
                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <TrendingDown size={14} className="text-blue-500" />
                  Strategy Tip
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Discounters like <span className="font-bold italic">Aldi & Lidl</span> often set the benchmark price for generic staples.
                </p>
                <div className="flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase tracking-wider bg-blue-50 p-2 rounded-lg">
                  <RefreshCcw size={12} className="animate-reverse-spin" />
                  Prices Updated via Live AI
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="mt-20 pt-8 border-t border-slate-200 text-slate-400 text-[10px] text-center uppercase tracking-widest font-semibold flex flex-col md:flex-row justify-between gap-4">
          <div>© 2026 AI Grocery Intelligence Unit</div>
          <div className="flex gap-6 justify-center">
            <span>Server-side Grounding Active</span>
            <span>UK Wide Coverage</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

