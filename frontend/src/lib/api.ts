const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export const apiFetch = (path: string, options: RequestInit = {}) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return fetch(`${API_BASE}${normalizedPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};
