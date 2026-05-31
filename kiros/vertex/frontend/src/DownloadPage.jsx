import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function DownloadPage() {
  const [searchParams] = useSearchParams();
  const fileId = searchParams.get('fileId');
  const key = searchParams.get('key');
  const iv = searchParams.get('iv');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    
    if (fileId && key && iv) {
      downloadFile();
    }
  }, [fileId, key, iv]);

  const downloadFile = async () => {
    try {
      setDownloading(true);
      const response = await fetch(`http://localhost:5000/api/download/${fileId}?key=${key}&iv=${iv}`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `downloaded-file`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-purple-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-white">Decrypting file...</p>
        </div>
      </div>
    );
  }

  if (!fileId || !key || !iv) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invalid Download Link</h2>
          <p className="text-slate-400">The link is missing required parameters or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-center max-w-md">
        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <div className="w-12 h-12 mx-auto bg-red-500 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Download Failed</h2>
            <p className="text-red-300">{error}</p>
          </div>
        ) : downloading ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
            <div className="w-12 h-12 mx-auto bg-emerald-500 rounded-lg flex items-center justify-center mb-3">
              <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Downloading...</h2>
            <p className="text-emerald-300">Please wait while we decrypt your file</p>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
            <div className="w-12 h-12 mx-auto bg-emerald-500 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Download Started!</h2>
            <p className="text-emerald-300">Your file is being saved to your device</p>
          </div>
        )}
      </div>
    </div>
  );
}
