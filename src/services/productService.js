import { db, storage } from '../firebase/firebaseConfig'
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

// Add product (Vendor)
export const addProduct = async (vendorId, productData, imageFile) => {
  try {
    let imageURL = ''

    // Upload image if provided
    if (imageFile) {
      const storageRef = ref(storage, `products/${vendorId}/${imageFile.name}-${Date.now()}`)
      await uploadBytes(storageRef, imageFile)
      imageURL = await getDownloadURL(storageRef)
    }

    const docRef = await addDoc(collection(db, 'products'), {
      vendorId,
      name: productData.name,
      price: parseFloat(productData.price),
      description: productData.description || '',
      imageURL: imageURL,
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return docRef.id
  } catch (error) {
    console.error('Error adding product:', error)
    throw error
  }
}

// Update product
export const updateProduct = async (productId, productData, imageFile, oldImageURL) => {
  try {
    let imageURL = oldImageURL

    // Upload new image if provided
    if (imageFile) {
      // Delete old image
      if (oldImageURL) {
        try {
          const oldRef = ref(storage, oldImageURL)
          await deleteObject(oldRef)
        } catch (e) {
          console.warn('Could not delete old image')
        }
      }

      const storageRef = ref(storage, `products/${productData.vendorId}/${imageFile.name}-${Date.now()}`)
      await uploadBytes(storageRef, imageFile)
      imageURL = await getDownloadURL(storageRef)
    }

    await updateDoc(doc(db, 'products', productId), {
      name: productData.name,
      price: parseFloat(productData.price),
      description: productData.description || '',
      imageURL: imageURL,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

// Delete product
export const deleteProduct = async (productId, imageURL) => {
  try {
    // Delete image from storage
    if (imageURL) {
      try {
        const storageRef = ref(storage, imageURL)
        await deleteObject(storageRef)
      } catch (e) {
        console.warn('Could not delete image')
      }
    }

    await deleteDoc(doc(db, 'products', productId))
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

// Get all products
export const getAllProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

// Get vendor products
export const getVendorProducts = async (vendorId) => {
  try {
    const q = query(collection(db, 'products'), where('vendorId', '==', vendorId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching vendor products:', error)
    throw error
  }
}

// Get single product
export const getProduct = async (productId) => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId))
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

// Search products
export const searchProducts = async (searchTerm) => {
  try {
    const allProducts = await getAllProducts()
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  } catch (error) {
    console.error('Error searching products:', error)
    throw error
  }
}
