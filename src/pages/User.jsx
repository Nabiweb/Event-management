import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { logoutUser } from '../services/authService'
import { getAllProducts } from '../services/productService'
import { getUserCart, addToCart, removeFromCart, clearCart } from '../services/cartService'
import { getUserOrders, createOrder } from '../services/orderService'
import { getUserGuests, addGuest, deleteGuest, deleteAllUserGuests } from '../services/guestService'

export default function User(){
  const navigate = useNavigate()
  const { user, userData } = useAuth()
  const [activeSection, setActiveSection] = useState('main')
  const [allProducts, setAllProducts] = useState([])
  const [cart, setCart] = useState([])
  const [cartProducts, setCartProducts] = useState([])
  const [guests, setGuests] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [guestForm, setGuestForm] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    if (user) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [productsData, cartData, guestsData, ordersData] = await Promise.all([
        getAllProducts(),
        getUserCart(user.uid),
        getUserGuests(user.uid),
        getUserOrders(user.uid)
      ])
      setAllProducts(productsData)
      setCart(cartData)
      
      // Enhance cart items with product details
      const enhancedCart = cartData.map(cartItem => {
        const product = productsData.find(p => p.id === cartItem.productId)
        return {
          ...cartItem,
          name: product?.name || 'Unknown Product',
          price: product?.price || 0
        }
      })
      setCartProducts(enhancedCart)
      
      setGuests(guestsData)
      setOrders(ordersData)
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

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(user.uid, productId, 1)
      await fetchAllData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId)
      await fetchAllData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddGuest = async (e) => {
    e.preventDefault()
    if (!guestForm.name || !guestForm.email) {
      setError('Please fill required fields')
      return
    }
    try {
      await addGuest(user.uid, guestForm)
      setGuestForm({ name: '', email: '', phone: '' })
      await fetchAllData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty')
      return
    }
    try {
      setLoading(true)
      const cartWithPrices = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: allProducts.find(p => p.id === item.productId)?.price || 0
      }))
      const totalAmount = cartWithPrices.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      await createOrder(user.uid, cartWithPrices, totalAmount, {
        cardNumber: '****',
        date: new Date().toISOString()
      })
      
      await clearCart(user.uid)
      await fetchAllData()
      setActiveSection('orderstatus')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    switch(activeSection){
      case 'vendor':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vendor Catalog</h3>
            {loading ? (
              <p>Loading products...</p>
            ) : allProducts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {allProducts.map(product => (
                  <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                    {product.imageURL ? (
                      <img src={product.imageURL} alt={product.name} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="bg-gray-300 h-40 flex items-center justify-center">
                        <span className="text-gray-600">Product Image</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-600">Rs. {product.price}</p>
                      <button 
                        onClick={() => handleAddToCart(product.id)}
                        className="mt-3 w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No products available</p>
            )}
          </div>
        )

      case 'cart':
        const cartTotal = cartProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Shopping Cart</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                {loading ? (
                  <p>Loading cart...</p>
                ) : cartProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="border px-4 py-2 text-left">Product</th>
                          <th className="border px-4 py-2 text-left">Price</th>
                          <th className="border px-4 py-2 text-left">Quantity</th>
                          <th className="border px-4 py-2 text-left">Total</th>
                          <th className="border px-4 py-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartProducts.map(item => (
                          <tr key={item.id}>
                            <td className="border px-4 py-2">{item.name}</td>
                            <td className="border px-4 py-2">Rs. {item.price}</td>
                            <td className="border px-4 py-2">{item.quantity}</td>
                            <td className="border px-4 py-2">Rs. {item.price * item.quantity}</td>
                            <td className="border px-4 py-2">
                              <button 
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">Your cart is empty</p>
                )}
              </div>

              {/* Cart Actions */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded p-4">
                  <p className="text-lg font-bold text-blue-600">Total: Rs. {cartTotal}</p>
                </div>
                <button 
                  onClick={() => setActiveSection('payment')}
                  disabled={cartProducts.length === 0}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  Checkout
                </button>
                <button 
                  onClick={() => setActiveSection('vendor')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Continue Shopping
                </button>
                <button 
                  onClick={() => setActiveSection('main')}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )

      case 'payment':
        const totalAmount = cartProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Payment</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Order Summary</h4>
                <div className="space-y-3">
                  {cartProducts.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span>Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">Rs. {totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Payment Details</h4>
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault()
                  handleCheckout()
                }}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cardholder Name</label>
                    <input type="text" className="w-full border rounded px-3 py-2" placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Number</label>
                    <input type="text" className="w-full border rounded px-3 py-2" placeholder="1234 5678 9012 3456" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiry</label>
                      <input type="text" className="w-full border rounded px-3 py-2" placeholder="MM/YY" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CVV</label>
                      <input type="text" className="w-full border rounded px-3 py-2" placeholder="123" required />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Processing...' : 'Complete Payment'}
                  </button>
                </form>
                <button 
                  onClick={() => setActiveSection('cart')}
                  className="w-full mt-3 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        )

      case 'guestlist':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Guest List Management</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Guest List */}
              <div>
                <h4 className="font-semibold mb-4">Invited Guests ({guests.length})</h4>
                {loading ? (
                  <p>Loading guests...</p>
                ) : guests.length > 0 ? (
                  <div className="space-y-3">
                    {guests.map(guest => (
                      <div key={guest.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{guest.name}</p>
                          <p className="text-sm text-gray-600">{guest.email}</p>
                          {guest.phone && <p className="text-sm text-gray-600">{guest.phone}</p>}
                        </div>
                        <button 
                          onClick={() => {
                            deleteGuest(guest.id).then(() => fetchAllData()).catch(err => setError(err.message))
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No guests added yet</p>
                )}
              </div>

              {/* Add Guest Form */}
              <div>
                <h4 className="font-semibold mb-4">Add New Guest</h4>
                <form className="space-y-4" onSubmit={handleAddGuest}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Guest Name *</label>
                    <input 
                      type="text" 
                      className="w-full border rounded px-3 py-2" 
                      placeholder="Enter name"
                      value={guestForm.name}
                      onChange={(e) => setGuestForm({...guestForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input 
                      type="email" 
                      className="w-full border rounded px-3 py-2" 
                      placeholder="guest@example.com"
                      value={guestForm.email}
                      onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input 
                      type="tel" 
                      className="w-full border rounded px-3 py-2" 
                      placeholder="+92 300 1234567"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Adding...' : 'Add Guest'}
                  </button>
                </form>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end border-t pt-4">
              <button 
                onClick={() => setActiveSection('main')}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all guests?')) {
                    deleteAllUserGuests(user.uid).then(() => fetchAllData()).catch(err => setError(err.message))
                  }
                }}
                disabled={guests.length === 0}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                Delete All Guests
              </button>
            </div>
          </div>
        )

      case 'orderstatus':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Order Status</h3>
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border rounded-lg p-5 flex justify-between items-center hover:shadow transition">
                    <div>
                      <p className="font-semibold">Order ID: {order.id}</p>
                      <p className="text-sm text-gray-600">Date: {new Date(order.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Items: {order.items?.length || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">Rs. {order.totalAmount}</p>
                      <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-700' 
                          : order.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No orders found</p>
            )}

            <div className="flex gap-3 justify-end border-t pt-4">
              <button 
                onClick={() => setActiveSection('main')}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back to Dashboard
              </button>
              <button 
                onClick={() => fetchAllData()}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Welcome to User Dashboard</h2>
            <p className="text-gray-600">Shop from vendors, manage your cart, guest list, and track your orders.</p>
            <div className="grid gap-4 md:grid-cols-4">
              <button onClick={() => setActiveSection('vendor')} className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition">
                <div className="text-2xl font-bold">📦</div>
                <div className="font-semibold mt-2">Vendor</div>
                <p className="text-sm">Browse products</p>
              </button>
              <button onClick={() => setActiveSection('cart')} className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition">
                <div className="text-2xl font-bold">🛒</div>
                <div className="font-semibold mt-2">Cart</div>
                <p className="text-sm">{cart.length} items</p>
              </button>
              <button onClick={() => setActiveSection('guestlist')} className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition">
                <div className="text-2xl font-bold">👥</div>
                <div className="font-semibold mt-2">Guest List</div>
                <p className="text-sm">{guests.length} guests</p>
              </button>
              <button onClick={() => setActiveSection('orderstatus')} className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition">
                <div className="text-2xl font-bold">📋</div>
                <div className="font-semibold mt-2">Orders</div>
                <p className="text-sm">{orders.length} orders</p>
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
        <p className="text-blue-100">Manage shopping, guests, and orders</p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg p-6 shadow">
        {renderContent()}
      </div>
    </div>
  )
}
