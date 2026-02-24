'use client';

import { useState } from 'react';
import Link from 'next/link';
import UploadForm from '@/components/UploadForm';
import DocumentList from '@/components/DocumentList';
import { ArrowLeft, FileText } from 'lucide-react';

export default function DocumentsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all border border-slate-700/50 hover:border-blue-500/50"
            >
              <ArrowLeft className="w-5 h-5 text-slate-200" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Document Management</h1>
                <p className="text-sm text-slate-400">Upload and manage your knowledge base documents</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Documents List */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <DocumentList refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-slate-900/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">About Documents</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p>• Supported formats: <span className="text-cyan-400 font-medium">.txt, .md, .csv, .json, .pdf, .docx</span></p>
            <p>• Documents are automatically chunked and embedded using OpenAI</p>
            <p>• Each chunk is stored with vector embeddings for semantic search</p>
            <p>• You can ask questions about your documents in the main chat interface</p>
          </div>
        </div>
      </main>
    </div>
  );
}
