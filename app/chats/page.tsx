'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getChatSessions, deleteChatSession, ChatSessionData } from '@/app/actions/chat';
import { useToast } from '@/components/Toast';
import { MessageSquare, Trash2, Clock, ArrowLeft, ChevronRight } from 'lucide-react';

export default function ChatsPage() {
  const [sessions, setSessions] = useState<ChatSessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchSessions = async () => {
    setIsLoading(true);
    const data = await getChatSessions();
    setSessions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete chat "${title}"?`)) return;

    setDeletingId(id);
    const result = await deleteChatSession(id);

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Chat Deleted',
        message: `"${title}" has been removed`
      });
      await fetchSessions();
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: result.error || 'Failed to delete chat'
      });
    }

    setDeletingId(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all border border-slate-700/50 hover:border-blue-500/50"
              >
                <ArrowLeft className="w-5 h-5 text-slate-200" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Previous Chats</h1>
                <p className="text-sm text-slate-400 mt-1">
                  View and manage your saved conversations
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-12 rounded-xl text-center">
            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No saved chats yet</h3>
            <p className="text-slate-400 mb-6">Start a conversation and save it to see it here</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg transition-all font-medium shadow-lg shadow-blue-500/30"
            >
              Start Chatting
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="group bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 p-6 rounded-xl transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white truncate">
                        {session.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400 ml-11">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {session.messages.length > 0 && (
                      <p className="text-sm text-slate-300 mt-3 ml-11 line-clamp-2">
                        Q: {session.messages[0].question}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/chats/${session.id}`}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                      title="View chat"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(session.id, session.title)}
                      disabled={deletingId === session.id}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                      title="Delete chat"
                    >
                      {deletingId === session.id ? (
                        <span className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
