/**
 * Professional Email Validation System
 * 
 * Rules:
 * 1. Email must not be empty or contain whitespace.
 * 2. Email must contain exactly one '@' symbol.
 * 3. Username (before @):
 *    - Must contain at least 1 character.
 *    - Allowed characters: letters (a-z, A-Z), numbers (0-9), dots (.), underscores (_), hyphens (-).
 *    - Must NOT start or end with a dot (.).
 *    - Must NOT contain consecutive dots (..).
 * 4. Domain (after @):
 *    - Must contain at least 1 character before the extension (e.g., 'abc@.com' is invalid).
 *    - Must NOT start with a dot or contain consecutive dots.
 *    - Must end with a valid domain extension (.com, .org, .edu, .in, .net, .co.in, etc.).
 *    - Extension must be at least 2 alpha characters.
 */

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return { isValid: false, error: 'Email address cannot be empty.' };
  }

  const trimmed = email.trim();

  // 1. Check for spaces anywhere
  if (/\s/.test(trimmed)) {
    return { isValid: false, error: 'Email address cannot contain spaces.' };
  }

  // 2. Check for exactly one @ symbol
  const atParts = trimmed.split('@');
  if (atParts.length !== 2) {
    if (atParts.length === 1) {
      return { isValid: false, error: 'Email address must contain an @ symbol.' };
    }
    return { isValid: false, error: 'Email address cannot contain more than one @ symbol.' };
  }

  const [username, domain] = atParts;

  // 3. Validate Username (before @)
  if (!username || username.length === 0) {
    return { isValid: false, error: 'Username before @ cannot be empty.' };
  }

  if (username.startsWith('.')) {
    return { isValid: false, error: 'Username cannot start with a dot.' };
  }

  if (username.endsWith('.')) {
    return { isValid: false, error: 'Username cannot end with a dot before @.' };
  }

  if (username.includes('..')) {
    return { isValid: false, error: 'Username cannot contain consecutive dots (..).' };
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username contains invalid characters. Only letters, numbers, dots, underscores, and hyphens are allowed.' };
  }

  // 4. Validate Domain (after @)
  if (!domain || domain.length === 0) {
    return { isValid: false, error: 'Domain name after @ cannot be empty.' };
  }

  if (domain.startsWith('.')) {
    return { isValid: false, error: 'Domain name before extension cannot be empty (e.g. abc@.com is invalid).' };
  }

  if (domain.includes('..')) {
    return { isValid: false, error: 'Domain name cannot contain consecutive dots (..).' };
  }

  if (!domain.includes('.')) {
    return { isValid: false, error: 'Domain must end with a valid extension like .com or .edu (e.g. bhumika@gmail.com).' };
  }

  // Domain Regex: Name before extension + valid extension (.com, .org, .edu, .in, .co.in, etc.)
  const domainRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return { isValid: false, error: 'Invalid domain format. Domain extension must contain valid letters (e.g. .com, .edu, .org, .in).' };
  }

  return { isValid: true, error: null };
};
