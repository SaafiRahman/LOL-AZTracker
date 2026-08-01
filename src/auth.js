import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider, firebaseEnabled } from './firebase.js'

// Tracks the signed-in user and exposes Google sign-in / sign-out.
// When Firebase isn't configured, `ready` is immediately true with no user, so
// the app runs in local-only mode.
export function useAuth() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!firebaseEnabled)

  useEffect(() => {
    if (!firebaseEnabled) return undefined
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setReady(true)
    })
  }, [])

  async function login() {
    if (!firebaseEnabled) return
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      // Popup closed/blocked — not fatal, just log it.
      console.error('Sign-in failed:', err)
    }
  }

  async function logout() {
    if (!firebaseEnabled) return
    await signOut(auth)
  }

  return { user, ready, login, logout, firebaseEnabled }
}
