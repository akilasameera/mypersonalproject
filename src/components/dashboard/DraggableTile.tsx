import React, { useState } from 'react';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';

interface DraggableTileProps {
  id: string;
  title: string;
  children: React.ReactNode;
  size: 'small' | 'medium' | 'large';
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string) => void;
  onResize?: (id: string, newSize: 'small' | 'medium' | 'large') => void;
  isDragging: boolean;
}

const DraggableTile: React.FC<DraggableTileProps> = ({
  id,
  title,
  children,
  size,
  onDragStart,
  onDragEnd,
  onDrop,
  onResize,
  isDragging
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-1 lg:col-span-2';
      case 'large': return 'col-span-1 lg:col-span-2 xl:col-span-3';
      default: return 'col-span-1';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    onDragStart(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(id);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  const cycleSize = () => {
    if (!onResize) return;
    
    const nextSize = size === 'small' ? 'medium' : size === 'medium' ? 'large' : 'small';
    onResize(id, nextSize);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group relative cursor-move ${getSizeClasses(size)} ${
        isDragging ? 'opacity-50 scale-95 rotate-2' : ''
      } ${
        isDragOver ? 'ring-2 ring-blue-400 border-blue-300 scale-105 bg-blue-50/50' : ''
      }`}
    >
      {/* Drag Handle and Resize Controls */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-1 z-10">
        {onResize && (
          <button
            onClick={cycleSize}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-white/80 backdrop-blur shadow-sm border border-gray-200"
            title={`Resize (currently ${size})`}
          >
            {size === 'small' ? <Maximize2 className="w-4 h-4 text-blue-600" /> : 
             size === 'medium' ? <Maximize2 className="w-4 h-4 text-purple-600" /> : 
             <Minimize2 className="w-4 h-4 text-green-600" />}
          </button>
        )}
        <div className="cursor-move p-2 hover:bg-gray-100 rounded-lg transition-colors bg-white/80 backdrop-blur shadow-sm border border-gray-200">
          <GripVertical className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 pr-12">{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default DraggableTile;