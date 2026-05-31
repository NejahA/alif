import React, { useState } from 'react';

export default function DownloadLink({ file }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(file.downloadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    window.open(file.downloadLink, '_blank');
  };

  return (
    <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-white">Share Link</h3>
      </div>
      
      <div className="bg-slate-900 p-2 rounded mb-3 border border-slate-700 break-all">
        <p className="text-emerald-300 text-xs font-mono">{file.downloadLink}</p>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={copyToClipboard}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1.5 px-3 rounded transition-colors flex items-center justify-center gap-1.5 text-sm"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Link
            </>
          )}
        </button>
        <button
          onClick={downloadFile}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-1.5 px-3 rounded transition-colors flex items-center justify-center gap-1.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      </div>
    </div>
  );
}
