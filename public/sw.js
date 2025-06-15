const CACHE_NAME = 'budget-manager-v1.0.17'
const STATIC_CACHE = 'budget-manager-static-v1.0.17'
const DYNAMIC_CACHE = 'budget-manager-dynamic-v1.0.17'

// Archivos que se cachean en la instalación
const STATIC_FILES = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/favicon.svg'
]

// URLs que NO se deben cachear
const EXCLUDE_FROM_CACHE = [
  '/api/',
  'chrome-extension://',
  'extension://',
  'moz-extension://',
  'https://identitytoolkit.googleapis.com/',
  'https://securetoken.googleapis.com/',
  'https://budge-manager-default-rtdb.firebaseio.com/',
  'https://firestore.googleapis.com/'
]

// Instalar el Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando archivos estáticos')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completada')
        return self.skipWaiting() // Activar inmediatamente
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error en instalación:', error)
      })
  )
})

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar cachés obsoletos
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Eliminando caché obsoleto:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activación completada')
        return self.clients.claim() // Tomar control inmediatamente
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error en activación:', error)
      })
  )
})

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // No cachear ciertas URLs
  const shouldExclude = EXCLUDE_FROM_CACHE.some(pattern => 
    request.url.includes(pattern)
  )
  
  if (shouldExclude) {
    // Pasar directamente a la red sin cachear
    event.respondWith(fetch(request))
    return
  }
  
  // Estrategia: Cache First para archivos estáticos, Network First para datos dinámicos
  if (request.method === 'GET') {
    if (url.pathname.includes('/api/') || url.hostname !== location.hostname) {
      // Network First para APIs y recursos externos
      event.respondWith(networkFirst(request))
    } else {
      // Cache First para archivos estáticos
      event.respondWith(cacheFirst(request))
    }
  }
})

// Estrategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('📦 Cache Hit:', request.url)
      return cachedResponse
    }
    
    console.log('🌐 Cache Miss, fetching:', request.url)
    const networkResponse = await fetch(request)
    
    // Cachear la respuesta si es exitosa
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ Error en cacheFirst:', error)
    
    // Fallback para navegación
    if (request.destination === 'document') {
      const cachedIndex = await caches.match('/')
      if (cachedIndex) {
        return cachedIndex
      }
    }
    
    throw error
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    console.log('🌐 Network First:', request.url)
    const networkResponse = await fetch(request)
    
    // Cachear respuestas exitosas de APIs (opcional)
    if (networkResponse.status === 200 && request.url.includes('/api/data')) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ Network error, checking cache:', error)
    
    // Fallback al caché si la red falla
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('📦 Using cached fallback for:', request.url)
      return cachedResponse
    }
    
    throw error
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Mensaje recibido:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Service Worker: Saltando espera...')
    self.skipWaiting().then(() => {
      // Notificar a todos los clientes que el SW se ha activado
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_ACTIVATED' })
        })
      })
    })
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// Manejar sincronización en background (para futuras funcionalidades)
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background Sync:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí se pueden agregar tareas de sincronización
      console.log('📡 Ejecutando sincronización en background')
    )
  }
})

// Manejar notificaciones push (para futuras funcionalidades)
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push recibido:', event.data?.text())
  
  const options = {
    body: event.data?.text() || 'Nueva actualización disponible',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalles',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Budget Manager', options)
  )
})

console.log('🎯 Service Worker: Cargado y listo')