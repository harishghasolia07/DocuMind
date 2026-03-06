import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grid-bg relative overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-blue-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[-20%] w-[50%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />

      <SignIn
        forceRedirectUrl="/home"
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: 'mx-auto z-10',
            card: 'bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(56,128,245,0.15)] rounded-2xl p-6 sm:p-8',
            headerTitle: 'text-3xl font-black text-white bg-clip-text text-transparent bg-linear-to-b from-white to-slate-300',
            headerSubtitle: 'text-slate-400',
            socialButtonsBlockButton: 'bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 text-white rounded-xl transition-all shadow-sm',
            socialButtonsBlockButtonText: 'font-semibold',
            dividerLine: 'bg-slate-800',
            dividerText: 'text-slate-500 font-medium',
            formFieldLabel: 'text-slate-300 font-semibold mb-1.5',
            formFieldInput: 'bg-slate-950/50 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl text-white placeholder-slate-600 transition-all h-11',
            formButtonPrimary: 'bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl py-3 mt-2 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
            footerActionLink: 'text-cyan-400 hover:text-cyan-300 font-semibold',
            footerActionText: 'text-slate-400',
            identityPreviewText: 'text-slate-300 font-medium',
            identityPreviewEditButtonIcon: 'text-cyan-400',
            formFieldAction: 'text-cyan-400 hover:text-cyan-300',
          },
        }}
      />
    </div>
  );
}
