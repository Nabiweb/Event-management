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

// Add guest
export const addGuest = async (userId, guestData) => {
  try {
    const docRef = await addDoc(collection(db, 'guests'), {
      userId,
      name: guestData.name,
      email: guestData.email,
      phone: guestData.phone || '',
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return docRef.id
  } catch (error) {
    console.error('Error adding guest:', error)
    throw error
  }
}

// Update guest
export const updateGuest = async (guestId, guestData) => {
  try {
    await updateDoc(doc(db, 'guests', guestId), {
      ...guestData,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating guest:', error)
    throw error
  }
}

// Delete guest
export const deleteGuest = async (guestId) => {
  try {
    await deleteDoc(doc(db, 'guests', guestId))
  } catch (error) {
    console.error('Error deleting guest:', error)
    throw error
  }
}

// Get user guests
export const getUserGuests = async (userId) => {
  try {
    const q = query(collection(db, 'guests'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching user guests:', error)
    throw error
  }
}

// Get single guest
export const getGuest = async (guestId) => {
  try {
    const guestDoc = await getDoc(doc(db, 'guests', guestId))
    if (guestDoc.exists()) {
      return { id: guestDoc.id, ...guestDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching guest:', error)
    throw error
  }
}

// Update guest status
export const updateGuestStatus = async (guestId, status) => {
  try {
    await updateDoc(doc(db, 'guests', guestId), {
      status,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating guest status:', error)
    throw error
  }
}

// Delete all user guests
export const deleteAllUserGuests = async (userId) => {
  try {
    const guests = await getUserGuests(userId)
    for (const guest of guests) {
      await deleteGuest(guest.id)
    }
  } catch (error) {
    console.error('Error deleting all user guests:', error)
    throw error
  }
}
