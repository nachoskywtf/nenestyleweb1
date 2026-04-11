// CSRF Protection utilities for client-side applications

// Generate CSRF token
export const generateCSRFToken = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const session = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}-${session}`;
};

// Store CSRF token in sessionStorage
export const setCSRFToken = (): string => {
  const token = generateCSRFToken();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

// Get CSRF token
export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf_token');
};

// Validate CSRF token
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  if (!storedToken) return false;
  
  // Check if token matches
  if (token !== storedToken) return false;
  
  // Check if token is not too old (1 hour)
  const timestamp = parseInt(token.split('-')[0], 36);
  const oneHour = 60 * 60 * 1000;
  if (Date.now() - timestamp > oneHour) {
    sessionStorage.removeItem('csrf_token');
    return false;
  }
  
  return true;
};

// Refresh CSRF token
export const refreshCSRFToken = (): string => {
  sessionStorage.removeItem('csrf_token');
  return setCSRFToken();
};

// Clear CSRF token (on logout)
export const clearCSRFToken = (): void => {
  sessionStorage.removeItem('csrf_token');
};

// Add CSRF token to form data
export const addCSRFToFormData = (formData: FormData): FormData => {
  const token = getCSRFToken() || setCSRFToken();
  formData.append('csrf_token', token);
  return formData;
};

// Add CSRF token to URL parameters
export const addCSRFToURL = (url: string): string => {
  const token = getCSRFToken() || setCSRFToken();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}csrf_token=${encodeURIComponent(token)}`;
};

// Validate request origin
export const validateOrigin = (): boolean => {
  const currentOrigin = window.location.origin;
  const allowedOrigins = [
    currentOrigin,
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  return allowedOrigins.includes(currentOrigin);
};

// Validate referrer
export const validateReferrer = (): boolean => {
  const referrer = document.referrer;
  if (!referrer) return true; // Allow if no referrer
  
  try {
    const referrerOrigin = new URL(referrer).origin;
    const currentOrigin = window.location.origin;
    return referrerOrigin === currentOrigin;
  } catch {
    return false;
  }
};
