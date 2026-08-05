const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('http')) return endpoint;
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BASE_URL}${cleanPath}`;
};
