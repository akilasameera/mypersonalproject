import { supabase } from './supabase';

const VPS_API_BASE = import.meta.env.VITE_VPS_API_URL || 'https://yourdomain.com/api';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
}

export const vpsClient = {
  // Notes API
  notes: {
    async getByProject(projectId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/vps-notes?project_id=${projectId}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      return response.json();
    },

    async getById(id: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/vps-notes?id=${id}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch note');
      }

      return response.json();
    },

    async create(note: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/vps-notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(note)
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      return response.json();
    },

    async update(id: string, updates: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/vps-notes`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id, ...updates })
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      return response.json();
    },

    async delete(id: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/vps-notes`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      return response.json();
    }
  },

  // Projects API
  projects: {
    async create(project: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify(project)
      });

      if (!response.ok) {
        throw new Error('Failed to create project on VPS');
      }

      return response.json();
    },

    async update(id: string, updates: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/projects`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id, ...updates })
      });

      if (!response.ok) {
        throw new Error('Failed to update project on VPS');
      }

      return response.json();
    },

    async delete(id: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/projects`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Failed to delete project on VPS');
      }

      return response.json();
    }
  },

  // Todos API
  todos: {
    async create(todo: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/todos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(todo)
      });

      if (!response.ok) {
        throw new Error('Failed to create todo on VPS');
      }

      return response.json();
    },

    async update(id: string, updates: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/todos`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id, ...updates })
      });

      if (!response.ok) {
        throw new Error('Failed to update todo on VPS');
      }

      return response.json();
    },

    async delete(id: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/todos`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo on VPS');
      }

      return response.json();
    }
  },

  // Links API
  links: {
    async create(link: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/links`, {
        method: 'POST',
        headers,
        body: JSON.stringify(link)
      });

      if (!response.ok) {
        throw new Error('Failed to create link on VPS');
      }

      return response.json();
    },

    async update(id: string, updates: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/links`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id, ...updates })
      });

      if (!response.ok) {
        throw new Error('Failed to update link on VPS');
      }

      return response.json();
    },

    async delete(id: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/links`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Failed to delete link on VPS');
      }

      return response.json();
    }
  },

  // Project Configurations API
  configurations: {
    async getByProject(projectId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/vps-configurations?project_id=${projectId}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }

      return response.json();
    },

    async upsert(config: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/vps-configurations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      return response.json();
    },

    async update(projectId: string, updates: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/vps-configurations`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ project_id: projectId, ...updates })
      });

      if (!response.ok) {
        throw new Error('Failed to update configuration');
      }

      return response.json();
    },

    async delete(projectId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(`${VPS_API_BASE}/vps-configurations`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ project_id: projectId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete configuration');
      }

      return response.json();
    }
  }
};
