'use client';

import { useEffect, useState } from 'react';
import { getDocuments, deleteDocument } from '@/app/actions/upload';
import { useToast } from './Toast';
import { FileText, Trash2, Clock, File } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  uploadedAt: Date;
  _count: {
    chunks: number;
  };
}

export default function DocumentList({ refreshTrigger }: { refreshTrigger?: number }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();
  const fetchDocuments = async () => {
    setIsLoading(true);
    const docs = await getDocuments();
    setDocuments(docs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    const result = await deleteDocument(id);

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Document Deleted',
        message: `"${name}" has been removed`
      });
      await fetchDocuments();
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: result.error || 'Failed to delete document'
      });
    }

    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
            <File className="w-5 h-5 text-white" />
          </div>
          Your Documents
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
          <File className="w-5 h-5 text-white" />
        </div>
        Your Documents <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full ml-2">{documents.length}</span>
      </h2>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-slate-400 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
          <p>No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group relative flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-white truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                      {doc._count.chunks} chunks
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.uploadedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(doc.id, doc.name)}
                disabled={deletingId === doc.id}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete document"
              >
                {deletingId === doc.id ? (
                  <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
