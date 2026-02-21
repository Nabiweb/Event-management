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

// Add new vendor (Admin only)
export const addVendor = async (vendorData) => {
  try {
    const docRef = await addDoc(collection(db, 'vendors'), {
      ...vendorData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Active',
      products: []
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding vendor:', error)
    throw error
  }
}

// Update vendor
export const updateVendor = async (vendorId, vendorData) => {
  try {
    await updateDoc(doc(db, 'vendors', vendorId), {
      ...vendorData,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating vendor:', error)
    throw error
  }
}

// Delete vendor
export const deleteVendor = async (vendorId) => {
  try {
    await deleteDoc(doc(db, 'vendors', vendorId))
  } catch (error) {
    console.error('Error deleting vendor:', error)
    throw error
  }
}

// Get all vendors
export const getAllVendors = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'vendors'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching vendors:', error)
    throw error
  }
}

// Get single vendor
export const getVendor = async (vendorId) => {
  try {
    const vendorDoc = await getDoc(doc(db, 'vendors', vendorId))
    if (vendorDoc.exists()) {
      return { id: vendorDoc.id, ...vendorDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching vendor:', error)
    throw error
  }
}

// Get active vendors
export const getActiveVendors = async () => {
  try {
    const q = query(collection(db, 'vendors'), where('status', '==', 'Active'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching active vendors:', error)
    throw error
  }
}
