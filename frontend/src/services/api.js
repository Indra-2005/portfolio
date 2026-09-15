// Read API Base URL from environment variable or fall back to local development default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Checks the operational health of the backend API.
 * Calls GET /api/v1/health
 *
 * @returns {Promise<{ connected: boolean, data?: { status: string }, error?: string }>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
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

export { API_BASE_URL };
