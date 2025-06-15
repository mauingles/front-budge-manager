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
  const checkIfInstalled = async () => {
    console.log('🔍 Verificando si PWA está instalada...')
    
    // Método 1: Verificar si está en modo standalone
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true
    
    console.log('🖥️ isStandalone detectado:', isStandalone.value)
    
    // Método 2: Verificar localStorage para instalación previa
    const wasInstalled = localStorage.getItem('pwa-was-installed') === 'true'
    console.log('💾 localStorage pwa-was-installed:', wasInstalled)
    
    // Método 3: Verificar getInstalledRelatedApps (limitado pero útil)
    let relatedAppsInstalled = false
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await navigator.getInstalledRelatedApps()
        relatedAppsInstalled = relatedApps.length > 0
        console.log('📱 getInstalledRelatedApps:', relatedApps)
      } catch (error) {
        console.log('❌ getInstalledRelatedApps falló:', error)
      }
    }
    
    // Método 4: Verificar si beforeinstallprompt fue interceptado y luego desapareció
    const installPromptWasShown = sessionStorage.getItem('install-prompt-shown') === 'true'
    const installPromptDisappeared = installPromptWasShown && !window.promptEvent
    console.log('📦 Install prompt mostrado y desapareció:', installPromptDisappeared)
    
    // Método 5: Verificar display mode a través de CSS
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isDisplayMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches
    const isDisplayFullscreen = window.matchMedia('(display-mode: fullscreen)').matches
    const isPWADisplayMode = isDisplayStandalone || isDisplayMinimalUI || isDisplayFullscreen
    
    console.log('🎨 Display modes - standalone:', isDisplayStandalone, 'minimal-ui:', isDisplayMinimalUI, 'fullscreen:', isDisplayFullscreen)
    
    // Combinar todos los métodos para una detección más robusta
    isInstalled.value = isStandalone.value || 
                       wasInstalled || 
                       relatedAppsInstalled || 
                       installPromptDisappeared ||
                       isPWADisplayMode
    
    console.log('✅ PWA instalada detectada:', isInstalled.value)
    
    // Si detectamos que está instalada pero no estamos en modo standalone, 
    // significa que estamos en navegador con PWA instalada
    if (isInstalled.value && !isStandalone.value) {
      console.log('🌐 PWA instalada pero accediendo desde navegador')
      // Guardar estado para futuras referencias
      localStorage.setItem('pwa-was-installed', 'true')
    }
    
    // Verificar si debemos redirigir a la PWA
    checkForPWARedirect()
  }
  
  // Verificar si debemos redirigir a la PWA instalada
  const checkForPWARedirect = () => {
    console.log('🔍 Verificando si mostrar modal PWA redirect...')
    console.log('📱 isInstalled:', isInstalled.value)
    console.log('🖥️ isStandalone:', isStandalone.value)
    console.log('⚙️ shouldRedirectToPWA:', shouldRedirectToPWA())
    
    // Solo proceder si:
    // 1. La PWA está instalada
    // 2. Estamos en el navegador (no en modo standalone)
    // 3. El usuario no ha deshabilitado el redirect
    if (isInstalled.value && !isStandalone.value && shouldRedirectToPWA()) {
      const modalClosed = sessionStorage.getItem('pwa-modal-closed')
      const autoRedirectDisabled = localStorage.getItem('pwa-auto-redirect-disabled') === 'true'
      
      console.log('❌ modalClosed:', modalClosed)
      console.log('🚫 autoRedirectDisabled:', autoRedirectDisabled)
      
      // Si el auto-redirect no está deshabilitado, intentar redirect automático
      if (!autoRedirectDisabled) {
        console.log('🚀 Intentando redirect automático a PWA...')
        setTimeout(() => {
          redirectToPWA()
        }, 1500) // Pequeño delay para que cargue la página
      }
      
      // Mostrar modal solo si no fue cerrado en esta sesión
      if (!modalClosed) {
        console.log('✅ Mostrando modal PWA redirect')
        showPWABanner.value = true
        
        // También mostrar notificación
        showPWARedirectPrompt()
      }
    } else {
      console.log('❌ No procediendo con PWA redirect')
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
    
    // Mostrar notificación y luego intentar redirect automático
    addNotification(
      '📱 Intentando abrir en la aplicación instalada...',
      'info',
      5000
    )
    
    // Ejecutar redirect después de un pequeño delay
    setTimeout(() => {
      redirectToPWA()
    }, 2000)
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
  
  // Redirigir a la PWA instalada (método agresivo)
  const redirectToPWA = () => {
    try {
      console.log('🔄 Intentando redirigir a PWA instalada...')
      
      // Estrategia 1: Usar navigator.share si está disponible (funciona en algunos casos)
      if (navigator.share && isMobile()) {
        attemptPWARedirectViaShare()
        return
      }
      
      // Estrategia 2: Intentar con intent URLs en Android
      if (navigator.userAgent.includes('Android')) {
        attemptAndroidPWARedirect()
        return
      }
      
      // Estrategia 3: Usar custom protocol handlers
      attemptProtocolRedirect()
      
    } catch (error) {
      console.error('Error redirigiendo a PWA:', error)
      showManualPWAOpenInstructions()
    }
  }
  
  // Estrategia 1: Usar Share API como trigger
  const attemptPWARedirectViaShare = async () => {
    try {
      // Compartir a la propia app puede triggerear la apertura en PWA
      await navigator.share({
        title: 'Budget Manager',
        text: 'Abriendo en la aplicación...',
        url: window.location.origin
      })
    } catch (error) {
      console.log('Share API falló, intentando método alternativo')
      attemptProtocolRedirect()
    }
  }
  
  // Estrategia 2: Android Intent URLs
  const attemptAndroidPWARedirect = () => {
    try {
      // Intent URL para Android
      const intentUrl = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;category=android.intent.category.BROWSABLE;component=com.android.chrome/com.google.android.apps.chrome.webapps.WebappActivity;end`
      
      // Crear enlace invisible y hacer click
      const link = document.createElement('a')
      link.href = intentUrl
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Si no funciona en 2 segundos, mostrar fallback
      setTimeout(() => {
        if (!document.hidden) {
          attemptProtocolRedirect()
        }
      }, 2000)
      
    } catch (error) {
      console.log('Android intent falló, intentando protocolo personalizado')
      attemptProtocolRedirect()
    }
  }
  
  // Estrategia 3: Protocol handlers y métodos alternativos
  const attemptProtocolRedirect = () => {
    try {
      const currentUrl = window.location.href
      
      // Método 1: Intentar abrir con protocolo web+app
      const protocolUrl = `web+budgetmanager://open?url=${encodeURIComponent(currentUrl)}`
      window.location.href = protocolUrl
      
      // Método 2: Crear evento de teclado para simular Ctrl+Shift+A (abrir como app en Chrome)
      setTimeout(() => {
        if (navigator.userAgent.includes('Chrome') && !isMobile()) {
          simulateAppShortcut()
        }
      }, 1000)
      
      // Método 3: Forzar reload con parámetros PWA
      setTimeout(() => {
        if (!document.hidden) {
          const pwaUrl = `${window.location.origin}/?pwa=true&timestamp=${Date.now()}`
          window.location.replace(pwaUrl)
        }
      }, 3000)
      
    } catch (error) {
      console.log('Redirect por protocolo falló, mostrando instrucciones')
      showManualPWAOpenInstructions()
    }
  }
  
  // Simular atajo de teclado para abrir como app (Chrome desktop)
  const simulateAppShortcut = () => {
    try {
      // Crear eventos de teclado
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'a',
        code: 'KeyA',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true
      })
      
      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'a',
        code: 'KeyA',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true
      })
      
      document.dispatchEvent(keydownEvent)
      document.dispatchEvent(keyupEvent)
      
    } catch (error) {
      console.log('Simulación de atajo falló')
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
  
  // Cerrar modal temporalmente (se vuelve a mostrar en la próxima visita)
  const closePWABanner = () => {
    showPWABanner.value = false
    // Guardar que se cerró para no molestarlo en esta sesión
    sessionStorage.setItem('pwa-modal-closed', 'true')
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
    
    // Marcar que el prompt fue mostrado
    sessionStorage.setItem('install-prompt-shown', 'true')
    window.promptEvent = event
    
    // Solo permitir instalación si NO está ya instalada
    if (!isInstalled.value && !isStandalone.value) {
      installPrompt.value = event
      canInstall.value = true
      console.log('✅ PWA puede instalarse - no está instalada actualmente')
    } else {
      console.log('❌ PWA ya está instalada - bloqueando prompt de instalación')
      canInstall.value = false
      installPrompt.value = null
      // Si ya está instalada, limpiar el evento
      window.promptEvent = null
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
    console.log('🎉 Aplicación instalada exitosamente')
    
    // Marcar como instalada permanentemente
    isInstalled.value = true
    canInstall.value = false
    installPrompt.value = null
    
    // Guardar en localStorage para futuras referencias
    localStorage.setItem('pwa-was-installed', 'true')
    localStorage.setItem('pwa-install-date', new Date().toISOString())
    
    // Limpiar estados de sesión
    sessionStorage.removeItem('install-prompt-shown')
    sessionStorage.removeItem('pwa-modal-closed')
    
    // Ocultar modal de redirect si se muestra (ya no es necesario)
    showPWABanner.value = false
    
    // Limpiar cualquier prompt pendiente
    if (window.promptEvent) {
      window.promptEvent = null
    }
    
    // Mostrar notificación de éxito
    addNotification('🎉 ¡Aplicación instalada exitosamente!', 'success', 3000)
    
    // Verificar estado después de instalación
    setTimeout(() => {
      checkIfInstalled()
    }, 1000)
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
    
    // Verificación periódica del estado de instalación cada 10 segundos
    setInterval(() => {
      const wasInstalled = isInstalled.value
      checkIfInstalled()
      
      // Si el estado cambió, limpiar prompts
      if (wasInstalled !== isInstalled.value) {
        console.log('🔄 Estado de instalación cambió:', isInstalled.value ? 'Instalada' : 'No instalada')
        if (isInstalled.value) {
          canInstall.value = false
          installPrompt.value = null
        }
      }
    }, 10000)
    
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