<template>
  <Teleport to="body">
    <div v-if="show" class="confirm-overlay" @click="handleCancel">
      <div class="confirm-modal" @click.stop>
        <button class="confirm-close" @click="handleCancel" title="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18"/>
            <path d="M6 6l12 12"/>
          </svg>
        </button>
        <div class="confirm-dialog">
      
      <div class="confirm-content">
        <h3 class="confirm-title">{{ title }}</h3>
        <p class="confirm-message">{{ message }}</p>
      </div>
      
      <div class="confirm-actions">
        <button @click="handleCancel" class="cancel-btn">
          {{ cancelText }}
        </button>
        <button @click="handleConfirm" :class="['confirm-btn', type === 'danger' ? 'danger-btn' : 'primary-btn']">
          {{ confirmText }}
        </button>
        </div>
      </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Confirmar'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  type: {
    type: String,
    default: 'info', // 'info' | 'danger'
    validator: (value) => ['info', 'danger'].includes(value)
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  padding: 20px;
  box-sizing: border-box;
}

.confirm-modal {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;
  min-width: 240px;
  max-width: 90vw;
  width: auto;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px -12px rgb(0 0 0 / 0.25);
  border: 1px solid #e2e8f0;
  transform: scale(1);
  transition: all 0.3s ease;
  position: relative;
  margin: auto;
  box-sizing: border-box;
}

.confirm-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: #64748b;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  z-index: 10;
}

.confirm-close:hover {
  background: #f1f5f9;
  color: #334155;
}

.confirm-close svg {
  width: 14px;
  height: 14px;
}

.confirm-dialog {
  text-align: center;
  padding: 2px;
  width: auto;
  min-width: 220px;
  max-width: 320px;
}


.confirm-content {
  margin-bottom: 12px;
}

.confirm-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.confirm-message {
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.3;
  margin: 0;
}

.confirm-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.cancel-btn, .confirm-btn {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  min-width: 60px;
}

.cancel-btn {
  background: #ffffff;
  color: #6b7280;
  border-color: #d1d5db;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.primary-btn {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.primary-btn:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.danger-btn {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

.danger-btn:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

@media (max-width: 768px) {
  .confirm-dialog {
    min-width: 260px;
  }
  
  .confirm-icon {
    width: 28px;
    height: 28px;
    margin-bottom: 8px;
  }
  
  .confirm-title {
    font-size: 0.9rem;
  }
  
  .cancel-btn, .confirm-btn {
    padding: 5px 10px;
    font-size: 12px;
    min-width: 60px;
  }
}

@media (max-width: 480px) {
  .confirm-dialog {
    min-width: 240px;
  }
}
</style>