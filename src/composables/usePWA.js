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
  const showInstallModal = ref(false)
  
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
          updateAvailable.value = true
          showUpdateNotification()
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
    addNotification(
      '🔄 Nueva versión encontrada. Actualizando automáticamente...',
      'info',
      3000
    )
    
    // Actualizar automáticamente después de 2 segundos
    setTimeout(() => {
      updateApp()
    }, 2000)
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
    
    // Solo mostrar el banner si no está instalado y es móvil
    if (!isInstalled.value && isMobile()) {
      setTimeout(() => {
        showInstallBanner()
      }, 3000) // Mostrar después de 3 segundos
    }
  }
  
  // Mostrar modal de instalación
  const showInstallBanner = () => {
    if (!canInstall.value || isInstalled.value) return
    
    showInstallModal.value = true
  }
  
  // Cerrar modal de instalación
  const closeInstallModal = () => {
    showInstallModal.value = false
  }
  
  // Instalar la aplicación
  const installApp = async () => {
    if (!installPrompt.value) {
      console.log('❌ No hay prompt de instalación disponible')
      return false
    }
    
    try {
      // Cerrar modal primero
      showInstallModal.value = false
      
      console.log('📱 Mostrando prompt de instalación...')
      const result = await installPrompt.value.prompt()
      console.log('📊 Resultado de instalación:', result.outcome)
      
      if (result.outcome === 'accepted') {
        console.log('✅ Usuario aceptó la instalación')
        addNotification('¡Aplicación instalada exitosamente!', 'success', 5000)
        canInstall.value = false
        installPrompt.value = null
        
        // Verificar estado después de un pequeño delay
        setTimeout(checkIfInstalled, 2000)
        return true
      } else {
        console.log('❌ Usuario rechazó la instalación')
        addNotification('Instalación cancelada. Puedes instalar más tarde desde el menú del navegador.', 'info', 5000)
        return false
      }
    } catch (error) {
      console.error('❌ Error en instalación:', error)
      addNotification('Error durante la instalación', 'error')
      return false
    }
  }
  
  // Verificar si es dispositivo móvil
  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
  
  // Verificar si es iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }
  
  // Mostrar modal para iOS
  const showIOSInstructions = () => {
    if (isIOS() && !isInstalled.value) {
      showInstallModal.value = true
    }
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
    
    // Mostrar instrucciones para iOS si es necesario
    if (isIOS() && !isInstalled.value) {
      setTimeout(showIOSInstructions, 5000)
    }
    
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
    showInstallModal,
    
    // Métodos
    installApp,
    updateApp,
    showInstallBanner,
    closeInstallModal,
    showIOSInstructions,
    isMobile,
    isIOS,
    checkIfInstalled,
    checkPWAFeatures
  }
}