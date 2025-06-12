<template>
  <Teleport to="body">
    <div class="notification-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
      >
      <div class="notification-content">
        <span class="notification-message">{{ notification.message }}</span>
      </div>
      <button @click="removeNotification(notification.id)" class="notification-close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18"/>
          <path d="M6 6l12 12"/>
        </svg>
      </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useNotifications } from '@/composables/useNotifications.js'

const { notifications, removeNotification } = useNotifications()
</script>

<style scoped>
.notification-container {
  position: fixed !important;
  top: 10px !important;
  right: 15px !important;
  z-index: 3 !important;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 280px;
  width: 100%;
  pointer-events: none;
}

.notification {
  pointer-events: auto;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  animation: slideIn 0.3s ease-out;
  backdrop-filter: blur(8px);
  border: 1px solid;
}

.notification-success {
  background: rgba(16, 185, 129, 0.95);
  color: white;
  border-color: rgba(16, 185, 129, 0.3);
}

.notification-error {
  background: rgba(239, 68, 68, 0.95);
  color: white;
  border-color: rgba(239, 68, 68, 0.3);
}

.notification-warning {
  background: rgba(245, 158, 11, 0.95);
  color: white;
  border-color: rgba(245, 158, 11, 0.3);
}

.notification-info {
  background: rgba(59, 130, 246, 0.95);
  color: white;
  border-color: rgba(59, 130, 246, 0.3);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}


.notification-message {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  transition: background-color 0.2s ease;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.notification-close svg {
  width: 10px;
  height: 10px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .notification-container {
    top: 8px;
    right: 8px;
    left: 8px;
    max-width: none;
  }
  
  .notification {
    padding: 6px 10px;
  }
  
  .notification-message {
    font-size: 12px;
  }
}
</style>