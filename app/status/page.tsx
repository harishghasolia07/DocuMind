'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StatusCheck {
  status: 'ok' | 'error';
  message?: string;
  details?: any;
}

interface HealthStatus {
  database: StatusCheck;
  llm: StatusCheck;
  timestamp: string;
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

export default function StatusPage() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError('Failed to fetch status');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusColor = (status: 'ok' | 'error') => {
    return status === 'ok'
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getOverallColor = (overall: string) => {
    switch (overall) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">System Status</h1>
              <p className="mt-1 text-sm text-slate-400">
                Check the health of backend services
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-blue-500/30"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-lg text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-slate-300">Loading status...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-red-300 mb-2">Error</h2>
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchStatus}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {status && !isLoading && (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Overall Status
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Last checked: {new Date(status.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                      status.overall === 'healthy'
                        ? 'bg-green-500/20 text-green-400'
                        : status.overall === 'degraded'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        status.overall === 'healthy'
                          ? 'bg-green-400'
                          : status.overall === 'degraded'
                          ? 'bg-yellow-400'
                          : 'bg-red-400'
                      }`}
                    ></span>
                    {status.overall.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Database Status */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    />
                  </svg>
                  Database
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                    status.database.status
                  )}`}
                >
                  {status.database.status === 'ok' ? '✓ Connected' : '✗ Error'}
                </span>
              </div>
              
              {status.database.message && (
                <p className="text-sm text-slate-300 mb-2">{status.database.message}</p>
              )}
              
              {status.database.details && (
                <div className="bg-slate-800/50 p-3 rounded text-sm border border-slate-700/30">
                  <p className="text-slate-300">
                    <strong>Connection:</strong>{' '}
                    {status.database.details.connected ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-slate-300">
                    <strong>pgvector Extension:</strong>{' '}
                    {status.database.details.pgvectorEnabled ? 'Enabled ✓' : 'Not Enabled ✗'}
                  </p>
                </div>
              )}
            </div>

            {/* LLM Status */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center\">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  LLM (OpenAI)
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                    status.llm.status
                  )}`}
                >
                  {status.llm.status === 'ok' ? '✓ Connected' : '✗ Error'}
                </span>
              </div>
              
              {status.llm.message && (
                <p className="text-sm text-slate-300 mb-2">{status.llm.message}</p>
              )}
              
              {status.llm.details && (
                <div className="bg-slate-800/50 p-3 rounded text-sm border border-slate-700/30">
                  <p className="text-slate-300">
                    <strong>Model:</strong> {status.llm.details.model}
                  </p>
                  <p className="text-slate-300">
                    <strong>Connection:</strong>{' '}
                    {status.llm.details.connected ? 'Active ✓' : 'Inactive ✗'}
                  </p>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <div className="flex justify-center">
              <button
                onClick={fetchStatus}
                className="px-6 py-3 bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg transition-all font-medium shadow-lg shadow-blue-500/30"
              >
                Refresh Status
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
