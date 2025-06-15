import { ref, onMounted } from 'vue'
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth'
import { auth, googleProvider } from '@/firebase.js'

export function useAuth() {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const loginWithGoogle = async () => {
    try {
      error.value = null
      loading.value = true
      
      // Intentar popup primero
      try {
        const result = await signInWithPopup(auth, googleProvider)
        console.log('Login exitoso con popup:', result.user)
        // No establecer user.value aquí - dejar que onAuthStateChanged lo maneje
        // Dar un pequeño tiempo para que onAuthStateChanged se ejecute
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (popupError) {
        console.log('Error con popup, intentando redirect...', popupError.message)
        
        // Si popup falla, usar redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          await signInWithRedirect(auth, googleProvider)
          return // El redirect manejará el resultado y onAuthStateChanged el usuario
        } else {
          throw popupError
        }
      }
      
      // No poner loading = false aquí - dejar que onAuthStateChanged lo maneje
      
    } catch (err) {
      let errorMessage = 'Error en login con Google'
      
      if (err.code === 'auth/configuration-not-found') {
        errorMessage = 'Google Sign-In no está configurado. Ve a Firebase Console → Authentication → Sign-in method y habilita Google.'
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqueado por el navegador. Permite popups para este sitio.'
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Popup cerrado. Intenta de nuevo.'
      } else {
        errorMessage = `Error: ${err.message}`
      }
      
      error.value = errorMessage
      console.error('Error en login con Google:', err)
      loading.value = false // Solo poner loading = false en caso de error
    }
  }

  const loginWithEmail = async (email, password) => {
    try {
      error.value = null
      loading.value = true
      const result = await signInWithEmailAndPassword(auth, email, password)
      user.value = result.user
    } catch (err) {
      error.value = err.message
      console.error('Error en login con email:', err)
    } finally {
      loading.value = false
    }
  }

  const register = async (email, password) => {
    try {
      error.value = null
      loading.value = true
      const result = await createUserWithEmailAndPassword(auth, email, password)
      user.value = result.user
    } catch (err) {
      error.value = err.message
      console.error('Error en registro:', err)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      console.log('Iniciando logout...', { currentUser: auth.currentUser })
      await signOut(auth)
      user.value = null
      console.log('Logout completado')
    } catch (err) {
      error.value = err.message
      console.error('Error en logout:', err)
    }
  }

  onMounted(async () => {
    // Verificar si hay un resultado de redirect pendiente
    try {
      const result = await getRedirectResult(auth)
      if (result) {
        user.value = result.user
      }
    } catch (err) {
      console.error('Error al obtener resultado de redirect:', err)
      error.value = err.message
    }
    
    // Configurar listener de cambios de autenticación
    onAuthStateChanged(auth, (authUser) => {
      console.log('🔐 Auth state changed:', authUser ? 'User logged in' : 'User logged out')
      user.value = authUser
      loading.value = false
      // Limpiar errores cuando la autenticación es exitosa
      if (authUser) {
        error.value = null
      }
    })
    
    // Fallback: asegurar que loading se ponga en false después de un tiempo
    setTimeout(() => {
      if (loading.value) {
        loading.value = false
      }
    }, 3000)
  })

  return {
    user,
    loading,
    error,
    loginWithGoogle,
    loginWithEmail,
    register,
    logout
  }
}