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
  const showPWABanner = ref(false)
  
  // Detectar si ya está instalado
  const checkIfInstalled = () => {
    // Método 1: Verificar si está en modo standalone
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true
    
    // Método 2: Verificar si está instalado como PWA
    if ('getInstalledRelatedApps' in navigator) {
      navigator.getInstalledRelatedApps().then(relatedApps => {
        isInstalled.value = relatedApps.length > 0 || isStandalone.value
        
        // Verificar si debemos redirigir a la PWA
        checkForPWARedirect()
      }).catch(() => {
        isInstalled.value = isStandalone.value
        checkForPWARedirect()
      })
    } else {
      isInstalled.value = isStandalone.value
      checkForPWARedirect()
    }
  }
  
  // Verificar si debemos redirigir a la PWA instalada
  const checkForPWARedirect = () => {
    // Solo mostrar banner si:
    // 1. La PWA está instalada
    // 2. Estamos en el navegador (no en modo standalone)
    // 3. El usuario no ha deshabilitado el redirect
    // 4. El banner no fue cerrado en esta sesión
    const bannerClosed = sessionStorage.getItem('pwa-banner-closed')
    
    if (isInstalled.value && !isStandalone.value && shouldRedirectToPWA() && !bannerClosed) {
      // Mostrar banner persistente en lugar de notificación temporal
      showPWABanner.value = true
      
      // También mostrar notificación la primera vez
      showPWARedirectPrompt()
    }
  }
  
  // Verificar si el usuario quiere que se redirija automáticamente
  const shouldRedirectToPWA = () => {
    const preference = localStorage.getItem('pwa-redirect-preference')
    return preference !== 'disabled'
  }
  
  // Mostrar prompt para redirigir a PWA
  const showPWARedirectPrompt = () => {
    // Verificar si ya hemos mostrado este prompt recientemente
    const lastPrompt = localStorage.getItem('pwa-redirect-last-prompt')
    const now = Date.now()
    
    // Solo mostrar una vez por hora
    if (lastPrompt && (now - parseInt(lastPrompt)) < 3600000) {
      return
    }
    
    localStorage.setItem('pwa-redirect-last-prompt', now.toString())
    
    // Detectar el tipo de dispositivo para mostrar instrucciones específicas
    const instructions = getPWAOpenInstructions()
    
    addNotification(
      `📱 ${instructions}`,
      'info',
      8000
    )
  }
  
  // Obtener instrucciones específicas por plataforma
  const getPWAOpenInstructions = () => {
    if (isMobile()) {
      if (isIOS()) {
        return 'Abre Budget Manager desde tu pantalla de inicio para mejor experiencia'
      } else {
        // Android
        return 'Abre Budget Manager desde tu lista de aplicaciones para mejor experiencia'
      }
    } else {
      // Desktop
      if (navigator.userAgent.includes('Chrome')) {
        return 'Abre Budget Manager desde la barra de aplicaciones o Chrome Apps para mejor experiencia'
      } else if (navigator.userAgent.includes('Edge')) {
        return 'Abre Budget Manager desde el menú de aplicaciones de Edge para mejor experiencia'
      } else {
        return 'Abre Budget Manager como aplicación independiente para mejor experiencia'
      }
    }
  }
  
  // Redirigir a la PWA instalada (método mejorado)
  const redirectToPWA = () => {
    try {
      console.log('🔄 Detectando PWA instalada...')
      
      // En lugar de forzar el redirect, mostrar instrucciones específicas
      showPWARedirectPrompt()
      
    } catch (error) {
      console.error('Error detectando PWA:', error)
      showManualPWAOpenInstructions()
    }
  }
  
  // Mostrar instrucciones manuales para abrir PWA
  const showManualPWAOpenInstructions = () => {
    addNotification(
      '💡 Abre Budget Manager desde tu pantalla de inicio para mejor experiencia',
      'info',
      5000
    )
  }
  
  // Deshabilitar redirect automático (por si el usuario lo prefiere)
  const disablePWARedirect = () => {
    localStorage.setItem('pwa-redirect-preference', 'disabled')
    showPWABanner.value = false
    addNotification('Banner PWA deshabilitado', 'info', 3000)
  }
  
  // Habilitar redirect automático
  const enablePWARedirect = () => {
    localStorage.setItem('pwa-redirect-preference', 'enabled')
    if (isInstalled.value && !isStandalone.value) {
      showPWABanner.value = true
    }
    addNotification('Banner PWA habilitado', 'success', 3000)
  }
  
  // Cerrar banner temporalmente (se vuelve a mostrar en la próxima visita)
  const closePWABanner = () => {
    showPWABanner.value = false
    // Guardar que se cerró para no molestarlo en esta sesión
    sessionStorage.setItem('pwa-banner-closed', 'true')
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
        
        // Verificar actualizaciones nuevas
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Nueva versión encontrada')
          const newWorker = registration.installing
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('📦 Nueva versión lista para instalar')
                updateAvailable.value = true
                handleUpdateFound()
              }
            })
          }
        })
        
        // Verificar si ya hay una actualización esperando (al recargar la página)
        if (registration.waiting) {
          console.log('📦 Actualización ya disponible al cargar')
          updateAvailable.value = true
          handleUpdateFound()
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
  
  // Manejar cuando se encuentra una actualización
  const handleUpdateFound = () => {
    const updateSessionKey = 'updateHandled_' + Date.now()
    const lastUpdateHandled = localStorage.getItem('lastUpdateHandled')
    
    // Evitar actualizaciones múltiples en la misma sesión
    if (lastUpdateHandled && (Date.now() - parseInt(lastUpdateHandled)) < 10000) {
      console.log('🔄 Actualización ya manejada recientemente')
      return
    }
    
    console.log('🔄 Manejando nueva actualización disponible')
    
    // Marcar que estamos manejando la actualización
    localStorage.setItem('lastUpdateHandled', Date.now().toString())
    
    // Mostrar notificación y actualizar automáticamente
    showUpdateNotification()
  }
  
  // Mostrar notificación de actualización automática
  const showUpdateNotification = () => {
    // Solo mostrar notificación informativa
    addNotification(
      '🔄 Nueva versión disponible',
      'info',
      3000
    )
    
    // Actualizar automáticamente inmediatamente (sin esperar interacción del usuario)
    updateApp()
  }
  
  // Obtener versión actual del service worker
  const getCurrentVersion = () => {
    // Usar timestamp del registro en lugar del scriptURL
    const registration = swRegistration.value
    if (registration?.active) {
      return `${registration.active.scriptURL}?${Date.now()}`
    }
    return 'unknown'
  }
  
  // Actualizar la aplicación
  const updateApp = () => {
    if (swRegistration.value?.waiting) {
      console.log('🔄 Iniciando actualización de la aplicación')
      
      addNotification(
        '✨ Aplicación actualizada. Recargando...',
        'success',
        2000
      )
      
      // Enviar mensaje al service worker para que se active
      swRegistration.value.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Limpiar flags antes de recargar
      localStorage.removeItem('lastUpdateHandled')
      
      // Escuchar cuando el nuevo SW toma control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Nuevo Service Worker activo, recargando...')
        window.location.reload()
      })
      
      // Fallback: recargar después de un tiempo si controllerchange no se dispara
      setTimeout(() => {
        console.log('🔄 Recargando por timeout fallback')
        window.location.reload()
      }, 2000)
    } else {
      console.log('⚠️ No hay Service Worker esperando para actualizar')
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
    
    // Verificación periódica de actualizaciones cada 60 segundos
    setInterval(() => {
      if (swRegistration.value) {
        console.log('🔍 Verificando actualizaciones periódicamente...')
        swRegistration.value.update()
      }
    }, 60000)
    
    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Escuchar mensajes del Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_ACTIVATED') {
        console.log('🔄 Service Worker activado, recargando página...')
        window.location.reload()
      }
    })
    
    
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
    showPWABanner,
    
    // Métodos
    updateApp,
    isMobile,
    isIOS,
    checkIfInstalled,
    checkPWAFeatures,
    
    // PWA Redirect
    redirectToPWA,
    disablePWARedirect,
    enablePWARedirect,
    shouldRedirectToPWA,
    closePWABanner,
    getPWAOpenInstructions
  }
}