// Input sanitization utilities for security

// Sanitize string input to prevent XSS
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim();
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate Chilean phone number format
export const isValidChileanPhone = (phone: string): boolean => {
  // Accept formats: +56 9 XXXX XXXX, 9 XXXX XXXX, XXXXXXXX
  const phoneRegex = /^(\+56\s?)?(\d{1}\s?)?\d{4}\s?\d{4}$/;
  return phoneRegex.test(phone);
};

// Sanitize phone number
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d+\s]/g, '').trim();
};

// Validate URL
export const isValidURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Sanitize URL
export const sanitizeURL = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
};

// Validate and sanitize name
export const sanitizeName = (name: string): string => {
  return sanitizeString(name)
    .replace(/[0-9]/g, '') // Remove numbers
    .replace(/[!@#$%^&*(),.?":{}|<>]/g, '') // Remove special characters
    .trim();
};

// Validate numeric input
export const isValidNumber = (input: string): boolean => {
  return /^\d+$/.test(input);
};

// Sanitize numeric input
export const sanitizeNumber = (input: string): string => {
  return input.replace(/[^\d]/g, '');
};

// Prevent SQL injection patterns
export const containsSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /('|--|;|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter|union)/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

// Comprehensive input validation
export const validateInput = (input: string, type: 'string' | 'email' | 'phone' | 'url' | 'number' | 'name'): { valid: boolean; sanitized: string; error?: string } => {
  const sanitized = sanitizeString(input);
  
  if (containsSQLInjection(input)) {
    return { valid: false, sanitized: '', error: 'Input contains invalid characters' };
  }
  
  switch (type) {
    case 'email':
      if (!isValidEmail(sanitized)) {
        return { valid: false, sanitized: '', error: 'Invalid email format' };
      }
      break;
    case 'phone':
      const sanitizedPhone = sanitizePhone(sanitized);
      if (!isValidChileanPhone(sanitizedPhone)) {
        return { valid: false, sanitized: '', error: 'Invalid phone format' };
      }
      return { valid: true, sanitized: sanitizedPhone };
    case 'url':
      if (!isValidURL(sanitized)) {
        return { valid: false, sanitized: '', error: 'Invalid URL format' };
      }
      return { valid: true, sanitized: sanitizeURL(sanitized) };
    case 'number':
      if (!isValidNumber(sanitized)) {
        return { valid: false, sanitized: '', error: 'Invalid number format' };
      }
      return { valid: true, sanitized: sanitizeNumber(sanitized) };
    case 'name':
      const sanitizedName = sanitizeName(sanitized);
      if (sanitizedName.length < 2) {
        return { valid: false, sanitized: '', error: 'Name too short' };
      }
      return { valid: true, sanitized: sanitizedName };
    case 'string':
      if (sanitized.length === 0) {
        return { valid: false, sanitized: '', error: 'Input cannot be empty' };
      }
      if (sanitized.length > 500) {
        return { valid: false, sanitized: '', error: 'Input too long' };
      }
      break;
  }
  
  return { valid: true, sanitized };
};
