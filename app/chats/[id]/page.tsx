'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getChatSession, ChatSessionData } from '@/app/actions/chat';
import { ArrowLeft, Bot, Clock } from 'lucide-react';

export default function ChatViewPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<ChatSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      if (typeof params.id !== 'string') return;
      
      setIsLoading(true);
      const data = await getChatSession(params.id);
      
      if (!data) {
        router.push('/chats');
        return;
      }
      
      setSession(data);
      setIsLoading(false);
    };

    fetchSession();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/chats"
              className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all border border-slate-700/50 hover:border-blue-500/50"
            >
              <ArrowLeft className="w-5 h-5 text-slate-200" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{session.title}</h1>
              <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3" />
                {new Date(session.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <div className="space-y-8">
            {session.messages.map((message, index) => (
              <div key={index} className="space-y-4">
                {/* User Question */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white px-5 py-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-lg">
                    <p className="text-sm font-medium">{message.question}</p>
                    <p className="text-xs text-blue-100 mt-2 opacity-80">
                      {new Date(message.timestamp).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* AI Answer */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-500/30">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-800/50 p-5 rounded-2xl rounded-tl-none border border-slate-700/50">
                      <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">
                        {message.answer}
                      </p>
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 ml-4">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Sources
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {message.sources.map((source, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-white truncate">
                                  {source.documentName}
                                </span>
                                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                                  {(source.similarity * 100).toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 line-clamp-2">
                                {source.chunkText}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {index < session.messages.length - 1 && (
                  <div className="border-t border-slate-800/50 my-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
