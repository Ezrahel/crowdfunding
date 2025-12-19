"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  OAuthProvider,
  UserCredential,
  linkWithPopup,
  unlink,
  updateEmail,
  reauthenticateWithPopup,
  AuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { trackSocialLogin } from '@/lib/analytics';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  linkAccount: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  unlinkAccount: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  syncProfilePicture: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error; // Re-throw to let caller handle
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && userCredential.user) {
        try {
          await updateProfile(userCredential.user, { displayName });
        } catch (error) {
          console.error('Error updating profile:', error);
          // Continue even if profile update fails
        }
      }
      
      // Send verification email
      if (userCredential.user) {
        try {
          await sendEmailVerification(userCredential.user);
        } catch (error) {
          console.error('Error sending verification email:', error);
          // Continue even if email send fails
        }
      }
      
      return userCredential;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error; // Re-throw to let caller handle
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still redirect even if signOut fails
      router.push('/');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error; // Re-throw to let caller handle
    }
  };

  const sendVerificationEmail = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
      } catch (error: any) {
        console.error('Send verification email error:', error);
        throw error; // Re-throw to let caller handle
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes for profile information
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      
      // Track analytics
      try {
        await trackSocialLogin({
          user_id: result.user.uid,
          provider: 'google',
          action: result.user.metadata.creationTime === result.user.metadata.lastSignInTime ? 'sign_up' : 'sign_in',
          success: true,
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
      
      // Create/update user profile in backend
      if (result.user) {
        try {
          const token = await result.user.getIdToken();
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';
          
          const response = await fetch(`${apiUrl}/api/auth/user`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: result.user.uid,
              email: result.user.email || '',
              display_name: result.user.displayName || '',
              photo_url: result.user.photoURL || '',
              provider: 'google',
            }),
          });

          if (!response.ok) {
            console.warn('Failed to create user profile:', await response.text());
          }
        } catch (profileError) {
          console.warn('Failed to create user profile:', profileError);
        }

        // Sync profile picture
        if (result.user.photoURL) {
          try {
            await syncProfilePicture();
          } catch (syncError) {
            console.warn('Profile picture sync failed:', syncError);
          }
        }

        // Handle email verification for Google (Google emails are pre-verified)
        if (result.user.email && !result.user.emailVerified) {
          try {
            // Google emails are already verified, but we'll mark it in our system
            await sendEmailVerification(result.user);
          } catch (verifyError) {
            console.warn('Email verification failed:', verifyError);
          }
        }
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      // Track failed login
      try {
        await trackSocialLogin({
          user_id: 'unknown',
          provider: 'google',
          action: 'sign_in',
          success: false,
          error_code: error.code,
          error_message: error.message,
        });
      } catch (analyticsError) {
        // Ignore analytics errors
      }
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with this email using a different sign-in method.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      // Add scopes for profile information
      provider.addScope('email');
      provider.addScope('public_profile');
      
      const result = await signInWithPopup(auth, provider);
      
      // Track analytics
      try {
        await trackSocialLogin({
          user_id: result.user.uid,
          provider: 'facebook',
          action: result.user.metadata.creationTime === result.user.metadata.lastSignInTime ? 'sign_up' : 'sign_in',
          success: true,
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
      
      // Create/update user profile in backend
      if (result.user) {
        try {
          const token = await result.user.getIdToken();
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';
          
          const response = await fetch(`${apiUrl}/api/auth/user`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: result.user.uid,
              email: result.user.email || '',
              display_name: result.user.displayName || '',
              photo_url: result.user.photoURL || '',
              provider: 'facebook',
            }),
          });

          if (!response.ok) {
            console.warn('Failed to create user profile:', await response.text());
          }
        } catch (profileError) {
          console.warn('Failed to create user profile:', profileError);
        }

        // Sync profile picture
        if (result.user.photoURL) {
          try {
            await syncProfilePicture();
          } catch (syncError) {
            console.warn('Profile picture sync failed:', syncError);
          }
        }

        // Handle email verification for Facebook
        if (result.user.email && !result.user.emailVerified) {
          try {
            await sendEmailVerification(result.user);
          } catch (verifyError) {
            console.warn('Email verification failed:', verifyError);
          }
        }
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Facebook sign in error:', error);
      
      // Track failed login
      try {
        await trackSocialLogin({
          user_id: 'unknown',
          provider: 'facebook',
          action: 'sign_in',
          success: false,
          error_code: error.code,
          error_message: error.message,
        });
      } catch (analyticsError) {
        // Ignore analytics errors
      }
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with this email using a different sign-in method.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Facebook sign-in.');
      }
      
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const provider = new OAuthProvider('apple.com');
      // Add scopes for Apple Sign-In
      provider.addScope('email');
      provider.addScope('name');
      
      const result = await signInWithPopup(auth, provider);
      
      // Track analytics
      try {
        await trackSocialLogin({
          user_id: result.user.uid,
          provider: 'apple',
          action: result.user.metadata.creationTime === result.user.metadata.lastSignInTime ? 'sign_up' : 'sign_in',
          success: true,
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
      
      // Create/update user profile in backend
      if (result.user) {
        try {
          const token = await result.user.getIdToken();
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';
          
          const response = await fetch(`${apiUrl}/api/auth/user`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: result.user.uid,
              email: result.user.email || '',
              display_name: result.user.displayName || '',
              photo_url: result.user.photoURL || '',
              provider: 'apple',
            }),
          });

          if (!response.ok) {
            console.warn('Failed to create user profile:', await response.text());
          }
        } catch (profileError) {
          console.warn('Failed to create user profile:', profileError);
        }

        // Handle email verification for Apple (Apple doesn't always provide email)
        if (result.user.email && !result.user.emailVerified) {
          try {
            // For Apple, we trust the email if it comes from Apple
            // But we still mark it as verified in our system
            await sendEmailVerification(result.user);
          } catch (verifyError) {
            console.warn('Email verification failed:', verifyError);
          }
        }
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      
      // Track failed login
      try {
        await trackSocialLogin({
          user_id: 'unknown',
          provider: 'apple',
          action: 'sign_in',
          success: false,
          error_code: error.code,
          error_message: error.message,
        });
      } catch (analyticsError) {
        // Ignore analytics errors
      }
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with this email using a different sign-in method.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Apple sign-in.');
      }
      
      throw error;
    }
  };

  // Link additional account to existing user
  const linkAccount = async (providerType: 'google' | 'facebook' | 'apple') => {
    if (!user) {
      throw new Error('You must be logged in to link an account');
    }

    try {
      let provider: AuthProvider;
      
      switch (providerType) {
        case 'google':
          provider = new GoogleAuthProvider();
          provider.addScope('profile');
          provider.addScope('email');
          break;
        case 'facebook':
          provider = new FacebookAuthProvider();
          provider.addScope('email');
          provider.addScope('public_profile');
          break;
        case 'apple':
          provider = new OAuthProvider('apple.com');
          provider.addScope('email');
          provider.addScope('name');
          break;
        default:
          throw new Error('Invalid provider');
      }

      const result = await linkWithPopup(user, provider);
      
      // Track analytics
      try {
        await trackSocialLogin({
          user_id: user.uid,
          provider: providerType,
          action: 'link_account',
          success: true,
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }

      // Update backend with linked provider
      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';
        
        await fetch(`${apiUrl}/api/auth/user/link`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: providerType,
            email: result.user.email || '',
            display_name: result.user.displayName || '',
            photo_url: result.user.photoURL || '',
          }),
        });
      } catch (linkError) {
        console.warn('Failed to update linked account:', linkError);
        // Don't throw - account is still linked in Firebase
      }

      // Sync profile picture if available
      if (result.user.photoURL) {
        try {
          await syncProfilePicture();
        } catch (syncError) {
          console.warn('Profile picture sync failed:', syncError);
        }
      }
    } catch (error: any) {
      console.error('Link account error:', error);
      
      // Track failed linking
      try {
        await trackSocialLogin({
          user_id: user.uid,
          provider: providerType,
          action: 'link_account',
          success: false,
          error_code: error.code,
          error_message: error.message,
        });
      } catch (analyticsError) {
        // Ignore analytics errors
      }

      if (error.code === 'auth/provider-already-linked') {
        throw new Error('This account is already linked to your profile.');
      } else if (error.code === 'auth/credential-already-in-use') {
        throw new Error('This account is already linked to another user.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Account linking was cancelled.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups and try again.');
      }
      
      throw error;
    }
  };

  // Unlink account from user
  const unlinkAccount = async (providerType: 'google' | 'facebook' | 'apple') => {
    if (!user) {
      throw new Error('You must be logged in to unlink an account');
    }

    try {
      // Check if user has other providers
      const providers = user.providerData.map(p => p.providerId);
      const providerIdMap: Record<string, string> = {
        'google': 'google.com',
        'facebook': 'facebook.com',
        'apple': 'apple.com',
      };
      
      const targetProviderId = providerIdMap[providerType];
      if (!targetProviderId) {
        throw new Error('Invalid provider');
      }

      // Don't allow unlinking if it's the only provider
      const matchingProviders = providers.filter(p => p === targetProviderId);
      if (providers.length <= 1) {
        throw new Error('Cannot unlink your only sign-in method. Please add another method first.');
      }

      // Find the provider to unlink
      const providerToUnlink = user.providerData.find(p => p.providerId === targetProviderId);
      if (!providerToUnlink) {
        throw new Error('This account is not linked to your profile.');
      }

      await unlink(user, targetProviderId);
      
      // Track analytics
      try {
        await trackSocialLogin({
          user_id: user.uid,
          provider: providerType,
          action: 'unlink_account',
          success: true,
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }

      // Update backend
      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';
        
        await fetch(`${apiUrl}/api/auth/user/unlink`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: providerType,
          }),
        });
      } catch (unlinkError) {
        console.warn('Failed to update unlinked account:', unlinkError);
        // Don't throw - account is still unlinked in Firebase
      }
    } catch (error: any) {
      console.error('Unlink account error:', error);
      
      // Track failed unlinking
      try {
        await trackSocialLogin({
          user_id: user.uid,
          provider: providerType,
          action: 'unlink_account',
          success: false,
          error_code: error.code,
          error_message: error.message,
        });
      } catch (analyticsError) {
        // Ignore analytics errors
      }

      throw error;
    }
  };

  // Sync profile picture from social provider
  const syncProfilePicture = async () => {
    if (!user || !user.photoURL) {
      throw new Error('No profile picture available to sync');
    }

    try {
      // Update Firebase profile
      await updateProfile(user, {
        photoURL: user.photoURL,
      });

      // Update backend profile
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';
      
      const response = await fetch(`${apiUrl}/api/user/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photo_url: user.photoURL,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile picture');
      }
    } catch (error: any) {
      console.error('Profile picture sync error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
    sendVerificationEmail,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    linkAccount,
    unlinkAccount,
    syncProfilePicture,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

