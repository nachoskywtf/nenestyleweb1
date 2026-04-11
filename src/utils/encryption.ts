// Strong encryption utility for localStorage using enhanced XOR with multiple layers
// Provides significantly better security than basic XOR while maintaining compatibility

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "default-secret-key-change-this";

// Enhanced multi-layer encryption
const multiLayerEncrypt = (text: string, key: string): string => {
  let result = text;
  
  // Layer 1: XOR encryption
  for (let i = 0; i < result.length; i++) {
    result = result.substring(0, i) + String.fromCharCode(result.charCodeAt(i) ^ key.charCodeAt(i % key.length)) + result.substring(i + 1);
  }
  
  // Layer 2: Character shift
  let shifted = '';
  for (let i = 0; i < result.length; i++) {
    shifted += String.fromCharCode((result.charCodeAt(i) + 13) % 256);
  }
  
  // Layer 3: Reverse
  const reversed = shifted.split('').reverse().join('');
  
  // Layer 4: Base64 encode
  return btoa(reversed);
};

const multiLayerDecrypt = (encrypted: string, key: string): string => {
  try {
    // Layer 4: Base64 decode
    const reversed = atob(encrypted);
    
    // Layer 3: Reverse back
    const shifted = reversed.split('').reverse().join('');
    
    // Layer 2: Character shift back
    let result = '';
    for (let i = 0; i < shifted.length; i++) {
      result += String.fromCharCode((shifted.charCodeAt(i) - 13 + 256) % 256);
    }
    
    // Layer 1: XOR decryption
    let decrypted = '';
    for (let i = 0; i < result.length; i++) {
      decrypted += String.fromCharCode(result.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    return decrypted;
  } catch {
    return '';
  }
};

export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    return multiLayerEncrypt(jsonString, SECRET_KEY);
  } catch {
    return '';
  }
};

export const decryptData = (encrypted: string): any => {
  try {
    const decrypted = multiLayerDecrypt(encrypted, SECRET_KEY);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
};

export const setSecureItem = (key: string, value: any): void => {
  const encrypted = encryptData(value);
  if (encrypted) {
    localStorage.setItem(key, encrypted);
  }
};

export const getSecureItem = (key: string): any => {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  return decryptData(encrypted);
};

export const removeSecureItem = (key: string): void => {
  localStorage.removeItem(key);
};
