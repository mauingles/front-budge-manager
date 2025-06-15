<template>
  <Teleport to="body">
    <div v-if="show" class="install-modal-overlay" @click="handleClose">
      <div class="install-modal-dialog" @click.stop>
        <button class="install-modal-close" @click="handleClose" title="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18"/>
            <path d="M6 6l12 12"/>
          </svg>
        </button>
        
        <div class="install-modal-content">
          <div class="install-icon">
            📱
          </div>
          
          <h2 class="install-title">
            ¡Instala Budget Manager!
          </h2>
          
          <div class="install-benefits">
            <div class="benefit-item">
              <span class="benefit-icon">⚡</span>
              <span>Acceso instantáneo desde tu pantalla de inicio</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">📶</span>
              <span>Funciona sin conexión a internet</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🔒</span>
              <span>Datos seguros y siempre disponibles</span>
            </div>
          </div>
          
          <div class="install-actions">
            <button v-if="!isIOS" class="install-btn" @click="handleInstall">
              🚀 Instalar Ahora
            </button>
            <div v-else class="ios-instructions">
              <p>📱 <strong>En iOS:</strong></p>
              <p>1. Toca el botón <strong>compartir</strong> (↗️)</p>
              <p>2. Selecciona <strong>"Agregar a pantalla de inicio"</strong></p>
            </div>
            <button class="later-btn" @click="handleClose">
              {{ isIOS ? 'Entendido' : 'Más tarde' }}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['show'])
const emit = defineEmits(['close', 'install'])

// Detectar iOS
const isIOS = computed(() => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
})

const handleClose = () => {
  emit('close')
}

const handleInstall = () => {
  emit('install')
}
</script>

<style scoped>
.install-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
  animation: fadeIn 0.3s ease;
}

.install-modal-dialog {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 100%;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: scale(1);
  transition: all 0.3s ease;
  position: relative;
  animation: slideUp 0.4s ease;
}

.install-modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #64748b;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  backdrop-filter: blur(10px);
}

.install-modal-close:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #334155;
  transform: scale(1.1);
}

.install-modal-close svg {
  width: 16px;
  height: 16px;
}

.install-modal-content {
  text-align: center;
}

.install-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

.install-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 25px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.install-benefits {
  margin-bottom: 30px;
  text-align: left;
}

.benefit-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.2s ease;
}

.benefit-item:hover {
  transform: translateX(5px);
}

.benefit-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  min-width: 24px;
}

.install-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.install-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.install-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.install-btn:active {
  transform: translateY(0);
}

.later-btn {
  background: transparent;
  color: #64748b;
  border: 2px solid rgba(100, 116, 139, 0.3);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.later-btn:hover {
  border-color: rgba(100, 116, 139, 0.5);
  color: #475569;
}

.ios-instructions {
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: left;
}

.ios-instructions p {
  margin: 8px 0;
  color: #1e40af;
  font-weight: 500;
}

.ios-instructions p:first-child {
  margin-top: 0;
  font-size: 1.1rem;
}

.ios-instructions strong {
  color: #1d4ed8;
}

.install-timer {
  font-size: 0.9rem;
  color: #64748b;
  font-style: italic;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .install-modal-overlay {
    padding: 16px;
  }
  
  .install-modal-dialog {
    padding: 25px 20px;
    max-width: 350px;
    border-radius: 16px;
  }
  
  .install-title {
    font-size: 1.6rem;
  }
  
  .install-icon {
    font-size: 3.5rem;
  }
}

@media (max-width: 480px) {
  .install-modal-overlay {
    padding: 12px;
  }
  
  .install-modal-dialog {
    padding: 20px 16px;
    border-radius: 12px;
  }
  
  .install-title {
    font-size: 1.4rem;
  }
  
  .install-icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }
  
  .benefit-item {
    padding: 8px;
    margin-bottom: 8px;
  }
}
</style>