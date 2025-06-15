<template>
  <Teleport to="body">
    <!-- Modal overlay -->
    <div v-if="show" class="pwa-modal-overlay" @click="$emit('close')">
      <!-- Modal content -->
      <div class="pwa-modal" @click.stop>
        <!-- Header -->
        <div class="pwa-modal-header">
          <div class="pwa-modal-icon">📱</div>
          <h3 class="pwa-modal-title">¡Aplicación instalada!</h3>
          <button @click="$emit('close')" class="pwa-modal-close" title="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18"/>
              <path d="M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="pwa-modal-body">
          <p class="pwa-modal-message">{{ instructions }}</p>
        </div>
        
        <!-- Footer -->
        <div class="pwa-modal-footer">
          <button @click="$emit('disable')" class="btn btn-tertiary" title="No volver a mostrar automáticamente">
            No automático
          </button>
          <button @click="$emit('close')" class="btn btn-secondary">
            Más tarde
          </button>
          <button @click="$emit('redirect')" class="btn btn-primary">
            🚀 Abrir aplicación
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

defineEmits(['close', 'redirect', 'disable'])
</script>

<style scoped>
/* Modal overlay */
.pwa-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

/* Modal content */
.pwa-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

/* Modal header */
.pwa-modal-header {
  display: flex;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.pwa-modal-icon {
  font-size: 1.5rem;
  margin-right: 12px;
}

.pwa-modal-title {
  flex: 1;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.pwa-modal-close {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.pwa-modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.pwa-modal-close svg {
  width: 16px;
  height: 16px;
}

/* Modal body */
.pwa-modal-body {
  padding: 20px 24px;
}

.pwa-modal-message {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 0.95rem;
}

/* Modal footer */
.pwa-modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e8e8e8;
  color: #333;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-tertiary {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  font-size: 0.8rem;
}

.btn-tertiary:hover {
  background: #e9ecef;
  color: #495057;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive design */
@media (max-width: 480px) {
  .pwa-modal {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
  
  .pwa-modal-header,
  .pwa-modal-body {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .pwa-modal-footer {
    padding: 16px 20px 20px;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>