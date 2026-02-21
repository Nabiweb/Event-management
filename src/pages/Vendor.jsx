import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { logoutUser } from '../services/authService'
import { getVendorProducts, addProduct, updateProduct, deleteProduct } from '../services/productService'

export default function Vendor(){
  const navigate = useNavigate()
  const { user, userData } = useAuth()
  const [activeSection, setActiveSection] = useState('main')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  })
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const vendorProducts = await getVendorProducts(user.uid)
      setProducts(vendorProducts)
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0])
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.price) {
      setError('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      await addProduct(user.uid, formData, imageFile)
      setFormData({ name: '', price: '', description: '' })
      setImageFile(null)
      await fetchProducts()
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId, imageURL) => {
    if (window.confirm('Delete this product?')) {
      try {
        setLoading(true)
        await deleteProduct(productId, imageURL)
        await fetchProducts()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const renderContent = () => {
    switch(activeSection){
      case 'prodstatus':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Status</h3>
            {loading ? (
              <p>Loading...</p>
            ) : products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="border px-4 py-2 text-left">Product Name</th>
                      <th className="border px-4 py-2 text-left">Price</th>
                      <th className="border px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td className="border px-4 py-2">{p.name}</td>
                        <td className="border px-4 py-2">Rs. {p.price}</td>
                        <td className="border px-4 py-2"><span className="px-2 py-1 bg-green-100 text-green-700 rounded">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No products yet</p>
            )}
          </div>
        )

      case 'addnew':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-blue-600 rounded-lg p-6 text-white">
              <h4 className="font-semibold mb-4">Add New Product</h4>
              {error && <div className="mb-3 p-2 bg-red-500 rounded text-sm">{error}</div>}
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-200 text-gray-800 font-medium px-4 py-3 rounded" 
                  placeholder="Product Name" 
                  required
                />
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-gray-200 text-gray-800 font-medium px-4 py-3 rounded" 
                  placeholder="Product Price" 
                  required
                />
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-gray-200 text-gray-800 font-medium px-4 py-3 rounded" 
                  placeholder="Product Description"
                  rows="2"
                ></textarea>
                <input 
                  type="file" 
                  onChange={handleImageChange}
                  className="w-full bg-gray-200 text-gray-800 font-medium px-4 py-3 rounded" 
                  accept="image/*"
                />
                <div className="flex justify-center pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-white text-blue-600 font-medium rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add The Product'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Products List</h3>
              {products.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {products.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded border">
                      {product.imageURL && (
                        <img src={product.imageURL} alt={product.name} className="w-full h-20 object-cover rounded mb-2" />
                      )}
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-sm text-gray-600">Rs. {product.price}</p>
                      <button 
                        onClick={() => handleDeleteProduct(product.id, product.imageURL)}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No products added yet</p>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Vendor Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-6 bg-white border rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{products.length}</div>
                <div className="text-gray-600">Products Listed</div>
              </div>
              <div className="p-6 bg-white border rounded-lg">
                <div className="text-3xl font-bold text-green-600">Active</div>
                <div className="text-gray-600">Membership Status</div>
              </div>
              <div className="p-6 bg-white border rounded-lg">
                <div className="text-3xl font-bold text-orange-600">0</div>
                <div className="text-gray-600">Pending Requests</div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-blue-600 p-4">
      <div className="bg-blue-600 rounded-lg px-6 py-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-white text-lg font-semibold">Welcome '{userData?.name || 'Vendor'}'</h1>
        
        <div className="flex flex-wrap gap-3 justify-center md:justify-end">
          <button onClick={() => setActiveSection('prodstatus')} className="px-5 py-2 bg-white text-blue-600 font-medium rounded hover:bg-gray-100">Product Status</button>
          <button onClick={() => setActiveSection('addnew')} className="px-5 py-2 bg-white text-blue-600 font-medium rounded hover:bg-gray-100">View Products</button>
          <button onClick={handleLogout} className="px-5 py-2 bg-white text-blue-600 font-medium rounded hover:bg-gray-100">Log Out</button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg">
        {error && !activeSection.includes('addnew') && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        {renderContent()}
      </div>
    </div>
  )
}
