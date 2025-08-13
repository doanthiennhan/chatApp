
import * as jwt_decode from 'jwt-decode';

// Token utilities
export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwt_decode.jwtDecode(token);
    if (!decoded.exp) return false;
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
};

export const getTokenExpiration = (token) => {
  if (!token) return null;
  try {
    const decoded = jwt_decode.jwtDecode(token);
    return decoded.exp ? new Date(decoded.exp * 1000) : null;
  } catch {
    return null;
  }
};

// Date utilities
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString();
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return 'Vừa xong';
};

// String utilities
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// Error handling
export const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    return error.response.data?.message || 'Có lỗi xảy ra';
  }
  return error.message || 'Có lỗi xảy ra';
};
