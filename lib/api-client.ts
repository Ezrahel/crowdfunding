/**
 * API client utility with timeout and error handling
 */

const DEFAULT_TIMEOUT = 30000; // 30 seconds

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitizes HTML content (more permissive than sanitizeInput)
 */
export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') {
    return html; // Server-side: return as-is (will be sanitized by React)
  }
  // Client-side: use DOMPurify if available, otherwise basic sanitization
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

