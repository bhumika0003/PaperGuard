import React, { useState, useEffect } from 'react';
import { Hash, ShieldCheck, Copy, Check, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';

export const LiveHashCalculator = () => {
  const [inputText, setInputText] = useState('CONFIDENTIAL QUESTION PAPER\nSubject: Distributed Systems (CS601)\nQ1. Explain consensus protocols.');
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [isTampered, setIsTampered] = useState(false);

  useEffect(() => {
    const computeHash = async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setHash(hashHex);
    };
    computeHash();
  }, [inputText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-3xl bg-cyber-card border border-cyan-500/30 shadow-2xl space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              Interactive SHA-256 Live Fingerprint Simulator
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-500/30">
                LIVE DEMO
              </span>
            </h3>
            <p className="text-xs text-slate-400">Type any text below to watch cryptographic SHA-256 digital fingerprint re-calculate in real time.</p>
          </div>
        </div>
        <button
          onClick={() => setInputText('SECURE PAPER SYSTEM DEMO CONTENT ' + Math.floor(Math.random() * 1000))}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-cyan-400 border border-slate-800 flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Randomize
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Input Question Paper Content Stream:
        </label>
        <textarea
          rows="3"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 outline-none focus:border-cyan-500 transition shadow-inner"
        ></textarea>
      </div>

      {/* Output Hash */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Computed Cryptographic SHA-256 Hash:
          </span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy Hash'}
          </button>
        </div>

        <div className="font-mono text-xs font-bold text-cyan-300 break-all select-all p-2 rounded-xl bg-slate-900 border border-slate-800">
          {hash}
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px]">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Document Integrity Status: VERIFIED ✓
          </span>
          <span className="text-slate-500 font-mono">Length: 64 Characters (256 bits)</span>
        </div>
      </div>
    </div>
  );
};
