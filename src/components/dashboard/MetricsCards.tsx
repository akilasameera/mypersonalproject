import React from 'react';
import { FolderOpen, CheckSquare, Clock, AlertTriangle } from 'lucide-react';

interface MetricsCardsProps {
  metrics: {
    activeProjects: number;
    totalProjects: number;
    completedTodos: number;
    totalTodos: number;
    pendingTodos: number;
    overdueTodos: any[];
  };
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-white/50 p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{metrics.activeProjects}</p>
            <p className="text-xs text-gray-600 font-medium">Active Projects</p>
            <p className="text-xs text-gray-500">of {metrics.totalProjects} total</p>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-white/50 p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
            <CheckSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{metrics.completedTodos}</p>
            <p className="text-xs text-gray-600 font-medium">Completed Tasks</p>
            <p className="text-xs text-gray-500">of {metrics.totalTodos} total</p>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-white/50 p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{metrics.pendingTodos}</p>
            <p className="text-xs text-gray-600 font-medium">Pending Tasks</p>
            <p className="text-xs text-gray-500">need attention</p>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-white/50 p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{metrics.overdueTodos.length}</p>
            <p className="text-xs text-gray-600 font-medium">Overdue Tasks</p>
            <p className="text-xs text-gray-500">require action</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;