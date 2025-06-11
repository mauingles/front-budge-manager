import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDYOahhiKZOo6hBb-gzIDuehktCT9f-6oY",
  authDomain: "budget-manager-b052c.firebaseapp.com",
  projectId: "budget-manager-b052c",
  storageBucket: "budget-manager-b052c.firebasestorage.app",
  messagingSenderId: "429150209536",
  appId: "1:429150209536:web:ef419b50b469f3f7637ae5",
  measurementId: "G-KZ1CKVCM73"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar Auth
export const auth = getAuth(app)

// Inicializar Firestore
export const db = getFirestore(app)

// Configurar Google Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Configurar para desarrollo local
if (window.location.hostname === 'localhost') {
  googleProvider.setCustomParameters({
    ...googleProvider.customParameters,
    'hd': '' // Permite cualquier dominio
  })
}

export default app