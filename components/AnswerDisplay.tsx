import { QueryResult } from '@/app/actions/query';
import { Bot, FileText, Quote } from 'lucide-react';

interface AnswerDisplayProps {
  result: QueryResult;
}

export default function AnswerDisplay({ result }: AnswerDisplayProps) {
  if (!result.success) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
        <div className="p-2 bg-red-500/20 rounded-lg text-red-400 flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-red-300">Error Generating Answer</h3>
          <p className="text-red-400 text-sm mt-1">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Answer Bubble */}
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-500/30">
          <Bot className="w-6 h-6" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="prose prose-blue max-w-none">
            <div className="bg-slate-800/50 p-6 rounded-2xl rounded-tl-none border border-slate-700/50 text-slate-100 leading-relaxed whitespace-pre-wrap">
              {result.answer}
            </div>
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      {result.sources && result.sources.length > 0 && (
        <div className="ml-14">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Quote className="w-4 h-4" />
            Sources used
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.sources.map((source, index) => (
              <div
                key={index}
                className="group p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-blue-500/50 transition-all duration-200 cursor-default"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-white truncate">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="truncate">{source.documentName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded-full">
                    {(source.similarity * 100).toFixed(0)}% match
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-900/50 p-2 rounded-lg border border-slate-700/30">
                  {source.chunkText}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertTriangle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
