'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { getChatSessions, deleteChatSession, ChatSessionData } from '@/app/actions/chat';
import { MessageSquare, Plus, Trash2, Upload, ChevronRight } from 'lucide-react';

interface ChatSidebarProps {
  onNewChat?: () => void;
  onChatSelect?: (chatId: string) => void;
  currentChatId?: string | null;
}

export default function ChatSidebar({ onNewChat, onChatSelect, currentChatId }: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    const data = await getChatSessions();
    setSessions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSessions();
    
    // Listen for chat save events
    const handleChatSaved = () => {
      fetchSessions();
    };
    
    window.addEventListener('chatSaved', handleChatSaved);
    
    return () => {
      window.removeEventListener('chatSaved', handleChatSaved);
    };
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!confirm('Delete this chat?')) return;

    setDeletingId(id);
    const result = await deleteChatSession(id);

    if (result.success) {
      await fetchSessions();
    }

    setDeletingId(null);
  };

  return (
    <div className="w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg transition-all font-medium shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No saved chats yet
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onChatSelect?.(session.id)}
              className={`group w-full flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                currentChatId === session.id
                  ? 'bg-slate-800 border border-blue-500/50'
                  : 'bg-slate-800/30 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate font-medium">
                  {session.title}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(session.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, session.id)}
                disabled={deletingId === session.id}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
              >
                {deletingId === session.id ? (
                  <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-700/50 space-y-2">
        <Link
          href="/documents"
          className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all text-sm"
        >
          <Upload className="w-4 h-4" />
          <span>Manage Documents</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Link>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2 text-slate-300">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
          <span className="text-sm">My Account</span>
        </div>
      </div>
    </div>
  );
}
