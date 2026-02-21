import { db } from '../firebase/firebaseConfig'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  getDoc
} from 'firebase/firestore'

// Add new user (Admin only)
export const addUser = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Active'
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding user:', error)
    throw error
  }
}

// Update user
export const updateUser = async (userId, userData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Delete user
export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId))
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Get all users
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching users by role:', error)
    throw error
  }
}

// Get single user
export const getUser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}
