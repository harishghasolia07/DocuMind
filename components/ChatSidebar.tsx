'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { getChatSessions, deleteChatSession, ChatSessionData } from '@/app/actions/chat';
import { MessageSquare, Plus, Trash2, Upload, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface ChatSidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onClose: () => void;
  onNewChat?: () => void;
  onChatSelect?: (chatId: string) => void;
  currentChatId?: string | null;
}

export default function ChatSidebar({
  isOpen,
  isMobile,
  onToggle,
  onClose,
  onNewChat,
  onChatSelect,
  currentChatId,
}: ChatSidebarProps) {
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
    const handleChatSaved = () => fetchSessions();
    window.addEventListener('chatSaved', handleChatSaved);
    return () => window.removeEventListener('chatSaved', handleChatSaved);
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Delete this chat?')) return;
    setDeletingId(id);
    const result = await deleteChatSession(id);
    if (result.success) await fetchSessions();
    setDeletingId(null);
  };

  const handleChatClick = (id: string) => {
    onChatSelect?.(id);
    if (isMobile) onClose();
  };

  // ── Sidebar position logic ──────────────────────────────────────────────
  // Mobile  → fixed overlay; slides in/out via translate
  // Desktop → part of flex row; collapses to icon strip (w-16)
  const sidebarBase =
    'flex flex-col h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 ease-in-out overflow-hidden z-40';

  const sidebarClasses = isMobile
    ? `fixed top-0 left-0 ${sidebarBase} w-72 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`
    : `${sidebarBase} ${isOpen ? 'w-72' : 'w-16'}`;

  // Shared sidebar inner content
  const sidebarContent = (
    <div className={sidebarClasses}>
      {/* Header */}
      <div className={`border-b border-slate-700/50 ${isOpen ? 'px-3 py-3' : 'p-2.5 flex flex-col items-center gap-2'}`}>

        {isOpen ? (
          /* Expanded: New Chat button + toggle icon on same row */
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onNewChat?.(); if (isMobile) onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-blue-500 to-cyan-400
                hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg transition-all font-medium shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5 shrink-0" />
              <span>New Chat</span>
            </button>

            {/* ChatGPT-style panel toggle — desktop only */}
            {!isMobile && (
              <button
                onClick={onToggle}
                title="Collapse sidebar"
                className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all shrink-0"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          /* Collapsed: toggle icon on top, + icon below */
          <>
            {!isMobile && (
              <button
                onClick={onToggle}
                title="Expand sidebar"
                className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => { onNewChat?.(); if (isMobile) onClose(); }}
              title="New Chat"
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400
                hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Chat history */}
      {(isOpen || isMobile) ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No saved chats yet</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleChatClick(session.id)}
                className={`group w-full flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                  currentChatId === session.id
                    ? 'bg-slate-800 border border-blue-500/50'
                    : 'bg-slate-800/30 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate font-medium">{session.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(session.createdAt).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  disabled={deletingId === session.id}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                >
                  {deletingId === session.id
                    ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        // Collapsed desktop — icon-only list
        <div className="flex-1 flex flex-col items-center pt-4 gap-2">
          {sessions.slice(0, 6).map((session) => (
            <button
              key={session.id}
              onClick={() => onChatSelect?.(session.id)}
              title={session.title}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                currentChatId === session.id
                  ? 'bg-slate-800 border border-blue-500/50 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className={`border-t border-slate-700/50 ${isOpen ? 'p-3 space-y-2' : 'p-2.5 flex flex-col items-center gap-2'}`}>
        <Link
          href="/documents"
          onClick={() => { if (isMobile) onClose(); }}
          title={!isOpen ? 'Manage Documents' : undefined}
          className={`flex items-center gap-3 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all text-sm
            ${isOpen ? 'px-3 py-2' : 'w-10 h-10 justify-center'}`}
        >
          <Upload className="w-4 h-4 shrink-0" />
          {isOpen && <>
            <span>Manage Documents</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </>}
        </Link>

        <div className={`flex items-center gap-3 text-slate-300 ${isOpen ? 'px-3 py-2' : 'justify-center'}`}>
          <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          {isOpen && <span className="text-sm">My Account</span>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: tap-away backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {isMobile ? (
        // Mobile — sidebar is a fixed overlay, no wrapper needed
        sidebarContent
      ) : (
        // Desktop — toggle button is now inside the sidebar header, no wrapper hack needed
        <div className="shrink-0">
          {sidebarContent}
        </div>
      )}
    </>
  );
}
