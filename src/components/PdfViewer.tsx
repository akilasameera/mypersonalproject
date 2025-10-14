import React, { useState, useEffect } from 'react';
import { ExternalLink, Download, AlertCircle } from 'lucide-react';

interface PdfViewerProps {
  url: string;
  className?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, className = '' }) => {
  const [canLoad, setCanLoad] = useState(true);

  useEffect(() => {
    const checkPdf = async () => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        setCanLoad(response.ok);
      } catch {
        setCanLoad(false);
      }
    };
    checkPdf();
  }, [url]);

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = url.split('/').pop() || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF');
    }
  };

  if (!canLoad) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <AlertCircle className="w-12 h-12 text-yellow-600 mb-3" />
        <p className="text-sm text-yellow-800 mb-4">Unable to display PDF inline</p>
        <div className="flex gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in New Tab</span>
          </a>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative bg-gray-100 rounded-lg border border-gray-300 overflow-hidden">
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm shadow-lg"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open</span>
          </a>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
        <object
          data={url}
          type="application/pdf"
          className="w-full h-[600px]"
        >
          <div className="flex flex-col items-center justify-center h-[600px] p-8">
            <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Your browser cannot display this PDF</p>
            <div className="flex gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in New Tab</span>
              </a>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </object>
      </div>
    </div>
  );
};

export default PdfViewer;
