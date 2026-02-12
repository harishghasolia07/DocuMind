'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadDocument } from '@/app/actions/upload';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadForm({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setMessage({ type: 'error', text: 'Only .txt files are allowed' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadDocument(formData);

    if (result.success) {
      setMessage({
        type: 'success',
        text: `Success! Created ${result.chunksCreated} chunks. Redirecting to chat...`,
      });
      if (onUploadSuccess) onUploadSuccess();
      
      // Redirect to chat after 2 seconds
      setTimeout(() => {
        router.push('/?newChat=true');
      }, 2000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Upload failed' });
    }

    setIsUploading(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
          <UploadCloud className="w-5 h-5 text-white" />
        </div>
        Upload Document
      </h2>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-xl p-8
          transition-all duration-200 ease-in-out
          flex flex-col items-center justify-center text-center
          ${isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
            : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          ) : (
            <FileText className="w-6 h-6 text-blue-400" />
          )}
        </div>

        <p className="text-sm font-medium text-white mb-1">
          {isUploading ? 'Uploading...' : 'Click to upload or drag & drop'}
        </p>
        <p className="text-xs text-slate-400">
          Only .txt files allowed
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={onFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${message.type === 'success'
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}
