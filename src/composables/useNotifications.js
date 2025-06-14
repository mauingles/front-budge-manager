import { ref } from 'vue'

const notifications = ref([])

export function useNotifications() {
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    }
    
    notifications.value.push(notification)
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }
  
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearNotifications = () => {
    notifications.value = []
  }
  
  const clearNotificationsByType = (type) => {
    notifications.value = notifications.value.filter(n => n.type !== type)
  }
  
  const clearNotificationsByMessage = (messagePattern) => {
    notifications.value = notifications.value.filter(n => !n.message.includes(messagePattern))
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    clearNotificationsByType,
    clearNotificationsByMessage
  }
}