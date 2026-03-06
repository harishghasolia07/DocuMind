'use client';

import Link from 'next/link';
import {
  ShieldCheck, Upload, Brain, Lock, Database, CloudUpload,
  MessageSquare, ArrowRight, Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-grid-bg text-white selection:bg-blue-500/30">
      {/* Background Glows */}
      <div className="pointer-events-none absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-blue-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute top-[20%] right-[-20%] w-[50%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[130px]" />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-glass border-b border-white/5 shadow-sm shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              DocuMind
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-bold text-white bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-400 backdrop-blur-md px-5 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(56,128,245,0.15)] hover:shadow-[0_0_20px_rgba(56,128,245,0.3)]"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative px-6 pt-24 pb-28 text-center">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">v1.0 Now Live</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tighter mb-8 bg-clip-text text-transparent bg-linear-to-b from-white via-white to-slate-400">
            Your Documents, Now with a Mind of Their Own
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
            Transform static files into dynamic knowledge bases. Ask questions, extract insights, and summarize complex PDFs in seconds using enterprise-grade AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <div className="relative w-full sm:w-auto group">
              <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-cyan-400 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
              <Link
                href="/sign-in"
                className="relative w-full px-8 py-4 bg-linear-to-r from-blue-500 to-blue-600 rounded-xl font-bold text-white shadow-lg hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/50 backdrop-blur-xl rounded-xl font-bold text-white hover:bg-slate-800/80 transition-all border border-white/10 hover:-translate-y-0.5"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ── Trusted By ── */}
      {/* <section className="px-6 pb-24 text-center border-b border-white/5 relative z-10">
        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-8">Trusted by teams at</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <img alt="Google" className="h-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD74nBJ9Cvu3eaKRxKEp40HtSqfCoGwJNxRKDaYiS94tNBP0oV2MRHU7qQjDqHkDbs1-pGxYmGsO7jA_Pug9-CkfX6k5d3zKqCMx9PlOvghAbM7Qg6v5-AkkWa9Mp7bT5rYTUveJyU_dKwx5GgcKfGr6nDq221XabJ-QsO6EG3TYm66vgL_-n93maVY5y3VBKRJWdNNSw-LP3mhwu8C7EuGnq-1xiB9IGBHB7REyrdNKDjaduFov5QE49EYy41SEBDX9VusGBIKj4A" />
          <img alt="Slack" className="h-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIpV0Kk2_b3pPJCagzn_b4zbS34pACI5DSoZjjVaK1k4ljfHKDJrm8qQL3bhHzkAEkNysTpASuR351ow0cejmqgAwfonf2Nfnn7qWXkbGl9psE0xmk-1D15liMOmsWsOdpdzeTom4JGJH5rCBoaH-rhOwQRq7Dm24diYWpMVL_I2p71Ub6wnN0U0JRvsF4xhGWHgKFQN6EBpnSwv2b5Eh_-JT7LLJCOfkqwCYBePrYmU0sY2Qrz2ho3plF2LEdVFSQj9K1kY7_QJQ" />
          <img alt="Notion" className="h-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq-RgjO2hR1yie8PN05EIr2IMymBpS228zUycwYf9iA84Xq7CNLTkMCUe2qr7PWcuJkQ-i_wgh_VuOLTmF6jujn1oAaV9eOtBc5fzmeyoODRmBfZy8QJBILvjMWKCP65Lkk-cbdYn3fiEtvm99VN829lhSD-lpYtAAQk6TLIRvFKRUk5zYa018vhahAlIZdrCGuNKGlpYT9GQ9hm0sNUY0zBa_LO6YYS0jj1HdrIdwtQ6suUCkVc0bnGhRRnpMzWrJ3uKGuj_FVMY" />
          <img alt="Figma" className="h-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPydS8kYyLFpPzGAio5wxDgzJ8Oxem3M-EIFJbgjstr6-zxlgZyTOVeCrME8APoTBraa8yEarXdBPfPEbJVJtkV6yaip-bqdy2mgHEljDSjczNvsZnH3Q6PT-pHrcGPdaFKq1f2OVrsogaMsyjGX-9mOKGQsuV2C57p_ccdYyKjsCd68s_PsWcqoRIaCALGVSyLT4OBIMaC-FnW7O3hq-5oAK7eR3dOJEfjpPHdZheBhUFkbch-R_1K0z0dUtWavF6gqBOPRLXyBQ" />
        </div>
      </section> */}

      {/* ── Features ── */}
      <section id="features" className="px-6 py-28 relative z-10 max-w-6xl mx-auto">
        <h4 className="text-blue-500 text-xs font-bold tracking-[0.2em] uppercase text-center mb-16">Powerful Capabilities</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl flex flex-col gap-5 group hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-[0_0_20px_rgba(56,128,245,0.2)] group-hover:shadow-[0_0_30px_rgba(56,128,245,0.5)]">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Upload Any Format</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Seamless support for PDF, DOCX, TXT, and even handwritten scans with advanced OCR technology.</p>
            </div>
          </div>

          {/* Card 2 – Most Popular */}
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-cyan-400/30 p-8 rounded-2xl flex flex-col gap-5 group hover:-translate-y-1 transition-all duration-300 shadow-[0_0_30px_rgba(56,128,245,0.15)]">
            <div className="w-14 h-14 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20 group-hover:bg-cyan-400 group-hover:text-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Instant AI Analysis</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Our neural engine processes thousands of pages in seconds to find exactly what you need.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl flex flex-col gap-5 group hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-indigo-400/10 flex items-center justify-center text-indigo-400 border border-indigo-400/20 group-hover:bg-indigo-400 group-hover:text-white transition-all shadow-[0_0_20px_rgba(129,140,248,0.2)] group-hover:shadow-[0_0_30px_rgba(129,140,248,0.5)]">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Secure Vault</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Enterprise-grade AES-256 encryption. Your documents are private and never used for public training.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="px-6 py-28 relative z-10 overflow-hidden max-w-6xl mx-auto w-full">
        <h4 className="text-blue-500 text-xs font-bold tracking-[0.2em] uppercase text-center mb-20">Simple Workflow</h4>
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-16 md:gap-4 px-8">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-16 right-16 h-0.5 bg-linear-to-r from-transparent via-blue-500/30 to-transparent -z-10" />

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-5 text-center z-10">
            <div className="w-20 h-20 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-blue-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(56,128,245,0.3)]">
              <CloudUpload className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h5 className="font-bold text-xl">Upload</h5>
              <p className="text-slate-400 text-sm mt-2">Drag & drop your files</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-5 text-center z-10">
            <div className="w-20 h-20 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-cyan-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.3)]">
              <Database className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h5 className="font-bold text-xl">Process</h5>
              <p className="text-slate-400 text-sm mt-2">AI indexes knowledge</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-5 text-center z-10">
            <div className="w-20 h-20 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-blue-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(56,128,245,0.3)]">
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h5 className="font-bold text-xl">Chat</h5>
              <p className="text-slate-400 text-sm mt-2">Get answers instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-16 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold tracking-tight">DocuMind</span>
            </div>
            <p className="text-slate-500 text-sm">The intelligent layer for your files.</p>
          </div>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Privacy</Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Terms</Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Security</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between mt-16 pt-8 border-t border-white/5">
          <div className="text-slate-500 text-[10px] uppercase tracking-widest font-medium mb-4 md:mb-0">
            © 2026 DocuMind AI Technologies Inc.
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">System Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}