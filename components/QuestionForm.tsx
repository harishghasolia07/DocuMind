'use client';

import { useState, useRef, useEffect } from 'react';
import { askQuestion, QueryResult } from '@/app/actions/query';
import { saveChatSession, ChatMessage } from '@/app/actions/chat';
import { uploadDocument } from '@/app/actions/upload';
import AnswerDisplay from './AnswerDisplay';
import { useToast } from './Toast';
import { Send, Sparkles, Trash2, Save, Plus, Mic, MicOff } from 'lucide-react';

// Browser Speech Recognition types (not always in TS lib)
interface SpeechRecognitionResultItem { transcript: string; }
interface SpeechRecognitionResult { isFinal: boolean; 0: SpeechRecognitionResultItem; }
interface SR_Event { resultIndex: number; results: { length: number; [i: number]: SpeechRecognitionResult } }
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((e: SR_Event) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
interface SpeechWindow {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

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
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const { addToast } = useToast();

  /** Toggle voice recognition */
  const toggleVoice = () => {
    const SpeechRecognition =
      (window as unknown as SpeechWindow).SpeechRecognition ||
      (window as unknown as SpeechWindow).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast({ type: 'error', title: 'Not Supported', message: 'Voice input is not supported in your browser.' });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;   // keep listening until user stops manually

    // Snapshot what's already in the box so we append cleanly without duplication
    const baseText = question;
    let finalTranscript = '';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SR_Event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t;
        else interim = t;
      }
      const combined = (baseText + (baseText && (finalTranscript || interim) ? ' ' : '') + finalTranscript + interim).trimStart();
      setQuestion(combined);
      setTimeout(autoResize, 0);
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalText = (baseText + (baseText && finalTranscript ? ' ' : '') + finalTranscript).trimStart();
      if (finalTranscript) {
        setQuestion(finalText);
        setTimeout(autoResize, 0);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      addToast({ type: 'error', title: 'Voice Error', message: 'Voice recognition failed. Please try again.' });
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  /** Auto-resize textarea to fit its content, capped at ~200px */
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

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
    // Reset textarea height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

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

    const ALLOWED = new Set(['.txt', '.md', '.csv', '.json', '.pdf', '.docx']);
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED.has(ext)) {
      addToast({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Allowed: .txt, .md, .csv, .json, .pdf, .docx'
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat History Area — full-width scroll, content constrained */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
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
      </div>{/* end max-w-3xl content */}
      </div>{/* end scroll area */}

      {/* Input Area — same max-width as messages */}
      <div className="max-w-6xl mx-auto w-full px-4 pb-5 space-y-2">
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
          {/* Single-row input bar: [Plus] [textarea] [Send] */}
          <div className="flex items-end gap-2 bg-slate-800/50 border border-slate-700/50 rounded-3xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.csv,.json,.pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Attachment button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 mb-0.5 p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all"
              title="Attach document"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Auto-grow textarea */}
            <textarea
              ref={textareaRef}
              id="question"
              name="question"
              value={question}
              onChange={(e) => { setQuestion(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              disabled={isAsking}
              rows={1}
              placeholder="Ask a question about your documents..."
              className="flex-1 bg-transparent border-none outline-none resize-none leading-6 py-0.5 text-white placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium overflow-y-auto"
              style={{ minHeight: '28px', maxHeight: '200px' }}
            />

            {/* Mic button */}
            <button
              type="button"
              onClick={toggleVoice}
              disabled={isAsking}
              className={`shrink-0 mb-0.5 p-1.5 rounded-full transition-all ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop recording' : 'Voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={isAsking || !question.trim()}
              className="shrink-0 mb-0.5 p-1.5 bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
