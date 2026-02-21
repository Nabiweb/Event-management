import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDKCdayk2fXvJ_Tn9RhTzMbJw-jibUQ9GM",
  authDomain: "event-management-8682b.firebaseapp.com",
  databaseURL: "https://event-management-8682b-default-rtdb.firebaseio.com",
  projectId: "event-management-8682b",
  storageBucket: "event-management-8682b.firebasestorage.app",
  messagingSenderId: "390238029822",
  appId: "1:390238029822:web:31226288fbd0abd7dc22af",
  measurementId: "G-YFERS2VWV6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
