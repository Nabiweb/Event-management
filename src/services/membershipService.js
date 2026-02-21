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

// Calculate expiry date based on duration
const calculateExpiryDate = (duration) => {
  const startDate = new Date()
  const expiryDate = new Date(startDate)

  if (duration === '6 months') {
    expiryDate.setMonth(expiryDate.getMonth() + 6)
  } else if (duration === '1 year') {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
  } else if (duration === '2 years') {
    expiryDate.setFullYear(expiryDate.getFullYear() + 2)
  }

  return expiryDate
}

// Add membership
export const addMembership = async (vendorId, duration) => {
  try {
    const expiryDate = calculateExpiryDate(duration)
    const docRef = await addDoc(collection(db, 'memberships'), {
      vendorId,
      duration,
      startDate: new Date(),
      expiryDate: expiryDate,
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding membership:', error)
    throw error
  }
}

// Update membership
export const updateMembership = async (membershipId, duration) => {
  try {
    const expiryDate = calculateExpiryDate(duration)
    await updateDoc(doc(db, 'memberships', membershipId), {
      duration,
      expiryDate: expiryDate,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating membership:', error)
    throw error
  }
}

// Delete membership
export const deleteMembership = async (membershipId) => {
  try {
    await deleteDoc(doc(db, 'memberships', membershipId))
  } catch (error) {
    console.error('Error deleting membership:', error)
    throw error
  }
}

// Get all memberships
export const getAllMemberships = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'memberships'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching memberships:', error)
    throw error
  }
}

// Get vendor membership
export const getVendorMembership = async (vendorId) => {
  try {
    const q = query(collection(db, 'memberships'), where('vendorId', '==', vendorId))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching vendor membership:', error)
    throw error
  }
}

// Check if membership is expired
export const isMembershipExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate)
}
