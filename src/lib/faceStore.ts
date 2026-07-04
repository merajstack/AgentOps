// IndexedDB utility for face verification
// Stores a true 128-dimensional face descriptor vector (Float32Array) keyed by email.
// The face data never leaves the user's local device.

const DB_NAME = 'agentops_face_db'
const DB_VERSION = 2  // bumped version to trigger schema upgrade
const STORE_NAME = 'face_vectors'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = request.result
      // Remove old store if it exists (from version 1 that stored images)
      if (db.objectStoreNames.contains('face_data')) {
        db.deleteObjectStore('face_data')
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'email' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Saves a 128-dim face descriptor vector for a given email.
 * @param email - user email (key)
 * @param descriptor - Float32Array from face-api.js face recognition model
 */
export async function saveFaceDescriptor(email: string, descriptor: Float32Array): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    // Store as a plain Array since IndexedDB handles typed arrays but plain Array is safer cross-browser
    store.put({
      email: email.toLowerCase().trim(),
      descriptor: Array.from(descriptor),
      createdAt: Date.now(),
    })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Retrieves the stored face descriptor as Float32Array, or null if not found.
 */
export async function getFaceDescriptor(email: string): Promise<Float32Array | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(email.toLowerCase().trim())
    request.onsuccess = () => {
      const result = request.result
      if (result && result.descriptor) {
        resolve(new Float32Array(result.descriptor))
      } else {
        resolve(null)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Deletes the stored face descriptor for a given email.
 */
export async function deleteFaceData(email: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(email.toLowerCase().trim())
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Returns true if a face descriptor exists for this email.
 */
export async function hasFaceData(email: string): Promise<boolean> {
  const descriptor = await getFaceDescriptor(email)
  return descriptor !== null
}

/**
 * Computes Euclidean distance between two face descriptors.
 * Standard threshold for face-api.js is 0.6 — lower means more similar.
 */
export function euclideanDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i]
    sum += diff * diff
  }
  return Math.sqrt(sum)
}

// Legacy exports for backward compatibility
export async function saveFaceData(email: string, _imageDataUrl: string): Promise<void> {
  // no-op, use saveFaceDescriptor instead
}
export async function getFaceData(email: string): Promise<string | null> {
  const d = await getFaceDescriptor(email)
  return d ? 'exists' : null
}
