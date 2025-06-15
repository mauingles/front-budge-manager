import { ref, onMounted, onUnmounted } from 'vue'
import { useNotifications } from './useNotifications.js'

export function usePWA() {
  const { addNotification } = useNotifications()
  
  // Estados reactivos
  const isInstalled = ref(false)
  const canInstall = ref(false)
  const isStandalone = ref(false)
  const isOnline = ref(navigator.onLine)
  const installPrompt = ref(null)
  const swRegistration = ref(null)
  const updateAvailable = ref(false)
  
  // Detectar si ya está instalado
  const checkIfInstalled = () => {
    // Método 1: Verificar si está en modo standalone
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true
    
    // Método 2: Verificar si está instalado como PWA
    if ('getInstalledRelatedApps' in navigator) {
      navigator.getInstalledRelatedApps().then(relatedApps => {
        isInstalled.value = relatedApps.length > 0 || isStandalone.value
      }).catch(() => {
        isInstalled.value = isStandalone.value
      })
    } else {
      isInstalled.value = isStandalone.value
    }
  }
  
  // Registrar Service Worker
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        console.log('🔧 Registrando Service Worker...')
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        swRegistration.value = registration
        console.log('✅ Service Worker registrado:', registration.scope)
        
        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Nueva versión encontrada')
          const newWorker = registration.installing
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('📦 Nueva versión lista para instalar')
                updateAvailable.value = true
                showUpdateNotification()
              }
            })
          }
        })
        
        // Verificar si hay una actualización esperando
        if (registration.waiting) {
          const lastUpdateCheck = localStorage.getItem('lastUpdateCheck')
          const currentTime = Date.now().toString()
          
          // Solo mostrar si no se ha chequeado en los últimos 30 segundos
          if (!lastUpdateCheck || (Date.now() - parseInt(lastUpdateCheck)) > 30000) {
            updateAvailable.value = true
            showUpdateNotification()
            localStorage.setItem('lastUpdateCheck', currentTime)
          }
        }
        
        return registration
      } catch (error) {
        console.error('❌ Error registrando Service Worker:', error)
        return null
      }
    } else {
      console.log('❌ Service Workers no soportados')
      return null
    }
  }
  
  // Mostrar notificación de actualización automática
  const showUpdateNotification = () => {
    // Verificar si ya se mostró la notificación para esta versión
    const lastUpdateNotification = localStorage.getItem('lastUpdateNotification')
    const currentVersion = getCurrentVersion()
    
    if (lastUpdateNotification === currentVersion) {
      console.log('🔄 Notificación ya mostrada para esta versión')
      return
    }
    
    // Solo mostrar notificación informativa
    addNotification(
      '🔄 Nueva versión disponible',
      'info',
      3000
    )
    
    // Guardar que se mostró la notificación para esta versión
    localStorage.setItem('lastUpdateNotification', currentVersion)
    
    // Actualizar automáticamente inmediatamente (sin esperar interacción del usuario)
    updateApp()
  }
  
  // Obtener versión actual del service worker
  const getCurrentVersion = () => {
    return swRegistration.value?.active?.scriptURL || 'unknown'
  }
  
  // Actualizar la aplicación
  const updateApp = () => {
    if (swRegistration.value?.waiting) {
      addNotification(
        '✨ Aplicación actualizada. Recargando...',
        'success',
        2000
      )
      
      swRegistration.value.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Limpiar el flag de notificación antes de recargar
      localStorage.removeItem('lastUpdateNotification')
      
      // Recargar después de mostrar la notificación
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }
  
  // Manejar evento de instalación
  const handleBeforeInstallPrompt = (event) => {
    console.log('💾 Evento beforeinstallprompt capturado')
    event.preventDefault()
    installPrompt.value = event
    canInstall.value = true
  }
  
  
  // Verificar si es dispositivo móvil
  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
  
  // Verificar si es iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }
  
  
  // Manejar cambios de conectividad
  const handleOnline = () => {
    isOnline.value = true
    addNotification('Conexión restablecida', 'success', 3000)
  }
  
  const handleOffline = () => {
    isOnline.value = false
    addNotification('Sin conexión - La app funciona offline', 'warning', 5000)
  }
  
  // Manejar cambios en el estado de instalación
  const handleAppInstalled = () => {
    console.log('🎉 Aplicación instalada')
    isInstalled.value = true
    canInstall.value = false
    installPrompt.value = null
  }
  
  // Verificar características de PWA
  const checkPWAFeatures = () => {
    const features = {
      serviceWorker: 'serviceWorker' in navigator,
      installPrompt: 'BeforeInstallPromptEvent' in window,
      standalone: isStandalone.value,
      offline: 'caches' in window,
      notifications: 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    }
    
    console.log('🔍 Características PWA:', features)
    return features
  }
  
  // Lifecycle hooks
  onMounted(async () => {
    console.log('🚀 Inicializando PWA...')
    
    // Verificar estado inicial
    checkIfInstalled()
    checkPWAFeatures()
    
    // Registrar Service Worker
    await registerServiceWorker()
    
    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    
    console.log('✅ PWA inicializado')
    console.log('📱 Dispositivo móvil:', isMobile())
    console.log('🍎 iOS:', isIOS())
    console.log('💾 Puede instalar:', canInstall.value)
    console.log('📦 Instalado:', isInstalled.value)
  })
  
  onUnmounted(() => {
    // Limpiar event listeners
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })
  
  // API pública
  return {
    // Estados
    isInstalled,
    canInstall,
    isStandalone,
    isOnline,
    updateAvailable,
    
    // Métodos
    updateApp,
    isMobile,
    isIOS,
    checkIfInstalled,
    checkPWAFeatures
  }
}