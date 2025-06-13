<template>
  <BaseModal :show="show" @close="$emit('close')" class="group-modal">
    <div class="group-manager">
      <h2>Gestión de Grupos</h2>
      
      <!-- Crear nuevo grupo -->
      <div class="create-section">
        <h3>Crear Nuevo Grupo</h3>
        <form @submit.prevent="createGroup" class="create-form">
          <BaseInput
            v-model="newGroup.name"
            label="Nombre del Grupo"
            placeholder="Ej: Gastos de Casa, Viaje a Madrid..."
            required
          />
          <BaseInput
            v-model="newGroup.description"
            label="Descripción (opcional)"
            placeholder="Descripción del grupo..."
          />
          <div class="form-actions">
            <BaseButton type="submit" :disabled="!newGroup.name">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m22 21-3-3m3 3v-3m0 3h-3"/>
              </svg>
              Crear Grupo
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Lista de grupos existentes -->
      <div class="groups-section">
        <h3>Mis Grupos</h3>
        <div v-if="userGroups.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="m22 21-3-3m3 3v-3m0 3h-3"/>
          </svg>
          <p>No tienes grupos creados aún</p>
          <small>Crea tu primer grupo para compartir gastos</small>
        </div>
        
        <div v-else class="groups-list">
          <div v-for="group in userGroups" :key="group.id" class="group-card">
            <div class="group-info">
              <div class="group-header">
                <h4>{{ group.name }}</h4>
                <span class="member-count">{{ group.members.length }} miembros</span>
              </div>
              <p v-if="group.description" class="group-description">{{ group.description }}</p>
              <div class="group-meta">
                <span class="created-by">Creado por: {{ group.createdBy }}</span>
                <span class="created-date">{{ formatDate(group.createdAt) }}</span>
              </div>
            </div>
            
            <div class="group-actions">
              <button @click="copyInviteLink(group)" class="action-btn invite-btn" title="Copiar link de invitación">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </button>
              
              <button @click="viewGroupDetails(group)" class="action-btn view-btn" title="Ver detalles">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              
              <button 
                v-if="group.createdBy === currentUser.username" 
                @click="deleteGroup(group)" 
                class="action-btn delete-btn" 
                title="Eliminar grupo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalles del grupo -->
      <BaseModal :show="showGroupDetails" @close="showGroupDetails = false">
        <div v-if="selectedGroup" class="group-details">
          <h2>{{ selectedGroup.name }}</h2>
          <p v-if="selectedGroup.description">{{ selectedGroup.description }}</p>
          
          <div class="members-section">
            <h3>Miembros ({{ selectedGroup.members.length }})</h3>
            <div class="members-list">
              <div v-for="member in selectedGroup.members" :key="member.id" class="member-item">
                <svg class="member-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>{{ member.username }}</span>
                <span v-if="member.username === selectedGroup.createdBy" class="creator-badge">Creador</span>
              </div>
            </div>
          </div>
          
          <div class="invite-section">
            <h3>Invitar al Grupo</h3>
            <div class="invite-link-container">
              <input 
                :value="getInviteLink(selectedGroup)" 
                readonly 
                class="invite-link-input"
                ref="inviteLinkInput"
              />
              <button @click="copyInviteLink(selectedGroup)" class="copy-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copiar
              </button>
            </div>
            <small class="invite-help">Comparte este link para que otros puedan unirse al grupo</small>
          </div>
        </div>
      </BaseModal>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'
import { useNotifications } from '@/composables/useNotifications.js'
import { useConfirm } from '@/composables/useConfirm.js'

const props = defineProps(['show', 'currentUser', 'groups'])
const emit = defineEmits(['close', 'create-group', 'delete-group'])

// Notificaciones
const { addNotification } = useNotifications()

// Confirmaciones
const { confirm } = useConfirm()

const newGroup = ref({
  name: '',
  description: ''
})

const showGroupDetails = ref(false)
const selectedGroup = ref(null)

const userGroups = computed(() => {
  return props.groups.filter(group => 
    group.members.some(member => member.id === props.currentUser.id)
  )
})

const createGroup = () => {
  if (!newGroup.value.name) return
  
  const group = {
    id: `group_${Date.now()}`,
    name: newGroup.value.name,
    description: newGroup.value.description,
    createdBy: props.currentUser.username,
    createdAt: new Date().toISOString(),
    members: [{
      id: props.currentUser.id,
      username: props.currentUser.username,
      role: 'creator'
    }],
    inviteCode: generateInviteCode()
  }
  
  emit('create-group', group)
  
  // Reset form
  newGroup.value = {
    name: '',
    description: ''
  }
}

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const getInviteLink = (group) => {
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?invite=${group.inviteCode}`
}

const copyInviteLink = async (group) => {
  const link = getInviteLink(group)
  try {
    await navigator.clipboard.writeText(link)
    addNotification('¡Link de invitación copiado al portapapeles!', 'success')
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = link
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    addNotification('¡Link de invitación copiado!', 'success')
  }
}

const viewGroupDetails = (group) => {
  selectedGroup.value = group
  showGroupDetails.value = true
}

const deleteGroup = async (group) => {
  const confirmed = await confirm({
    title: 'Eliminar Grupo',
    message: `¿Estás seguro de que quieres eliminar el grupo "${group.name}"?`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    type: 'danger'
  })
  
  if (confirmed) {
    emit('delete-group', group.id)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
.group-manager {
  max-width: 600px;
  width: 100%;
}

.create-section, .groups-section {
  margin-bottom: 32px;
}

.create-section h3, .groups-section h3 {
  margin-bottom: 16px;
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.form-actions {
  margin-top: 8px;
}

.btn-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #94a3b8;
  margin: 0 auto 16px;
}

.empty-state p {
  margin: 0 0 8px 0;
  color: #64748b;
  font-weight: 600;
}

.empty-state small {
  color: #94a3b8;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.group-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.group-info {
  flex: 1;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.group-header h4 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
}

.member-count {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.group-description {
  margin: 0 0 12px 0;
  color: #64748b;
  font-size: 14px;
}

.group-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #94a3b8;
}

.group-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.invite-btn:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.view-btn:hover {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #22c55e;
}

.delete-btn:hover {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

.group-details {
  max-width: 500px;
}

.group-details h2 {
  margin-bottom: 16px;
  color: #1e293b;
}

.members-section, .invite-section {
  margin-top: 24px;
}

.members-section h3, .invite-section h3 {
  margin-bottom: 12px;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.member-icon {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.creator-badge {
  margin-left: auto;
  background: #fbbf24;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.invite-link-container {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.invite-link-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  font-family: monospace;
  font-size: 14px;
  color: #64748b;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: #334155;
  transform: translateY(-1px);
}

.copy-btn svg {
  width: 16px;
  height: 16px;
}

.invite-help {
  color: #94a3b8;
  font-style: italic;
}

@media (max-width: 640px) {
  .group-card {
    flex-direction: column;
    gap: 16px;
  }
  
  .group-actions {
    margin-left: 0;
    justify-content: flex-end;
  }
  
  .group-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .invite-link-container {
    flex-direction: column;
  }
  
  .copy-btn {
    align-self: flex-start;
  }
}
</style>