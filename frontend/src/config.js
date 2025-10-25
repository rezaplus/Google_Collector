/**
 * Dynamic API Configuration
 * This file provides dynamic API URL configuration that works in any environment
 * without hardcoding domain names or ports.
 */

// Get the API URL from environment variable or construct it dynamically
const getApiUrl = () => {
  // If REACT_APP_API_URL is set in environment, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Otherwise, construct it dynamically based on the current window location
  // This assumes the backend is running on the same host but different port
  const protocol = window.location.protocol; // http: or https:
  const hostname = window.location.hostname; // e.g., localhost or example.com
  const backendPort = process.env.REACT_APP_BACKEND_PORT || '3001';
  
  return `${protocol}//${hostname}:${backendPort}`;
};

export const API_URL = getApiUrl();
export const BEARER_TOKEN = process.env.REACT_APP_BEARER_TOKEN || 'Bearer AIzaSyD8Z0jJ9Q9Q6Z2MaSKLNSD2jkmsasdnk';
export const USERNAME = process.env.REACT_APP_USERNAME || 'admin';
export const PASSWORD = process.env.REACT_APP_PASSWORD || 'Hello123!';
