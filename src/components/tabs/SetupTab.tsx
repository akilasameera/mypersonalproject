import React, { useState } from 'react';
import { Settings, FileText, Cog, GraduationCap, MoreHorizontal } from 'lucide-react';

interface SetupTabProps {
  projectId: string;
}

type SetupSubTab = 'brd' | 'configuration' | 'training' | 'others';

const SetupTab: React.FC<SetupTabProps> = ({ projectId }) => {
  const [activeSubTab, setActiveSubTab] = useState<SetupSubTab>('brd');

  const subTabs = [
    { id: 'brd' as SetupSubTab, label: 'BRD', icon: FileText },
    { id: 'configuration' as SetupSubTab, label: 'Configuration', icon: Cog },
    { id: 'training' as SetupSubTab, label: 'Training', icon: GraduationCap },
    { id: 'others' as SetupSubTab, label: 'Others', icon: MoreHorizontal }
  ];

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'brd':
        return (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Business Requirements Document</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Project Overview</h4>
                  <p className="text-gray-700 text-sm">
                    Define the business objectives, scope, and requirements for this project.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Stakeholder Requirements</h4>
                  <p className="text-gray-700 text-sm">
                    Document stakeholder needs, expectations, and success criteria.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Functional Requirements</h4>
                  <p className="text-gray-700 text-sm">
                    Specify what the system should do and how it should behave.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Non-Functional Requirements</h4>
                  <p className="text-gray-700 text-sm">
                    Define performance, security, usability, and other quality attributes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'configuration':
        return (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Project Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Environment Settings</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Development environment</li>
                      <li>• Staging environment</li>
                      <li>• Production environment</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Database Configuration</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Connection strings</li>
                      <li>• Schema setup</li>
                      <li>• Migration scripts</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-2">API Configuration</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• API endpoints</li>
                      <li>• Authentication setup</li>
                      <li>• Rate limiting</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Security Settings</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Access controls</li>
                      <li>• Encryption settings</li>
                      <li>• Audit logging</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'training':
        return (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Training & Documentation</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                  <h4 className="font-semibold text-gray-900 mb-2">User Training Materials</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Comprehensive training resources for end users.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>User manuals and guides</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Video tutorials</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Interactive demos</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Administrator Training</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Technical training for system administrators.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>System administration guide</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Troubleshooting procedures</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Maintenance schedules</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Knowledge Base</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Centralized documentation and FAQs.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Frequently asked questions</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Best practices guide</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Common issues and solutions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'others':
        return (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Other Setup Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Deployment Checklist</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Pre-deployment testing</li>
                      <li>• Backup procedures</li>
                      <li>• Rollback plan</li>
                      <li>• Go-live checklist</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Quality Assurance</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Test cases</li>
                      <li>• User acceptance testing</li>
                      <li>• Performance testing</li>
                      <li>• Security testing</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Support & Maintenance</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Support procedures</li>
                      <li>• Maintenance windows</li>
                      <li>• Escalation matrix</li>
                      <li>• SLA agreements</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Compliance & Governance</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Regulatory requirements</li>
                      <li>• Data governance</li>
                      <li>• Audit trails</li>
                      <li>• Risk assessments</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Setup</h2>
          <p className="text-gray-600 mt-1">Project setup and configuration management</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-gray-200/30">
        {/* Mobile Sub-tabs - Horizontal Scroll */}
        <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {subTabs.map(subTab => (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap touch-manipulation min-w-fit ${
                  activeSubTab === subTab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md'
                }`}
              >
                <subTab.icon className="w-4 h-4" />
                <span>{subTab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Sub-tabs */}
        <div className="hidden lg:block">
          <div className="flex flex-wrap gap-2 w-fit">
            {subTabs.map(subTab => (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap touch-manipulation ${
                  activeSubTab === subTab.id
                    ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50 scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:shadow-md'
                }`}
              >
                <subTab.icon className="w-4 h-4" />
                <span>{subTab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-tab Content */}
      <div className="relative z-10">
        {renderSubTabContent()}
      </div>
    </div>
  );
};

export default SetupTab;