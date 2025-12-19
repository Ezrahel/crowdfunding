/**
 * Standardized error handling utility
 */

export interface APIError {
  message: string
  code?: string
  status?: number
}

export class AppError extends Error {
  code?: string
  status?: number

  constructor(message: string, code?: string, status?: number) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
  }
}

/**
 * Handles API errors consistently
 */
export function handleAPIError(error: unknown): APIError {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  }
}

/**
 * Formats error message for display
 */
export function formatErrorMessage(error: APIError): string {
  if (error.code) {
    return `${error.message} (${error.code})`
  }
  return error.message
}

