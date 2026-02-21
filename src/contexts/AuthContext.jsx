import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthChange, getCurrentUser, getUserData } from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      try {
        if (authUser) {
          setUser(authUser)
          const data = await getUserData(authUser.uid)
          setUserData(data)
        } else {
          setUser(null)
          setUserData(null)
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userData, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
