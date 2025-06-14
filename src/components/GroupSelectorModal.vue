<template>
  <div class="group-selector-modal">
    <div class="selector-container">
      <button @click="showModal = true" class="btn btn-group">
        <svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M388.9 597.4c-135.2 0-245.3-110-245.3-245.3s110-245.3 245.3-245.3 245.3 110 245.3 245.3-110.1 245.3-245.3 245.3z m0-405.3c-88.2 0-160 71.8-160 160s71.8 160 160 160 160-71.8 160-160-71.8-160-160-160z" fill="#3688FF"></path><path d="M591.3 981.3H186.5c-76.6 0-138.8-62.3-138.8-138.8V749c0-130.6 106.2-236.9 236.9-236.9h208.8c130.6 0 236.9 106.3 236.9 236.9v93.5c-0.2 76.5-62.4 138.8-139 138.8zM284.5 597.4c-83.6 0-151.5 68-151.5 151.5v93.5c0 29.5 24 53.5 53.5 53.5h404.8c29.5 0 53.5-24 53.5-53.5v-93.5c0-83.6-68-151.5-151.6-151.5H284.5z" fill="#3688FF"></path><path d="M847.2 938.6c-23.6 0-42.7-19.1-42.7-42.7s19.1-42.7 42.7-42.7c29.5 0 53.5-24 53.5-53.5v-93.5c0-83.6-68-151.5-151.6-151.5h-14.3c-19.8 0-37-13.6-41.5-32.9-4.5-19.3 4.8-39.1 22.5-48 54.8-27.3 88.9-82.1 88.9-143.1 0-88.2-71.8-160-160-160-23.6 0-42.7-19.1-42.7-42.7s19.1-42.7 42.7-42.7c135.2 0 245.3 110 245.3 245.3 0 57.8-19.9 111.9-54.9 154.8 88.3 34.6 151 120.6 151 220.9v93.5c0 76.6-62.3 138.8-138.9 138.8z" fill="#5F6379"></path></g></svg>
       {{ selectedGroupName }}
      </button>
      <button 
        v-if="modelValue && shouldShowWhatsAppButton(modelValue)"
        @click="shareOnWhatsApp" 
        class="btn btn-share-mini"
        title="Compartir grupo"
      >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 13L20 18C20 19.1046 19.1046 20 18 20L6 20C4.89543 20 4 19.1046 4 18L4 13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M16 8L12 4M12 4L8 8M12 4L12 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
      </button>
    </div>
    
    <!-- Modal compacto usando BaseModal -->
    <BaseModal :show="showModal" @close="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Selecciona el grupo activo</h3>
          <div class="action-buttons">
            <button 
              @click="createNewGroup" 
              class="btn btn-create-group"
              title="Crear un nuevo grupo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Crear grupo nuevo
            </button>
            <button 
              v-if="modelValue && shouldShowWhatsAppButton(modelValue)"
              @click="shareOnWhatsApp" 
              class="btn btn-whatsapp-small"
              title="Compartir grupo en WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px;">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386"/>
              </svg>
              Compartir grupo activo
            </button>
          </div>
        </div>
        
        <div class="groups-list">
          <div 
            v-if="canViewAllTransactions"
            @click="selectGroup(null)" 
            :class="['group-item', { 'selected': !selectedGroup }]"
          >
            <div class="group-icon-container all-groups">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div class="group-info">
              <span class="group-name">Todas las transacciones</span>
              <span class="group-desc">Sin filtro de grupo</span>
            </div>
            <div v-if="!selectedGroup" class="check-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
          </div>
          
          <div 
            v-for="group in availableGroups" 
            :key="group.id"
            @click="selectGroup(group)"
            :class="['group-item', { 'selected': selectedGroup?.id === group.id }]"
          >
            <div class="group-icon-container">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <span class="group-desc">{{ group.members?.length || 0 }} {{ group.members?.length === 1 ? 'miembro' : 'miembros' }}</span>
            </div>
            <div v-if="selectedGroup?.id === group.id" class="check-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { useNotifications } from '@/composables/useNotifications.js'

const props = defineProps(['modelValue', 'availableGroups', 'currentUser'])
const emit = defineEmits(['update:modelValue', 'generate-invite-code', 'create-group', 'create-group-for-sharing'])

const { addNotification, clearNotificationsByMessage } = useNotifications()
const showModal = ref(false)
const selectedGroup = ref(props.modelValue)

// Sincronizar con props cuando cambien externamente
watch(() => props.modelValue, (newValue) => {
  selectedGroup.value = newValue
})

const canViewAllTransactions = computed(() => {
  return props.currentUser?.role === 'admin' || props.currentUser?.role === 'superadmin'
})

const selectedGroupName = computed(() => {
  if (props.modelValue) {
    return `Grupo activo: ${props.modelValue.name}`
  }
})

const selectGroup = (group) => {
  selectedGroup.value = group
  emit('update:modelValue', group)
  closeModal()
}

const closeModal = () => {
  showModal.value = false
  // Limpiar notificaciones relacionadas con grupos cuando se cierra el modal
  clearNotificationsByMessage('Mis finanzas')
  clearNotificationsByMessage('códigos permiten')
  clearNotificationsByMessage('Enlace compartido')
}

// Función para verificar si se puede compartir el grupo
const canShareGroup = (group) => {
  if (!group || !props.currentUser) return false
  
  // No se puede compartir el grupo "Mis finanzas"
  if (group.name === 'Mis finanzas') return false
  
  // Solo el admin del grupo puede compartir
  const member = group.members?.find(m => m.id === props.currentUser.id)
  return member?.role === 'admin' || props.currentUser.role === 'admin' || props.currentUser.role === 'superadmin'
}

// Función para verificar si se debe mostrar el botón de WhatsApp
const shouldShowWhatsAppButton = (group) => {
  if (!group || !props.currentUser) return false
  
  // Mostrar para "Mis finanzas" y para grupos compartibles
  if (group.name === 'Mis finanzas') {
    return true
  }
  
  // Para otros grupos, verificar permisos normalmente
  return canShareGroup(group)
}

// Función para compartir en WhatsApp
const shareOnWhatsApp = () => {
  if (!props.modelValue) return
  
  const group = props.modelValue
  
  // Manejar grupo "Mis finanzas" de manera especial
  if (group.name === 'Mis finanzas') {
    // Abrir el modal de crear grupo para compartir
    closeModal()
    emit('create-group-for-sharing')
    // Mostrar la notificación después de un pequeño delay para asegurar que se vea
    setTimeout(() => {
      addNotification('"Mis finanzas" es personal. Te recomendamos crear un nuevo grupo para compartir.', 'info', 4000)
    }, 100)
    return
  }
  
  // Verificar si el código ha expirado o alcanzó el límite
  if (group.inviteCode) {
    // Verificar expiración
    if (group.inviteCodeCreatedAt) {
      const createdAt = new Date(group.inviteCodeCreatedAt)
      const now = new Date()
      const hoursDiff = (now - createdAt) / (1000 * 60 * 60)
      
      if (hoursDiff > (group.inviteCodeExpiresIn || 3)) {
        // Código expirado, generar uno nuevo
        emit('generate-invite-code', group.id)
        setTimeout(() => {
          showLimitNotification()
          openWhatsApp()
        }, 100)
        return
      }
    }
    
    // Verificar límite de usos
    if ((group.inviteCodeUsedCount || 0) >= (group.inviteCodeMaxUses || 5)) {
      // Límite alcanzado, generar uno nuevo
      emit('generate-invite-code', group.id)
      setTimeout(() => {
        showLimitNotification()
        openWhatsApp()
      }, 100)
      return
    }
  }
  
  // Generar código si no existe
  if (!group.inviteCode) {
    emit('generate-invite-code', group.id)
    setTimeout(() => {
      showLimitNotification()
      openWhatsApp()
    }, 1000)
  } else {
    setTimeout(() => {
      showLimitNotification()
      openWhatsApp()
    }, 1000)
  }
}

// Función para mostrar notificación sobre límites
const showLimitNotification = () => {
  const group = props.modelValue
  const usesLeft = (group.inviteCodeMaxUses || 5) - (group.inviteCodeUsedCount || 0)
  
  // Calcular tiempo restante
  let timeLeft = ''
  if (group.inviteCodeCreatedAt) {
    const createdAt = new Date(group.inviteCodeCreatedAt)
    const expiresAt = new Date(createdAt.getTime() + (group.inviteCodeExpiresIn || 3) * 60 * 60 * 1000)
    const now = new Date()
    const hoursLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60)))
    timeLeft = hoursLeft > 0 ? ` (${hoursLeft}h restantes)` : ''
  }
  
  addNotification(`Enlace compartido: ${usesLeft} usos disponibles${timeLeft}`, 'info', 6000)
}

const openWhatsApp = () => {
  const group = props.modelValue
  if (!group || !group.inviteCode) return
  
  const message = `Participá en mi grupo https://budge-manager.netlify.app/?groupCode=${group.inviteCode}`
  const encodedMessage = encodeURIComponent(message)
  
  // Detectar si es dispositivo móvil
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (isMobile) {
    // Detectar sistema operativo
    const isAndroid = /Android/i.test(navigator.userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    
    // URLs específicas para cada plataforma
    let whatsappAppUrl
    if (isAndroid) {
      // Android: usar intent específico para WhatsApp normal
      whatsappAppUrl = `intent://send?text=${encodedMessage}#Intent;scheme=whatsapp;package=com.whatsapp;end`
    } else if (isIOS) {
      // iOS: usar esquema de WhatsApp
      whatsappAppUrl = `whatsapp://send?text=${encodedMessage}`
    } else {
      // Otros móviles
      whatsappAppUrl = `whatsapp://send?text=${encodedMessage}`
    }
    
    // Solo intentar abrir la app, sin fallbacks automáticos
    try {
      window.location.href = whatsappAppUrl
    } catch (error) {
      console.log('Error abriendo WhatsApp:', error)
    }
  } else {
    // En desktop, usar siempre WhatsApp Web
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }
}

// Función para crear nuevo grupo
const createNewGroup = () => {
  closeModal()
  emit('create-group-for-sharing')
}

// Función para obtener el nombre del grupo activo
const getActiveGroupName = () => {
  if (!props.modelValue) {
    return 'Ninguno'
  }
  return props.modelValue.name
}
</script>

<style scoped>
.group-selector-modal {
  position: relative;
  width: 100%;
  flex: 1;
  min-width: 0;
}

.selector-container {
  display: flex;
  gap: 4px;
  width: 100%;
  align-items: stretch;
}

.btn-group {
  border-color: #6b7280;
  background: #f3f4f6;
  color: #374151;
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-group:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.modal-content {
  max-width: 200px;
  width: auto;
  min-width: 180px;
}

.modal-header {
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}


.modal-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.modal-subtitle {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 400;
  line-height: 1.4;
}

.groups-list {
  max-height: 240px;
  overflow-y: auto;
  padding: 0;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin-bottom: 3px;
  border: 1px solid transparent;
  position: relative;
}

.group-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.group-item.selected {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.3);
}

.group-icon-container {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
  color: #64748b;
}

.group-icon-container.all-groups {
  background: #f0f9ff;
  color: #0ea5e9;
}

.group-icon-container svg {
  width: 12px;
  height: 12px;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.group-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.group-desc {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.1;
}

.check-icon {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 6px;
}

.check-icon svg {
  width: 8px;
  height: 8px;
}

.btn-whatsapp-small {
  background: #25d366;
  color: white;
  border: 1px solid #25d366;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  justify-content: center;
}

.btn-whatsapp-small:hover {
  background: #128c7e;
  border-color: #128c7e;
}

.btn-create-group {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  justify-content: center;
}

.btn-create-group:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-share-mini {
  background: #25d366;
  color: white;
  border: 1px solid #25d366;
  border-radius: 4px;
  padding: 2px;
  width: 32px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: none;
}

.btn-share-mini svg {
  width: 22px;
}

.btn-share-mini path {
  stroke: #fff;
}

.btn-share-mini:hover {
  background: #128c7e;
  border-color: #128c7e;
  transform: scale(1.05);
}

@media (max-width: 480px) {
  .btn-group {
    font-size: 11px !important;
    padding: 8px 6px !important;
    gap: 4px !important;
  }
  
  .btn-group svg {
    width: 14px !important;
    height: 14px !important;
  }

  .modal-content {
    max-width: 100%;
  }
  
  .header-icon {
    width: 44px;
    height: 44px;
  }
  
  .header-icon svg {
    width: 22px;
    height: 22px;
  }
  
  .modal-header h3 {
    font-size: 18px;
  }
  
  .modal-subtitle {
    font-size: 13px;
  }
  
  .group-item {
    padding: 16px 12px;
  }
  
  .group-icon-container {
    width: 32px;
    height: 32px;
  }
  
  .group-icon-container svg {
    width: 16px;
    height: 16px;
  }
  
  .group-name {
    font-size: 14px;
  }
  
  .group-desc {
    font-size: 12px;
  }
  
  .check-icon {
    width: 18px;
    height: 18px;
  }
  
  .check-icon svg {
    width: 10px;
    height: 10px;
  }
  
  .btn-share-mini {
    width: 28px;
    height: 32px;
    padding: 1px;
    min-width: unset;
  }
  
  .btn-share-mini svg {
    width: 14px !important;
    height: 14px !important;
  }
}
</style>