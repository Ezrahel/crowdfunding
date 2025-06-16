export type SignUpStatus = 'needs_email_verification' | 'complete' | 'abandoned';

export interface SignUpResult {
  status: SignUpStatus;
  createdSessionId: string | null;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  username?: string;
}

export interface ClerkError {
  errors: Array<{
    message: string;
    meta?: {
      param_name?: string;
    };
  }>;
}



export function isClerkError(error: unknown): error is ClerkError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as ClerkError).errors)
  );
}