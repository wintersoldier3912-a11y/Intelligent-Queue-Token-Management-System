import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { TokenStatus } from '../../types';

export const KioskView: React.FC = () => {
  const { tokens, counters } = useSystem();

  // Get tokens that are currently being called or served
  const activeTokens = tokens
    .filter(t => (t.status === TokenStatus.CALLED || t.status === TokenStatus.SERVING) && t.counterId)
    .sort((a, b) => (b.calledAt || 0) - (a.calledAt || 0)); // Most recently called first

  // Get waiting tokens for the marquee/list
  const waitingTokens = tokens
    .filter(t => t.status === TokenStatus.WAITING)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 p-6 flex justify-between items-center border-b border-slate-700 shadow-md z-10">
        <h1 className="text-3xl font-bold tracking-wider text-brand-400 uppercase">Now Serving</h1>
        <div className="text-xl font-mono text-slate-300">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      {/* Main Display Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        
        {/* Active Calls (Left Side - Big Cards) */}
        <div className="space-y-4">
           {activeTokens.slice(0, 3).map((token, index) => {
             const counter = counters.find(c => c.id === token.counterId);
             const isNew = (Date.now() - (token.calledAt || 0)) < 10000; // Highlight if called in last 10s
             
             return (
               <div 
                 key={token.id} 
                 className={`flex items-center justify-between p-8 rounded-2xl border-l-8 shadow-2xl transition-all duration-500 ${
                   isNew ? 'bg-brand-900 border-brand-400 scale-[1.02]' : 'bg-slate-800 border-slate-600'
                 }`}
               >
                 <div className="flex flex-col">
                   <span className="text-2xl text-slate-400 uppercase mb-2">Ticket Number</span>
                   <span className="text-7xl font-black tracking-tighter text-white">{token.ticketNumber}</span>
                 </div>
                 <div className="flex flex-col items-end text-right">
                   <span className="text-xl text-slate-400 uppercase mb-2">Counter</span>
                   <span className="text-6xl font-bold text-brand-400">{counter?.name.replace('Counter ', '')}</span>
                   {isNew && <span className="mt-2 text-sm font-bold bg-red-500 text-white px-2 py-1 rounded animate-pulse">JUST CALLED</span>}
                 </div>
               </div>
             );
           })}
           {activeTokens.length === 0 && (
             <div className="h-full flex items-center justify-center text-slate-600 text-3xl font-light">
               Please wait for your number...
             </div>
           )}
        </div>

        {/* Right Side - Info / Waiting List */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col">
           <h2 className="text-2xl font-bold text-slate-400 uppercase mb-8 border-b border-slate-700 pb-4">Up Next</h2>
           <div className="flex-1 space-y-4">
             {waitingTokens.map((token, idx) => (
               <div key={token.id} className="flex items-center justify-between text-2xl p-4 bg-slate-700/50 rounded-lg">
                 <span className="text-slate-300">#{idx + 1}</span>
                 <span className="font-bold text-white tracking-wider">{token.ticketNumber}</span>
                 <span className="text-slate-400 text-lg">Waiting...</span>
               </div>
             ))}
             {waitingTokens.length === 0 && (
               <div className="text-slate-500 italic">No waiting customers</div>
             )}
           </div>
           
           <div className="mt-auto pt-8 border-t border-slate-700">
             <div className="flex items-center gap-4 text-slate-400">
                <div className="bg-slate-700 p-4 rounded-lg flex-1 text-center">
                  <div className="text-3xl font-bold text-white">{counters.filter(c => c.status === 'OPEN').length}</div>
                  <div className="text-sm uppercase">Open Counters</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg flex-1 text-center">
                  <div className="text-3xl font-bold text-white">{tokens.filter(t => t.status === 'WAITING').length}</div>
                  <div className="text-sm uppercase">Total Waiting</div>
                </div>
             </div>
           </div>
        </div>
      </main>

      {/* Marquee Footer (Optional) */}
      <footer className="bg-brand-600 py-3 overflow-hidden whitespace-nowrap">
        <div className="animate-[scroll_20s_linear_infinite] inline-block text-white font-bold text-lg px-4">
           Welcome to QFlow Bank. Please keep your ticket with you. Standard deposit wait time: ~4 mins. Digital banking is available 24/7. &nbsp;&bull;&nbsp;
           Welcome to QFlow Bank. Please keep your ticket with you. Standard deposit wait time: ~4 mins. Digital banking is available 24/7.
        </div>
      </footer>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};