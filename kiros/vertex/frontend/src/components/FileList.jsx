import React, { useState } from 'react';

export default function FileList({ files }) {
  const [downloading, setDownloading] = useState(null);

  if (files.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="w-10 h-10 mx-auto bg-white/5 rounded flex items-center justify-center mb-2">
          <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        </div>
        <p className="text-purple-200 text-xs">No files uploaded yet</p>
      </div>
    );
  }

  const downloadFile = async (file) => {
    setDownloading(file.id);
    try {
      const response = await fetch(`http://localhost:5000/api/download/${file.id}?key=${file.encryptionKey}&iv=${file.iv}`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message || 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div 
          key={file.id} 
          className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded p-2.5 transition-all duration-200"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-xs truncate" title={file.originalName}>
                {file.originalName}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-purple-200 text-xs">
                  {(file.fileSize / 1024).toFixed(1)} KB
                </span>
                <span className="text-purple-300/50 text-xs">•</span>
                <span className="text-purple-300 text-xs">
                  {file.downloads || 0} downloads
                </span>
              </div>
              <button
                onClick={() => downloadFile(file)}
                disabled={downloading === file.id}
                className="mt-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-1 px-3 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading === file.id ? 'Downloading...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
