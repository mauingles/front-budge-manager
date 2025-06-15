<template>
  <Teleport to="body">
    <div v-if="show" class="pwa-banner">
      <div class="pwa-banner-content">
        <div class="pwa-banner-icon">📱</div>
        <div class="pwa-banner-text">
          <div class="pwa-banner-title">¡Aplicación instalada!</div>
          <div class="pwa-banner-message">{{ instructions }}</div>
        </div>
        <div class="pwa-banner-actions">
          <button @click="$emit('redirect')" class="pwa-banner-redirect" title="Abrir aplicación">
            🚀 Abrir
          </button>
          <button @click="$emit('close')" class="pwa-banner-close" title="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18"/>
              <path d="M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  instructions: {
    type: String,
    default: 'Abre Budget Manager como aplicación independiente para mejor experiencia'
  }
})

defineEmits(['close', 'redirect'])
</script>

<style scoped>
.pwa-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease;
}

.pwa-banner-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 12px;
}

.pwa-banner-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.pwa-banner-text {
  flex: 1;
  min-width: 0;
}

.pwa-banner-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.pwa-banner-message {
  font-size: 0.8rem;
  opacity: 0.9;
  line-height: 1.3;
}

.pwa-banner-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pwa-banner-redirect {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pwa-banner-redirect:hover {
  background: white;
  transform: scale(1.05);
}

.pwa-banner-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.pwa-banner-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.pwa-banner-close svg {
  width: 16px;
  height: 16px;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .pwa-banner-content {
    padding: 10px 12px;
    gap: 10px;
  }
  
  .pwa-banner-icon {
    font-size: 1.3rem;
  }
  
  .pwa-banner-title {
    font-size: 0.85rem;
  }
  
  .pwa-banner-message {
    font-size: 0.75rem;
  }
  
  .pwa-banner-close {
    width: 28px;
    height: 28px;
  }
  
  .pwa-banner-close svg {
    width: 14px;
    height: 14px;
  }
}
</style>