import React from 'react';
import { X, Download, FileText, Image, Video, Music, File, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface AttachmentPreviewProps {
  attachment: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  };
  onClose: () => void;
  onDelete?: () => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment, onClose, onDelete }) => {
  const [zoomLevel, setZoomLevel] = React.useState(100);
  
  const isImage = attachment.type.startsWith('image/');
  const isVideo = attachment.type.startsWith('video/');
  const isAudio = attachment.type.startsWith('audio/');
  const isPDF = attachment.type.includes('pdf');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const zoomLevels = [50, 75, 100, 125, 150, 200, 300, 400];
  
  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex < zoomLevels.length - 1) {
      setZoomLevel(zoomLevels[currentIndex + 1]);
    }
  };
  
  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(zoomLevels[currentIndex - 1]);
    }
  };
  
  const resetZoom = () => {
    setZoomLevel(100);
  };
  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-[95vw] max-h-[95vh] w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              {isImage ? <Image className="w-6 h-6 text-blue-600" /> :
               isVideo ? <Video className="w-6 h-6 text-blue-600" /> :
               isAudio ? <Music className="w-6 h-6 text-blue-600" /> :
               <File className="w-6 h-6 text-blue-600" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{attachment.name.split('/').pop()}</h3>
              <p className="text-gray-600">{formatFileSize(attachment.size)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Zoom Controls for Images */}
            {isImage && (
              <div className="flex items-center space-x-3 mr-6">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= zoomLevels[0]}
                  className="p-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600" />
                </button>
                
                <select
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {zoomLevels.map(level => (
                    <option key={level} value={level}>{level}%</option>
                  ))}
                </select>
                
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= zoomLevels[zoomLevels.length - 1]}
                  className="p-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={resetZoom}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
            
            <a
              href={attachment.url}
              download
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Download className="w-6 h-6" />
            </a>
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(95vh-140px)] overflow-auto bg-gray-100">
          {isImage ? (
            <div className="flex items-center justify-center min-h-full p-8">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="object-contain rounded-2xl shadow-2xl bg-white border border-gray-200 transition-transform duration-300"
                style={{ 
                  transform: `scale(${zoomLevel / 100})`,
                  maxWidth: zoomLevel <= 100 ? '100%' : 'none',
                  maxHeight: zoomLevel <= 100 ? 'calc(95vh - 220px)' : 'none'
                }}
              />
            </div>
          ) : isVideo ? (
            <div className="flex items-center justify-center min-h-full p-8">
              <video
                src={attachment.url}
                controls
                className="max-w-full max-h-full rounded-2xl shadow-2xl"
                style={{ maxHeight: 'calc(95vh - 220px)' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : isAudio ? (
            <div className="flex items-center justify-center py-32 bg-white">
              <div className="text-center">
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Music className="w-16 h-16 text-blue-600" />
                </div>
                <audio
                  src={attachment.url}
                  controls
                  className="mx-auto"
                >
                  Your browser does not support the audio tag.
                </audio>
              </div>
            </div>
          ) : isPDF ? (
            <div className="w-full h-full bg-white p-4">
              <iframe
                src={attachment.url}
                className="w-full h-full min-h-[700px] rounded-2xl border border-gray-200 shadow-lg"
                title={attachment.name}
              />
            </div>
          ) : (
            <div className="text-center py-32 bg-white">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-16 h-16 text-gray-600" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">Preview not available</h3>
              <p className="text-gray-600 mb-6 text-lg">This file type cannot be previewed</p>
              <a
                href={attachment.url}
                download
                className="inline-flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors text-lg font-medium"
              >
                <Download className="w-5 h-5" />
                <span>Download File</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentPreview;