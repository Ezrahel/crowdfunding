"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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
  UserCredential,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { trackSocialLogin } from '@/lib/analytics'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<UserCredential>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  sendVerificationEmail: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  syncProfilePicture: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function detectProvider(user: User): 'google' | 'email' {
  if (user.providerData.some((provider) => provider.providerId === 'google.com')) {
    return 'google'
  }
  return 'email'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const syncUserRecord = async (currentUser: User, provider?: 'google' | 'email') => {
    const resolvedProvider = provider ?? detectProvider(currentUser)
    const token = await currentUser.getIdToken()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090'

    const response = await fetch(`${apiUrl}/api/auth/user`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: currentUser.uid,
        email: currentUser.email || '',
        display_name: currentUser.displayName || '',
        photo_url: currentUser.photoURL || '',
        provider: resolvedProvider,
      }),
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)

      if (!nextUser) {
        return
      }

      void syncUserRecord(nextUser).catch((error) => {
        console.warn('Failed to sync authenticated user profile:', error)
      })
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      await syncUserRecord(credential.user, 'email')
      await trackSocialLogin({
        user_id: credential.user.uid,
        provider: 'email',
        action: 'sign_in',
        success: true,
      })
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      if (displayName && userCredential.user) {
        try {
          await updateProfile(userCredential.user, { displayName })
        } catch (error) {
          console.error('Error updating profile:', error)
        }
      }

      if (userCredential.user) {
        try {
          await sendEmailVerification(userCredential.user)
        } catch (error) {
          console.error('Error sending verification email:', error)
        }

        await syncUserRecord(userCredential.user, 'email')

        try {
          await trackSocialLogin({
            user_id: userCredential.user.uid,
            provider: 'email',
            action: 'sign_up',
            success: true,
          })
        } catch (analyticsError) {
          console.warn('Analytics tracking failed:', analyticsError)
        }
      }

      return userCredential
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error: any) {
      console.error('Logout error:', error)
      router.push('/')
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  const sendVerificationEmail = async () => {
    if (!user) {
      return
    }
    try {
      await sendEmailVerification(user)
    } catch (error: any) {
      console.error('Send verification email error:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('profile')
      provider.addScope('email')
      provider.setCustomParameters({ prompt: 'select_account' })

      const result = await signInWithPopup(auth, provider)
      await syncUserRecord(result.user, 'google')

      try {
        await trackSocialLogin({
          user_id: result.user.uid,
          provider: 'google',
          action: result.user.metadata.creationTime === result.user.metadata.lastSignInTime ? 'sign_up' : 'sign_in',
          success: true,
        })
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError)
      }

      if (result.user.photoURL) {
        try {
          await syncProfilePicture(result.user)
        } catch (syncError) {
          console.warn('Profile picture sync failed:', syncError)
        }
      }

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Google sign in error:', error)

      try {
        await trackSocialLogin({
          user_id: 'unknown',
          provider: 'google',
          action: 'sign_in',
          success: false,
          error_code: error.code,
          error_message: error.message,
        })
      } catch {
        // Ignore analytics errors
      }

      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.')
      }
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups for this site and try again.')
      }
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with this email using a different sign-in method.')
      }
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.')
      }

      throw error
    }
  }

  const syncProfilePicture = async (targetUser?: User) => {
    const activeUser = targetUser ?? user
    if (!activeUser || !activeUser.photoURL) {
      throw new Error('No profile picture available to sync')
    }

    try {
      await updateProfile(activeUser, { photoURL: activeUser.photoURL })

      const token = await activeUser.getIdToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090'
      const response = await fetch(`${apiUrl}/api/user/profile/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photo_url: activeUser.photoURL }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile picture')
      }
    } catch (error: any) {
      console.error('Profile picture sync error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
    sendVerificationEmail,
    signInWithGoogle,
    syncProfilePicture,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
