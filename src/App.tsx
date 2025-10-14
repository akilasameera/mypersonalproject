import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, ...projectActions } = useProjects(user?.id);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Dashboard 
      user={{
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        createdAt: user.created_at,
      }}
      projects={projects}
      projectActions={projectActions}
      loading={projectsLoading}
    />
  );
}

export default App;