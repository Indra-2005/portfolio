// Read API Base URL from environment variable or fall back to local development default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Standard fetch helper with error handling, JSON parsing, credentials, and CSRF protection header.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    // CSRF defense header for state-changing operations
    ...(['POST', 'PATCH', 'PUT', 'DELETE'].includes(options.method || 'GET')
      ? { 'X-Requested-With': 'XMLHttpRequest' }
      : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // Ensure httpOnly JWT cookie is sent/received
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || `Request failed with status ${response.status}`;
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    const networkError = new Error(err.message || 'Network connection failed');
    networkError.status = 0;
    throw networkError;
  }
}

/**
 * Checks the operational health of the backend API.
 * Calls GET /api/v1/health
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return {
        connected: false,
        error: `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      connected: true,
      data,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to connect to backend';
    return {
      connected: false,
      error: message,
    };
  }
}

/**
 * Authentication API methods
 */
export const authApi = {
  /**
   * Login with username/email and password.
   * On success, backend sets signed JWT in httpOnly cookie.
   */
  login: async (username, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * Log out.
   * Backend clears signed JWT httpOnly cookie.
   */
  logout: async () => {
    return request('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Get current authenticated user profile.
   */
  getMe: async () => {
    return request('/auth/me', {
      method: 'GET',
    });
  },
};

/**
 * Projects API methods (Canonical Schema: short_description, technologies, featured, published, github_url, live_demo_url)
 */
export const projectsApi = {
  /**
   * Public: List published projects with pagination and optional filters
   */
  getPublicProjects: async ({ category, featured, page = 1, page_size = 20 } = {}) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (typeof featured === 'boolean') params.append('featured', featured);
    params.append('page', page);
    params.append('page_size', page_size);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/projects${query}`, { method: 'GET' });
  },

  /**
   * Public: Get published project by unique slug
   */
  getPublicProjectBySlug: async (slug) => {
    return request(`/projects/${encodeURIComponent(slug)}`, { method: 'GET' });
  },

  /**
   * Admin: List all projects (including unpublished drafts)
   */
  getAdminProjects: async ({ category, published, featured, page = 1, page_size = 50 } = {}) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (typeof published === 'boolean') params.append('published', published);
    if (typeof featured === 'boolean') params.append('featured', featured);
    params.append('page', page);
    params.append('page_size', page_size);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/admin/projects${query}`, { method: 'GET' });
  },

  /**
   * Admin: Get any project by ID
   */
  getAdminProjectById: async (id) => {
    return request(`/admin/projects/${id}`, { method: 'GET' });
  },

  /**
   * Admin: Create a new project (canonical schema fields)
   */
  createProject: async (projectData) => {
    return request('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  /**
   * Admin: Update an existing project
   */
  updateProject: async (id, projectData) => {
    return request(`/admin/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(projectData),
    });
  },

  /**
   * Admin: Delete a project
   */
  deleteProject: async (id) => {
    return request(`/admin/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Contact API methods
 */
export const contactApi = {
  /**
   * Public: Submit a contact message inquiry
   */
  sendMessage: async ({ name, email, subject, message, honeypot = '' }) => {
    return request('/contact', {
      method: 'POST',
      body: JSON.stringify({ name, email, subject, message, honeypot }),
    });
  },

  /**
   * Admin: List submitted contact messages
   */
  getAdminMessages: async ({ page = 1, page_size = 50 } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('page_size', page_size);
    return request(`/admin/messages?${params.toString()}`, { method: 'GET' });
  },

  /**
   * Admin: Mark message as read
   */
  markMessageAsRead: async (id) => {
    return request(`/admin/messages/${id}/read`, { method: 'PATCH' });
  },
};

export { API_BASE_URL };
