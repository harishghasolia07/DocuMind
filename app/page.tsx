'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import QuestionForm from '@/components/QuestionForm';
import ChatSidebar from '@/components/ChatSidebar';
import Link from 'next/link';
import { Settings, ShieldCheck, Heart, Upload, FileText, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

function HomePage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check if we should start a new chat from URL params
  useEffect(() => {
    if (searchParams.get('newChat') === 'true') {
      setSelectedChatId(null);
      setIsNewChat(true);
      setChatKey(prev => prev + 1);
      // Clear the URL parameter
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

  const handleNewChat = () => {
    setSelectedChatId(null);
    setIsNewChat(true);
    setChatKey(prev => prev + 1);
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsNewChat(false);
    setChatKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Chat History */}
      <ChatSidebar 
        onNewChat={handleNewChat} 
        onChatSelect={handleChatSelect}
        currentChatId={selectedChatId}
      />

      {/* Right Side - Main Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl shadow-lg shadow-blue-500/30">
                <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Private Knowledge <span className="text-gradient">Q&A</span>
              </h1>
            </div>
            <Link
              href="/status"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              title="System Status"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-hidden">
          {selectedChatId || isNewChat ? (
            <QuestionForm key={chatKey} initialSessionId={selectedChatId} />
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-4xl mx-auto text-center space-y-12">
                {/* Welcome Section */}
                <div className="space-y-4">
                  <div className="inline-flex p-4 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-2xl">
                    <Sparkles className="w-12 h-12 text-cyan-400" />
                  </div>
                  <h1 className="text-4xl font-bold text-white">
                    Welcome to Private Knowledge Q&A
                  </h1>
                  <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Build your personal knowledge base and get AI-powered answers from your documents
                  </p>
                </div>



                {/* Quick Actions */}
                <div className="flex items-center justify-center gap-4">
                  <Link
                    href="/documents"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/status"
                    className="px-6 py-3 border border-slate-600 text-slate-300 hover:bg-slate-800/50 rounded-xl font-medium transition-all"
                  >
                    System Status
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        {/* <footer className="py-3 border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
          <div className="px-4 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
              Built with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> by{' '}
              <span className="font-semibold text-gradient">Harish</span>
            </p>
          </div>
        </footer> */}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen overflow-hidden">
        <div className="w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <HomePage />
    </Suspense>
  );
}