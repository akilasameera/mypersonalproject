import React from 'react';
import { ExternalLink, Download, FileText } from 'lucide-react';

interface FileViewerProps {
  url: string;
  fileName?: string;
  fileType?: string;
  className?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ url, fileName, fileType, className = '' }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName || url.split('/').pop() || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const getFileIcon = () => {
    if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) {
      return '📊';
    }
    if (fileType?.includes('pdf')) {
      return '📄';
    }
    return '📎';
  };

  return (
    <div className={className}>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="text-8xl">{getFileIcon()}</div>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {fileName || 'Document'}
            </h3>
            <p className="text-sm text-gray-600">
              {fileType || 'File uploaded successfully'}
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Open File</span>
            </a>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 w-full max-w-md">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-1">How to view:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Click "Open File" to view in a new tab</li>
                  <li>Click "Download" to save to your device</li>
                  <li>PowerPoint files open best in Microsoft Office or Google Slides</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
