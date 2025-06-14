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

// Información de debug
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hostname: window.location.hostname,
    url: window.location.href
  })
  
  if (window.location.hostname === 'localhost') {
    googleProvider.setCustomParameters({
      ...googleProvider.customParameters,
      'hd': '' // Permite cualquier dominio
    })
    
    console.log('🔧 Modo desarrollo detectado')
  } else {
    console.log('🌍 Modo producción detectado')
  }
}

export default app