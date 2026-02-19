/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Validate username format
 * 3-20 characters, alphanumeric and underscores only
 */
export const isValidUsername = (username: string): boolean => {
  if (username.length < 3 || username.length > 20) return false;
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate profile name
 */
export const isValidName = (name: string): boolean => {
  if (!name || name.trim().length < 2 || name.trim().length > 50) {
    return false;
  }
  return true;
};
