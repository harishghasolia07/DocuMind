'use client';

import { useState, useRef, useEffect } from 'react';
import { askQuestion, QueryResult } from '@/app/actions/query';
import { saveChatSession, ChatMessage } from '@/app/actions/chat';
import { uploadDocument } from '@/app/actions/upload';
import AnswerDisplay from './AnswerDisplay';
import { useToast } from './Toast';
import { Send, Sparkles, Trash2, Save, Plus } from 'lucide-react';

interface ChatHistoryItem {
  question: string;
  result: QueryResult;
  timestamp: Date;
}

interface QuestionFormProps {
  initialSessionId?: string | null;
}

export default function QuestionForm({ initialSessionId }: QuestionFormProps) {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Load chat session if initialSessionId is provided
  useEffect(() => {
    async function loadChat() {
      if (initialSessionId) {
        setIsLoading(true);
        try {
          const { getChatSession } = await import('@/app/actions/chat');
          const session = await getChatSession(initialSessionId);
          
          if (session) {
            setCurrentSessionId(session.id);
            // Convert saved messages back to ChatHistoryItem format
            const history: ChatHistoryItem[] = session.messages.map((msg: ChatMessage) => ({
              question: msg.question,
              result: {
                success: true,
                answer: msg.answer,
                sources: msg.sources
              },
              timestamp: new Date(msg.timestamp)
            }));
            setChatHistory(history);
          }
        } catch (error) {
          console.error('Failed to load chat:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadChat();
  }, [initialSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isAsking]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!question.trim()) {
      return;
    }

    const currentQuestion = question.trim();
    setIsAsking(true);
    setQuestion(''); // Clear input immediately

    // Prepare conversation history for context (last 3 exchanges)
    const conversationContext = chatHistory.slice(-3).map(item => ({
      question: item.question,
      answer: item.result.answer || ''
    }));

    const response = await askQuestion(currentQuestion, conversationContext);
    
    // Add to chat history
    const newHistory = [...chatHistory, {
      question: currentQuestion,
      result: response,
      timestamp: new Date()
    }];
    setChatHistory(newHistory);
    
    setIsAsking(false);

    // Auto-save after each question
    await autoSaveChat(newHistory);
  };

  const autoSaveChat = async (history: ChatHistoryItem[]) => {
    if (history.length === 0) return;

    setSaveStatus('saving');
    
    try {
      // Generate title from first question
      const title = history[0].question.substring(0, 50) + (history[0].question.length > 50 ? '...' : '');
      
      // Convert chat history to ChatMessage format
      const messages: ChatMessage[] = history.map(item => ({
        question: item.question,
        answer: item.result.success ? item.result.answer || '' : '',
        sources: item.result.success && item.result.sources ? item.result.sources : [],
        timestamp: item.timestamp.toISOString(),
      }));

      console.log('Saving chat session...', { title, messageCount: messages.length, sessionId: currentSessionId });
      
      const result = await saveChatSession(title, messages, currentSessionId || undefined);
      
      console.log('Save result:', result);
      
      if (result.success) {
        setCurrentSessionId(result.sessionId!);
        setSaveStatus('saved');
        // Notify sidebar to refresh
        window.dispatchEvent(new Event('chatSaved'));
        // Clear status after 2 seconds
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus('error');
        console.error('Auto-save failed:', result.error);
        // Clear error status after 3 seconds
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      console.error('Exception during auto-save:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const saveChat = async () => {
    if (chatHistory.length === 0) return;
    await autoSaveChat(chatHistory);
  };

  const clearHistory = () => {
    if (confirm('Clear all chat history?')) {
      setChatHistory([]);
      setCurrentSessionId(null);
      setSaveStatus(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Only submit if not empty and not asking
      if (question.trim() && !isAsking) {
        // Trigger submit programmatically or just call handleSubmit logic if extracted
        // Since handleSubmit expects a FormEvent, proper way is to request submit on the form
        e.currentTarget.closest('form')?.requestSubmit();
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      addToast({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please upload only .txt files'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File Too Large',
        message: 'File size must be less than 10MB'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadDocument(formData);

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Upload Successful',
          message: `"${result.documentName}" uploaded successfully! Created ${result.chunksCreated} chunks.`
        });
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        addToast({
          type: 'error',
          title: 'Upload Failed',
          message: result.error || 'Please try again'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'Please try again'
      });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6">
      {/* Chat History Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-6 space-y-6 custom-scrollbar pr-2">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chatHistory.length === 0 && !isAsking && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-60">
            <Sparkles className="w-12 h-12" />
            <p className="text-sm font-medium">Ask a question to get started</p>
          </div>
        )}

        {/* Display all previous Q&A */}
        {chatHistory.map((item, index) => (
          <div key={index} className="space-y-3">
            {/* User Question */}
            <div className="flex justify-end">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-lg">
                <p className="text-sm font-medium">{item.question}</p>
              </div>
            </div>
            
            {/* AI Answer */}
            <AnswerDisplay result={item.result} />
          </div>
        ))}

        {/* Loading State */}
        {isAsking && (
          <div className="space-y-3">
            {/* Current question (if chat history exists) */}
            <div className="animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4" />
                  <div className="h-4 bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area with Action Buttons */}
      <div className="space-y-2">
        {chatHistory.length > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-xs text-red-400 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  Save failed
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={saveChat}
                disabled={saveStatus === 'saving'}
                className="text-xs text-slate-400 hover:text-green-400 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Save className="w-3 h-3" />
                Save now
              </button>
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            id="question"
            name="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAsking}
            rows={3}
            placeholder="Ask a question about your documents... (Press Enter to send)"
            className="block w-full pl-12 pr-14 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-all font-medium text-white placeholder:text-slate-500"
          />
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          {/* Document Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-3 bottom-3 p-2 bg-slate-700/50 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 rounded-lg transition-all border border-slate-600 hover:border-cyan-500/50"
            title="Upload Document"
          >
            <Plus className="w-5 h-5" />
          </button>
          {/* Send Button */}
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className="absolute right-3 bottom-3 p-2.5 bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
