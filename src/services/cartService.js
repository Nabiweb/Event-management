import { db } from '../firebase/firebaseConfig'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where
} from 'firebase/firestore'

// Add item to cart
export const addToCart = async (userId, productId, quantity) => {
  try {
    // Check if item already exists in cart
    const q = query(
      collection(db, 'carts'),
      where('userId', '==', userId),
      where('productId', '==', productId)
    )
    const querySnapshot = await getDocs(q)

    if (querySnapshot.docs.length > 0) {
      // Update quantity if item exists
      const cartItemId = querySnapshot.docs[0].id
      const currentQuantity = querySnapshot.docs[0].data().quantity
      await updateDoc(doc(db, 'carts', cartItemId), {
        quantity: currentQuantity + quantity,
        updatedAt: new Date()
      })
      return cartItemId
    } else {
      // Add new cart item
      const docRef = await addDoc(collection(db, 'carts'), {
        userId,
        productId,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return docRef.id
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    throw error
  }
}

// Update cart item quantity
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    await updateDoc(doc(db, 'carts', cartItemId), {
      quantity,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    throw error
  }
}

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
  try {
    await deleteDoc(doc(db, 'carts', cartItemId))
  } catch (error) {
    console.error('Error removing from cart:', error)
    throw error
  }
}

// Get user cart
export const getUserCart = async (userId) => {
  try {
    const q = query(collection(db, 'carts'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching user cart:', error)
    throw error
  }
}

// Clear cart
export const clearCart = async (userId) => {
  try {
    const cartItems = await getUserCart(userId)
    for (const item of cartItems) {
      await deleteDoc(doc(db, 'carts', item.id))
    }
  } catch (error) {
    console.error('Error clearing cart:', error)
    throw error
  }
}

// Get cart item
export const getCartItem = async (cartItemId) => {
  try {
    const cartDoc = await getDoc(doc(db, 'carts', cartItemId))
    if (cartDoc.exists()) {
      return { id: cartDoc.id, ...cartDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching cart item:', error)
    throw error
  }
}
