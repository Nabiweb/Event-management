import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { logoutUser } from '../services/authService'

export default function Header(){
  const navigate = useNavigate()
  const { user, userData } = useAuth()

  const handleLogout = async () => {
    try {
      await logoutUser()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container flex items-center justify-between py-4 px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-white font-bold">E</div>
          <div>
            <div className="text-lg font-semibold">Event Management</div>
            <div className="text-sm text-gray-500">Admin · Vendor · User</div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user && userData ? (
            <>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-800">{userData.name || user.email}</p>
                <p className="text-xs text-gray-500">{userData.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <nav className="space-x-4 hidden md:block">
                <Link to="/vendor" className="text-gray-700 hover:text-teal-600">Vendor</Link>
                <Link to="/user" className="text-gray-700 hover:text-teal-600">User</Link>
              </nav>
              <Link to="/login" className="inline-flex items-center px-3 py-1.5 bg-teal-600 text-white rounded-md">Login</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
