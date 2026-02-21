import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../services/authService'

export default function Login(){
  const navigate = useNavigate()
  const [isRegistering, setIsRegistering] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'User'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await loginUser(formData.email, formData.password)
      navigate('/user')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await registerUser(formData.email, formData.password, {
        name: formData.name,
        role: formData.role
      })
      navigate(formData.role === 'Admin' ? '/admin' : formData.role === 'Vendor' ? '/vendor' : '/user')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{isRegistering ? 'Create Account' : 'Sign in'}</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm text-gray-600">Full Name</label>
              <input 
                required 
                name="name" 
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2" 
                placeholder="Enter your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input 
              required 
              name="email" 
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2" 
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Password</label>
            <input 
              required 
              name="password" 
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2" 
              placeholder="••••••••"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-sm text-gray-600">Role</label>
              <select 
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
              >
                <option value="User">User</option>
                <option value="Vendor">Vendor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign in')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering)
              setError('')
              setFormData({ email: '', password: '', name: '', role: 'User' })
            }}
            className="text-teal-600 hover:underline text-sm"
          >
            {isRegistering ? 'Already have account? Sign in' : "Don't have account? Register"}
          </button>
        </div>
      </div>
    </div>
  )
}
