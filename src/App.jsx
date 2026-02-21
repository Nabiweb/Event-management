import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Vendor from './pages/Vendor'
import User from './pages/User'
import MembershipForm from './pages/MembershipForm'
import Header from './components/Header'
import Footer from './components/Footer'

function ProtectedRoute({ children, requiredRole }) {
  const { user, userData, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userData?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="Admin">
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendor" 
            element={
              <ProtectedRoute requiredRole="Vendor">
                <Vendor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user" 
            element={
              <ProtectedRoute requiredRole="User">
                <User />
              </ProtectedRoute>
            } 
          />
          <Route path="/membership" element={<MembershipForm />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App(){
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}
