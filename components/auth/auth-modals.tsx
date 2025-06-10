"use client"

import type React from "react"

import { useState, useCallback, createContext, useContext } from "react"
import SignupModal from "./signup-modal"
import LoginModal from "./login-modal"

interface AuthModalsContextType {
  openSignup: () => void
  openLogin: () => void
  closeModals: () => void
}

const AuthModalsContext = createContext<AuthModalsContextType | null>(null)

export function AuthModalsProvider({ children }: { children: React.ReactNode }) {
  const [signupOpen, setSignupOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  const openSignup = useCallback(() => {
    setLoginOpen(false)
    setSignupOpen(true)
  }, [])

  const openLogin = useCallback(() => {
    setSignupOpen(false)
    setLoginOpen(true)
  }, [])

  const closeModals = useCallback(() => {
    setSignupOpen(false)
    setLoginOpen(false)
  }, [])

  const switchToLogin = useCallback(() => {
    setSignupOpen(false)
    setLoginOpen(true)
  }, [])

  const switchToSignup = useCallback(() => {
    setLoginOpen(false)
    setSignupOpen(true)
  }, [])

  return (
    <AuthModalsContext.Provider value={{ openSignup, openLogin, closeModals }}>
      {children}
      <SignupModal isOpen={signupOpen} onClose={closeModals} onSwitchToLogin={switchToLogin} />
      <LoginModal isOpen={loginOpen} onClose={closeModals} onSwitchToSignup={switchToSignup} />
    </AuthModalsContext.Provider>
  )
}

export function useAuthModals() {
  const context = useContext(AuthModalsContext)
  if (!context) {
    throw new Error("useAuthModals must be used within AuthModalsProvider")
  }
  return context
}

// For backward compatibility with the old hook pattern
export function AuthModals() {
  // This component is no longer needed since modals are rendered in the provider
  return null
}
