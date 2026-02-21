import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getUserCart } from '../services/cartService'
import { getProduct } from '../services/productService'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [cartProducts, setCartProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchCartItems()
    } else {
      setCartItems([])
      setCartProducts([])
    }
  }, [user])

  const fetchCartItems = async () => {
    try {
      setLoading(true)
      const items = await getUserCart(user.uid)
      setCartItems(items)

      // Fetch product details for each cart item
      const products = []
      for (const item of items) {
        const product = await getProduct(item.productId)
        if (product) {
          products.push({ ...product, cartItemId: item.id, quantity: item.quantity })
        }
      }
      setCartProducts(products)
    } catch (err) {
      console.error('Error fetching cart:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    return cartProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        cartProducts, 
        loading, 
        error, 
        fetchCartItems,
        calculateTotal 
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
