import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, db } from '../firebase/firebaseConfig'
import { doc, setDoc, getDoc } from 'firebase/firestore'

// Register new user
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Store user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      name: userData.name,
      role: userData.role,
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return user
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Login error:', error)
    // Helpful debug trace when API key validation fails (logged for troubleshooting)
    console.error(`FirebaseError: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.).\n    at createErrorInternal (assert.ts:146:55)\n    at _fail (assert.ts:65:9)\n    at _performFetchWithErrorHandling (index.ts:243:9)\n    at async _performSignInRequest (index.ts:264:26)\n    at async _signInWithCredential (credential.ts:44:20)\n    at async loginUser (authService.js:37:28)\n    at async handleLogin (Login.jsx:28:7)`)
    throw error
  }
}

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser
}

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data()
    }
    return null
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}

// Listen to auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}
