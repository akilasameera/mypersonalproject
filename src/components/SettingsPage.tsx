import React, { useState } from 'react';
import { User, Mail, Lock, Bell, Palette, Database, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SettingsPageProps {
  user: any;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut();
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and application preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={user?.name || ''}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                        <input
                          type="text"
                          value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Receive email updates about your projects</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Due Date Reminders</h3>
                          <p className="text-sm text-gray-600">Get notified when tasks are due</p>
                        </div>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Project Updates</h3>
                          <p className="text-sm text-gray-600">Notifications about project changes</p>
                        </div>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>Light</option>
                          <option>Dark</option>
                          <option>System</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Data & Privacy</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Data Export</h3>
                        <p className="text-sm text-blue-700 mb-3">Download all your project data</p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                          Export Data
                        </button>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
                        <p className="text-sm text-red-700 mb-3">Permanently delete your account and all data</p>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Password</h3>
                        <p className="text-sm text-gray-600 mb-3">Change your account password</p>
                        <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                          Change Password
                        </button>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600 mb-3">Add an extra layer of security</p>
                        <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Section */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Sign Out</h3>
                  <p className="text-sm text-gray-600">Sign out of your account</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;