<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div class="modal-dialog" @click.stop>
        <button class="modal-close" @click="$emit('close')" title="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18"/>
            <path d="M6 6l12 12"/>
          </svg>
        </button>
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps(['show'])
defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
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
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
}

.modal-dialog {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  min-width: 300px;
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

.modal-close {
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

.modal-close:hover {
  background: #f1f5f9;
  color: #334155;
}

.modal-close svg {
  width: 14px;
  height: 14px;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
  }
  
  .modal-dialog {
    padding: 14px;
    max-width: 95vw;
    min-width: 280px;
    border-radius: 6px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 8px;
  }
  
  .modal-dialog {
    padding: 12px;
    border-radius: 6px;
    max-height: 95vh;
    max-width: 98vw;
    min-width: 260px;
  }
}
</style>