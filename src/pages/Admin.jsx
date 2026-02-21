import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { logoutUser } from '../services/authService'
import { getAllUsers, addUser, updateUser, deleteUser } from '../services/userService'
import { getAllVendors, addVendor, updateVendor, deleteVendor } from '../services/vendorService'
import { addMembership, updateMembership, deleteMembership, getVendorMembership } from '../services/membershipService'

export default function Admin(){
  const navigate = useNavigate()
  const { user, userData } = useAuth()
  const [activeSection, setActiveSection] = useState('main')
  const [users, setUsers] = useState([])
  const [vendors, setVendors] = useState([])
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form states
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'User', password: '' })
  const [newVendorForm, setNewVendorForm] = useState({ name: '', contact: '', phone: '', category: '' })
  const [membershipForm, setMembershipForm] = useState({ vendorId: '', duration: '', startDate: '' })

  useEffect(() => {
    if (user) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [usersData, vendorsData] = await Promise.all([
        getAllUsers(),
        getAllVendors()
      ])
      setUsers(usersData)
      setVendors(vendorsData)
      
      // Fetch memberships for all vendors
      const membershipsList = []
      for (const vendor of vendorsData) {
        try {
          const membership = await getVendorMembership(vendor.id)
          if (membership) {
            membershipsList.push({ ...membership, vendorId: vendor.id, vendorName: vendor.name })
          }
        } catch (err) {
          console.error(`Error fetching membership for vendor ${vendor.id}:`, err)
        }
      }
      setMemberships(membershipsList)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      navigate('/login')
    } catch (error) {
      setError(error.message)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    if (!newUserForm.name || !newUserForm.email) {
      setError('Please fill required fields')
      return
    }
    try {
      setLoading(true)
      // Note: Firebase doesn't allow admin to set passwords directly.
      // Users should register themselves or be invited via email
      await addUser(newUserForm.email, {
        name: newUserForm.name,
        role: newUserForm.role,
        status: 'Active'
      })
      setNewUserForm({ name: '', email: '', role: 'User', password: '' })
      await fetchAllData()
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVendor = async (e) => {
    e.preventDefault()
    if (!newVendorForm.name || !newVendorForm.contact) {
      setError('Please fill required fields')
      return
    }
    try {
      setLoading(true)
      await addVendor({
        name: newVendorForm.name,
        contactEmail: newVendorForm.contact,
        phone: newVendorForm.phone,
        category: newVendorForm.category,
        status: 'Active'
      })
      setNewVendorForm({ name: '', contact: '', phone: '', category: '' })
      await fetchAllData()
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true)
        await deleteUser(userId)
        await fetchAllData()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDeleteVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        setLoading(true)
        await deleteVendor(vendorId)
        await fetchAllData()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAddMembership = async (e) => {
    e.preventDefault()
    if (!membershipForm.vendorId || !membershipForm.duration) {
      setError('Please select vendor and duration')
      return
    }
    try {
      setLoading(true)
      await addMembership(membershipForm.vendorId, {
        duration: membershipForm.duration,
        startDate: membershipForm.startDate || new Date().toISOString(),
        status: 'Active'
      })
      setMembershipForm({ vendorId: '', duration: '', startDate: '' })
      await fetchAllData()
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    switch(activeSection){
      case 'addmembership':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Add/Update Memberships</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Membership Form</h4>
                {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
                <form className="space-y-4" onSubmit={handleAddMembership}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vendor Name *</label>
                    <select 
                      value={membershipForm.vendorId}
                      onChange={(e) => setMembershipForm({...membershipForm, vendorId: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Membership Duration *</label>
                    <select 
                      value={membershipForm.duration}
                      onChange={(e) => setMembershipForm({...membershipForm, duration: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">Select Duration</option>
                      <option value="6 months">6 months</option>
                      <option value="1 year">1 year</option>
                      <option value="2 years">2 years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={membershipForm.startDate}
                      onChange={(e) => setMembershipForm({...membershipForm, startDate: e.target.value})}
                      className="w-full border rounded px-3 py-2" 
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Saving...' : 'Save Membership'}
                  </button>
                </form>
              </div>

              {/* List */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Current Memberships ({memberships.length})</h4>
                {loading ? (
                  <p>Loading memberships...</p>
                ) : memberships.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {memberships.map(m => (
                      <div key={m.id} className="border rounded-lg p-4">
                        <p className="font-medium">{m.vendorName}</p>
                        <p className="text-sm text-gray-600">Duration: {m.duration}</p>
                        <p className="text-sm text-gray-600">Expires: {m.expiryDate}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {m.status}
                          </span>
                          <button 
                            onClick={() => {
                              if (window.confirm('Delete this membership?')) {
                                deleteMembership(m.id).then(() => fetchAllData()).catch(err => setError(err.message))
                              }
                            }}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No memberships added yet</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'adduser':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Add/Update User & Vendor</h3>
            {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add User Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Add New User</h4>
                <form className="space-y-4" onSubmit={handleAddUser}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                      className="w-full border rounded px-3 py-2" 
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input 
                      type="email" 
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                      className="w-full border rounded px-3 py-2" 
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select 
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option>User</option>
                      <option>Vendor</option>
                    </select>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Adding...' : 'Add User'}
                  </button>
                </form>
              </div>

              {/* Add Vendor Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Add New Vendor</h4>
                <form className="space-y-4" onSubmit={handleAddVendor}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vendor Name *</label>
                    <input 
                      type="text" 
                      value={newVendorForm.name}
                      onChange={(e) => setNewVendorForm({...newVendorForm, name: e.target.value})}
                      className="w-full border rounded px-3 py-2" 
                      placeholder="Enter vendor name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email *</label>
                    <input 
                      type="email" 
                      value={newVendorForm.contact}
                      onChange={(e) => setNewVendorForm({...newVendorForm, contact: e.target.value})}
                      className="w-full border rounded px-3 py-2" 
                      placeholder="vendor@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Phone</label>
                    <input 
                      type="tel" 
                      value={newVendorForm.phone}
                      onChange={(e) => setNewVendorForm({...newVendorForm, phone: e.target.value})}
                      className="w-full border rounded px-3 py-2" 
                      placeholder="+92 300 1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Business Category</label>
                    <input 
                      type="text" 
                      value={newVendorForm.category}
                      onChange={(e) => setNewVendorForm({...newVendorForm, category: e.target.value})}
                      className="w-full border rounded px-3 py-2" 
                      placeholder="e.g., Electronics"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Adding...' : 'Add Vendor'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )

      case 'usermanagement':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Users Management ({users.length})</h3>
            {loading ? (
              <p>Loading users...</p>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="border px-4 py-2 text-left">Name</th>
                      <th className="border px-4 py-2 text-left">Email</th>
                      <th className="border px-4 py-2 text-left">Role</th>
                      <th className="border px-4 py-2 text-left">Status</th>
                      <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="border px-4 py-2">{user.name}</td>
                        <td className="border px-4 py-2">{user.email}</td>
                        <td className="border px-4 py-2"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{user.role}</span></td>
                        <td className="border px-4 py-2">
                          <span className={`px-2 py-1 rounded text-sm ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="border px-4 py-2">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No users found</p>
            )}
          </div>
        )

      case 'vendormanagement':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Vendor Management ({vendors.length})</h3>
            {loading ? (
              <p>Loading vendors...</p>
            ) : vendors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="border px-4 py-2 text-left">Vendor Name</th>
                      <th className="border px-4 py-2 text-left">Contact</th>
                      <th className="border px-4 py-2 text-left">Category</th>
                      <th className="border px-4 py-2 text-left">Status</th>
                      <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map(vendor => (
                      <tr key={vendor.id}>
                        <td className="border px-4 py-2">{vendor.name}</td>
                        <td className="border px-4 py-2">{vendor.contactEmail}</td>
                        <td className="border px-4 py-2">{vendor.category}</td>
                        <td className="border px-4 py-2">
                          <span className={`px-2 py-1 rounded text-sm ${vendor.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="border px-4 py-2">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleDeleteVendor(vendor.id)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                            <button 
                              onClick={() => setActiveSection('addmembership')}
                              className="text-sm text-purple-600 hover:underline"
                            >
                              Membership
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No vendors found</p>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Maintenance Menu</h2>
            <p className="text-gray-600">(Admin access only)</p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <button 
                onClick={() => setActiveSection('addmembership')}
                className="p-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition text-left"
              >
                <div className="text-lg font-semibold text-blue-600 mb-2">Add/Update Memberships</div>
                <p className="text-sm text-gray-600">Manage vendor membership duration and expiry</p>
              </button>

              <button 
                onClick={() => setActiveSection('adduser')}
                className="p-6 border-2 border-green-600 rounded-lg hover:bg-green-50 transition text-left"
              >
                <div className="text-lg font-semibold text-green-600 mb-2">Add/Update User, Vendor</div>
                <p className="text-sm text-gray-600">Create new users and vendors in the system</p>
              </button>

              <button 
                onClick={() => setActiveSection('usermanagement')}
                className="p-6 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition text-left"
              >
                <div className="text-lg font-semibold text-purple-600 mb-2">Users Management</div>
                <p className="text-sm text-gray-600">View, edit, and manage all users</p>
              </button>

              <button 
                onClick={() => setActiveSection('vendormanagement')}
                className="p-6 border-2 border-orange-600 rounded-lg hover:bg-orange-50 transition text-left"
              >
                <div className="text-lg font-semibold text-orange-600 mb-2">Vendor Management</div>
                <p className="text-sm text-gray-600">View, edit, and manage all vendors</p>
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ADMIN</h1>
          <p className="text-slate-300">Administrative Control Panel</p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg p-6 shadow">
        {renderContent()}
      </div>

      {/* Back Button */}
      {activeSection !== 'main' && (
        <button 
          onClick={() => setActiveSection('main')}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Menu
        </button>
      )}
    </div>
  )
}
