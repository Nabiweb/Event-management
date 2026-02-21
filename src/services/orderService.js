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

// Create order
export const createOrder = async (userId, cartItems, totalAmount, paymentDetails) => {
  try {
    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }))

    const docRef = await addDoc(collection(db, 'orders'), {
      userId,
      items: orderItems,
      totalAmount,
      paymentDetails,
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return docRef.id
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

// Cancel order
export const cancelOrder = async (orderId) => {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'Cancelled',
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error cancelling order:', error)
    throw error
  }
}

// Get user orders
export const getUserOrders = async (userId) => {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching user orders:', error)
    throw error
  }
}

// Get all orders (Admin)
export const getAllOrders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

// Get single order
export const getOrder = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId))
    if (orderDoc.exists()) {
      return { id: orderDoc.id, ...orderDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

// Get vendor orders
export const getVendorOrders = async (vendorId) => {
  try {
    // This would need to be implemented with proper vendor-product relationship
    const q = query(collection(db, 'orders'), where('vendorId', '==', vendorId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching vendor orders:', error)
    throw error
  }
}
