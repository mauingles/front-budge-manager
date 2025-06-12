<template>
  <BaseModal :show="show" @close="$emit('close')">
    <div class="group-management">
      <h2>Gestión de Equipos</h2>
      
      <!-- Tabs -->
      <div class="tabs">
        <button 
          :class="['tab', { active: activeTab === 'create' }]"
          @click="activeTab = 'create'"
        >
          Crear Equipo
        </button>
        <button 
          :class="['tab', { active: activeTab === 'join' }]"
          @click="activeTab = 'join'"
        >
          Unirse a Equipo
        </button>
        <button 
          :class="['tab', { active: activeTab === 'invite' }]"
          @click="activeTab = 'invite'"
        >
          Invitar a Equipo
        </button>
        <button 
          :class="['tab', { active: activeTab === 'manage' }]"
          @click="activeTab = 'manage'"
        >
          Mis Equipos
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        
        <!-- Crear Equipo -->
        <div v-if="activeTab === 'create'" class="create-group">
          <form @submit.prevent="createGroup" class="form">
            <div class="field">
              <label>Nombre del Equipo</label>
              <BaseInput 
                v-model="newGroupName" 
                placeholder="Ej: Familia, Trabajo, Amigos..."
                required
              />
            </div>
            <div class="field">
              <label>Descripción (opcional)</label>
              <BaseInput 
                v-model="newGroupDescription" 
                placeholder="Descripción del equipo..."
              />
            </div>
            <BaseButton type="submit" :disabled="!newGroupName.trim()">
              Crear Equipo
            </BaseButton>
          </form>
        </div>

        <!-- Unirse a Equipo -->
        <div v-if="activeTab === 'join'" class="join-group">
          <form @submit.prevent="joinGroup" class="form">
            <div class="field">
              <label>Código de Invitación</label>
              <BaseInput 
                v-model="inviteCode" 
                placeholder="Ingresa el código de invitación"
                required
              />
              <small>Pide el código de invitación al administrador del equipo</small>
            </div>
            <BaseButton type="submit" :disabled="!inviteCode.trim()">
              Unirse al Equipo
            </BaseButton>
          </form>
        </div>

        <!-- Invitar a Equipo -->
        <div v-if="activeTab === 'invite'" class="invite-users">
          
          <!-- Selector de Grupo -->
          <div class="field">
            <label>Seleccionar Equipo</label>
            <select v-model="selectedGroupForInvite" class="select" required>
              <option value="">Selecciona un equipo...</option>
              <option 
                v-for="group in ownedGroups" 
                :key="group.id" 
                :value="group"
              >
                {{ group.name }}
              </option>
            </select>
          </div>

          <!-- Información del equipo seleccionado -->
          <div v-if="selectedGroupForInvite" class="group-info">
            <div class="invite-message">
              <label>Mensaje de Invitación:</label>
              <div class="invitation-text">
                Te invito a participar en la app <strong>BUDGET MANAGER</strong> de mi equipo <strong>"{{ selectedGroupForInvite.name }}"</strong>, utilizando este código <span v-if="selectedGroupForInvite.inviteCode" class="code-inline clickable-code" @click="copyCode" title="Copiar código">{{ selectedGroupForInvite.inviteCode }}</span><span v-else class="no-code-inline">sin código activo</span>
              </div>
              <div v-if="selectedGroupForInvite.inviteCode" class="code-actions">
                <button 
                  type="button" 
                  @click="copyInvitationMessage" 
                  class="copy-invitation-btn"
                  title="Copiar mensaje completo"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  Copiar invitación
                </button>
                <button 
                  type="button" 
                  @click="generateNewInviteCode" 
                  class="refresh-btn"
                  title="Actualizar código"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polyline points="23,4 23,10 17,10"/>
                    <polyline points="1,20 1,14 7,14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64l1.27 1.27"/>
                    <path d="M3.51 15a9 9 0 0 0 14.85 3.36l-1.27-1.27"/>
                  </svg>
                  Actualizar código
                </button>
              </div>
              <div v-else class="no-code">
                <button 
                  type="button" 
                  @click="generateNewInviteCode" 
                  class="generate-btn"
                  title="Generar código"
                >
                  Generar Código
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Mis Equipos -->
        <div v-if="activeTab === 'manage'" class="manage-groups">
          
          <div v-if="allUserGroups.length === 0" class="no-groups">
            <p>No perteneces a ningún equipo todavía.</p>
          </div>
          
          <div v-else class="groups-list">
            <div 
              v-for="group in allUserGroups" 
              :key="group.id"
              :class="['group-card', { 'hidden-card': isGroupHidden(group) }]"
            >
              <div class="group-header">
                <h4 class="group-name">{{ group.name }}</h4>
                <div class="group-actions">
                  <!-- Botón Ocultar/Mostrar - SIEMPRE disponible -->
                  <button 
                    v-if="isGroupHidden(group)"
                    @click="unhideGroup(group.id)"
                    class="unhide-group-btn"
                    title="Mostrar equipo"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px; height: 14px; margin-right: 4px;">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Mostrar
                  </button>
                  <button 
                    v-else
                    @click="hideGroup(group.id)"
                    class="hide-group-btn"
                    title="Ocultar equipo"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px; height: 14px; margin-right: 4px;">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                    Ocultar
                  </button>
                  
                  <!-- Botón Eliminar (solo creadores y cuando NO está oculto) -->
                  <button 
                    v-if="isGroupCreator(group) && !isGroupHidden(group)"
                    @click="deleteGroup(group.id)"
                    class="delete-group-btn"
                    title="Eliminar equipo"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px; height: 14px; margin-right: 4px;">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    Eliminar
                  </button>
                  
                  <!-- Botón Salir (solo miembros no creadores y cuando NO está oculto) -->
                  <button 
                    v-if="!isGroupCreator(group) && !isGroupHidden(group)"
                    @click="leaveGroup(group.id)"
                    class="leave-group-btn"
                    title="Salir del equipo"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px; height: 14px; margin-right: 4px;">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Salir
                  </button>
                </div>
              </div>
              
              <div class="group-details">
                <div class="group-stats">
                  <span 
                    class="member-count clickable" 
                    @click="showMembersDetail(group)"
                    title="Ver detalles de miembros"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px; height: 14px; margin-right: 4px; display: inline;">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {{ group.members.length }} miembros
                  </span>
                  <span class="group-role">{{ getMyRoleInGroup(group) }}</span>
                  <span v-if="isGroupHidden(group)" class="hidden-badge">Oculto</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <!-- Mensajes -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </div>
  </BaseModal>

  <!-- Modal de Detalles de Miembros -->
  <BaseModal :show="showMembersModal" @close="closeMembersModal">
    <div class="members-detail-modal">
      <h3>Miembros de "{{ selectedGroupForMembers?.name }}"</h3>
      
      <div class="members-detail-list">
        <div 
          v-for="member in selectedGroupForMembers?.members" 
          :key="member.id"
          class="member-detail-item"
        >
          <div class="member-info">
            <div class="member-data">
              <h4 class="member-name">{{ member.username }}</h4>
              <span :class="['member-role-badge', member.role]">
                {{ member.role === 'admin' ? 'Administrador' : 'Invitado' }}
              </span>
            </div>
          </div>
          
          <div class="member-actions" v-if="canManageMember(member, selectedGroupForMembers)">
            <button 
              v-if="canRemoveMember(member)"
              @click="removeMemberFromDetail(selectedGroupForMembers.id, member.id)"
              class="remove-member-btn"
              title="Remover del equipo"
            >
              ✕ Remover
            </button>
          </div>
        </div>
      </div>
      
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'
import { useConfirm } from '@/composables/useConfirm.js'

const props = defineProps(['show', 'currentUser', 'userGroups', 'allGroups', 'allUsers'])
const emit = defineEmits(['close', 'create-group', 'join-group', 'remove-member', 'generate-new-code', 'leave-group', 'delete-group', 'hide-group', 'unhide-group'])

// Confirmaciones
const { confirm } = useConfirm()

// Estado
const activeTab = ref('create')
const newGroupName = ref('')
const newGroupDescription = ref('')
const inviteCode = ref('')
const selectedGroupForInvite = ref('')
const message = ref('')
const messageType = ref('success')
const showMembersModal = ref(false)
const selectedGroupForMembers = ref(null)

// Computadas
const ownedGroups = computed(() => {
  if (!props.currentUser || !props.userGroups) return []
  
  return props.userGroups.filter(group => {
    const member = group.members.find(m => m.id === props.currentUser.id)
    return member?.role === 'admin' || props.currentUser.role === 'admin' || props.currentUser.role === 'superadmin'
  })
})

const visibleGroups = computed(() => {
  if (!props.currentUser || !props.userGroups) return []
  
  return props.userGroups.filter(group => {
    // Check if group is hidden for current user
    const isHidden = group.hiddenFor && group.hiddenFor.includes(props.currentUser.id)
    return !isHidden
  })
})

const allUserGroups = computed(() => {
  if (!props.currentUser || !props.allGroups) return []
  
  return props.allGroups.filter(group => {
    const isMember = group.members.some(member => member.id === props.currentUser.id)
    
    // Admins and SuperAdmins see all groups
    if (props.currentUser.role === 'admin' || props.currentUser.role === 'superadmin') {
      return true
    }
    
    // Regular users only see groups where they are members
    return isMember
  })
})

const isGroupHidden = (group) => {
  if (!props.currentUser || !group.hiddenFor) return false
  return group.hiddenFor.includes(props.currentUser.id)
}

// Métodos
const createGroup = () => {
  if (!newGroupName.value.trim()) return
  
  const groupData = {
    name: newGroupName.value.trim(),
    description: newGroupDescription.value.trim(),
    createdBy: props.currentUser.id
  }
  
  emit('create-group', groupData)
  
  // Reset form
  newGroupName.value = ''
  newGroupDescription.value = ''
  showMessage('Equipo creado exitosamente', 'success')
}

const joinGroup = () => {
  if (!inviteCode.value.trim()) return
  
  emit('join-group', inviteCode.value.trim())
  inviteCode.value = ''
}

const copyInvitationMessage = async () => {
  try {
    const message = `Te invito a participar en la app BUDGET MANAGER de mi equipo "${selectedGroupForInvite.value.name}", utilizando este código ${selectedGroupForInvite.value.inviteCode}`
    await navigator.clipboard.writeText(message)
    showMessage('Mensaje de invitación copiado al portapapeles', 'success')
  } catch (err) {
    showMessage('Error al copiar mensaje', 'error')
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(selectedGroupForInvite.value.inviteCode)
    showMessage('Código copiado al portapapeles', 'success')
  } catch (err) {
    showMessage('Error al copiar código', 'error')
  }
}

const canRemoveMember = (member) => {
  if (!props.currentUser) return false
  
  // No puede removerse a sí mismo
  if (member.id === props.currentUser.id) return false
  
  // Admins globales pueden remover cualquiera
  if (props.currentUser.role === 'admin' || props.currentUser.role === 'superadmin') return true
  
  // Admin del equipo puede remover miembros normales
  const currentUserMember = selectedGroupForInvite.value.members.find(m => m.id === props.currentUser.id)
  return currentUserMember?.role === 'admin' && member.role !== 'admin'
}

const generateNewInviteCode = () => {
  emit('generate-new-code', selectedGroupForInvite.value.id)
  showMessage('Nuevo código generado', 'success')
}

const removeMember = (memberId) => {
  emit('remove-member', {
    groupId: selectedGroupForInvite.value.id,
    memberId
  })
  showMessage('Miembro removido del equipo', 'success')
}

const isGroupCreator = (group) => {
  if (!props.currentUser) return false
  return group.createdBy === props.currentUser.id
}

const getMyRoleInGroup = (group) => {
  if (!props.currentUser) return 'Miembro'
  const member = group.members.find(m => m.id === props.currentUser.id)
  return member?.role === 'admin' ? 'Administrador' : 'Miembro'
}

const leaveGroup = async (groupId) => {
  try {
    const group = props.allGroups.find(g => g.id === groupId)
    if (!group) return
    
    const confirmed = await confirm({
      title: 'Salir del Equipo',
      message: `¿Estás seguro de que quieres salir del equipo "${group.name}"?`,
      confirmText: 'Salir',
      cancelText: 'Cancelar',
      type: 'danger'
    })
    
    if (confirmed) {
      emit('leave-group', groupId)
      showMessage(`Has salido del equipo "${group.name}"`, 'success')
    }
  } catch (error) {
    console.error('Error al salir del equipo:', error)
    showMessage('Error al salir del equipo', 'error')
  }
}

const hideGroup = async (groupId) => {
  try {
    const group = props.allGroups.find(g => g.id === groupId)
    if (!group) return
    
    const confirmed = await confirm({
      title: 'Ocultar Equipo',
      message: `¿Estás seguro de que quieres ocultar el equipo "${group.name}"? El equipo seguirá existiendo pero no será visible para ti.`,
      confirmText: 'Ocultar',
      cancelText: 'Cancelar',
      type: 'info'
    })
    
    if (confirmed) {
      emit('hide-group', groupId)
      showMessage(`Equipo "${group.name}" ocultado`, 'success')
    }
  } catch (error) {
    console.error('Error al ocultar equipo:', error)
    showMessage('Error al ocultar el equipo', 'error')
  }
}

const unhideGroup = async (groupId) => {
  try {
    const group = props.allGroups.find(g => g.id === groupId)
    if (!group) return
    
    const confirmed = await confirm({
      title: 'Mostrar Equipo',
      message: `¿Estás seguro de que quieres mostrar el equipo "${group.name}"?`,
      confirmText: 'Mostrar',
      cancelText: 'Cancelar',
      type: 'info'
    })
    
    if (confirmed) {
      emit('unhide-group', groupId)
      showMessage(`Equipo "${group.name}" ahora es visible`, 'success')
    }
  } catch (error) {
    console.error('Error al mostrar equipo:', error)
    showMessage('Error al mostrar el equipo', 'error')
  }
}

const deleteGroup = async (groupId) => {
  try {
    const group = props.allGroups.find(g => g.id === groupId)
    if (!group) return
    
    const confirmed = await confirm({
      title: 'Eliminar Equipo',
      message: `¿Estás seguro de que quieres eliminar el equipo "${group.name}"? Esta acción no se puede deshacer y se eliminarán todas las transacciones del equipo.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    })
    
    if (confirmed) {
      emit('delete-group', groupId)
      showMessage(`Equipo "${group.name}" eliminado`, 'success')
    }
  } catch (error) {
    console.error('Error al eliminar equipo:', error)
    showMessage('Error al eliminar el equipo', 'error')
  }
}

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// Funciones del modal de miembros
const showMembersDetail = (group) => {
  selectedGroupForMembers.value = group
  showMembersModal.value = true
}

const closeMembersModal = () => {
  showMembersModal.value = false
  selectedGroupForMembers.value = null
}

const canManageMember = (member, group) => {
  if (!props.currentUser || !group) return false
  
  // No puede gestionar a sí mismo
  if (member.id === props.currentUser.id) return false
  
  // Admins globales pueden gestionar cualquiera
  if (props.currentUser.role === 'admin' || props.currentUser.role === 'superadmin') return true
  
  // Admin del equipo puede gestionar miembros normales
  const currentUserMember = group.members.find(m => m.id === props.currentUser.id)
  return currentUserMember?.role === 'admin' && member.role !== 'admin'
}

const removeMemberFromDetail = async (groupId, memberId) => {
  try {
    const member = selectedGroupForMembers.value.members.find(m => m.id === memberId)
    if (!member) return
    
    const confirmed = await confirm({
      title: 'Remover Miembro',
      message: `¿Estás seguro de que quieres remover a "${member.username}" del equipo?`,
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      type: 'danger'
    })
    
    if (confirmed) {
      emit('remove-member', { groupId, memberId })
      
      // Actualizar la lista local inmediatamente
      selectedGroupForMembers.value.members = selectedGroupForMembers.value.members.filter(m => m.id !== memberId)
      
      showMessage(`Miembro "${member.username}" removido del equipo`, 'success')
      
      // Si no quedan miembros, cerrar el modal
      if (selectedGroupForMembers.value.members.length === 0) {
        closeMembersModal()
      }
    }
  } catch (error) {
    console.error('Error al remover miembro:', error)
    showMessage('Error al remover el miembro', 'error')
  }
}

// Exponer método para mostrar mensajes desde el componente padre
defineExpose({ showMessage })
</script>

<style scoped>
.group-management {
  width: auto;
  min-width: 300px;
  max-width: 400px;
  max-height: 75vh;
  margin: 0;
  padding: 12px 4px 4px 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-content {
  min-height: 120px;
  max-height: calc(75vh - 80px);
  border-radius: 4px;
  overflow: hidden;
  overflow-y: auto;
  flex: 1;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 8px;
}

.tab {
  flex: 1;
  padding: 6px 8px;
  border: none;
  background: none;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  font-size: 11px;
}

.tab:hover {
  color: #374151;
  background: #f9fafb;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}


.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

small {
  color: #6b7280;
  font-size: 12px;
}

.group-info {
  margin-top: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.invite-message {
  margin-bottom: 0;
}

.invitation-text {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px;
  margin: 8px 0;
  font-size: 13px;
  line-height: 1.4;
  color: #374151;
}

.code-inline {
  background: #f3f4f6;
  color: #374151;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  letter-spacing: 1px;
  border: 1px solid #e5e7eb;
}

.clickable-code {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-code:hover {
  background: #f3f4f6;
  color: #3b82f6;
  border-color: #cbd5e1;
}

.no-code-inline {
  background: #fee2e2;
  color: #991b1b;
  padding: 2px 6px;
  border-radius: 4px;
  font-style: italic;
}

.code-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: center;
}

.code-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.code {
  background: #1f2937;
  color: #f9fafb;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  letter-spacing: 1px;
}

.copy-invitation-btn {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.copy-invitation-btn:hover {
  background: #f3f4f6;
  color: #3b82f6;
}

.copy-invitation-btn svg {
  width: 14px;
  height: 14px;
}


.refresh-btn {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: #f3f4f6;
  color: #3b82f6;
}

.refresh-btn svg {
  width: 14px;
  height: 14px;
}

.no-code {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
}

.no-code-text {
  color: #6b7280;
  font-style: italic;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 4px;
  border: 1px dashed #d1d5db;
}

.generate-btn {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.generate-btn:hover {
  background: #d97706;
}

.members-list h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 16px;
}

.members {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.member-name {
  font-weight: 600;
  color: #374151;
}

.member-role {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.member-role.admin {
  background: #fef3c7;
  color: #92400e;
}

.member-role.member {
  background: #e0f2fe;
  color: #0277bd;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #dc2626;
}

.message {
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
}

.message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

h2 {
  text-align: center;
  margin-bottom: 8px;
  color: #374151;
  font-size: 1.1rem;
}

h3 {
  margin-bottom: 6px;
  color: #374151;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .group-management {
    min-width: 300px;
    margin: 0;
    padding: 20px 6px 6px 6px;
  }
  
  .tab {
    padding: 6px 8px;
    font-size: 12px;
  }
}

.no-groups {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.group-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px;
  transition: all 0.2s ease;
}

.group-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.group-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.group-name {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
}

.group-actions {
  display: flex;
  gap: 4px;
}

.delete-group-btn, .leave-group-btn, .hide-group-btn, .unhide-group-btn {
  padding: 3px 6px;
  border: none;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hide-group-btn {
  background: #e0f2fe;
  color: #0277bd;
}

.hide-group-btn:hover {
  background: #b3e5fc;
  transform: translateY(-1px);
}

.unhide-group-btn {
  background: #e8f5e8;
  color: #2e7d32;
}

.unhide-group-btn:hover {
  background: #c8e6c9;
  transform: translateY(-1px);
}

.groups-section {
  margin-bottom: 24px;
}

.section-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.hidden-section {
  margin-top: 32px;
}

.hidden-card {
  opacity: 0.8;
  border-left: 4px solid #f59e0b;
}

.hidden-badge {
  background: #f59e0b;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.delete-group-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-group-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

.leave-group-btn {
  background: #fef3c7;
  color: #d97706;
}

.leave-group-btn:hover {
  background: #fed7aa;
  transform: translateY(-1px);
}

.group-details {
  margin-bottom: 0;
}

.group-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.member-count {
  color: #6b7280;
}

.member-count.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  padding: 2px 4px;
}

.member-count.clickable:hover {
  background: #f3f4f6;
  color: #3b82f6;
}

.group-role {
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}


@media (max-width: 480px) {
  .group-management {
    min-width: 260px;
    margin: 0;
  }
  
  .group-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .group-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* Estilos del Modal de Detalles de Miembros */
.members-detail-modal {
  width: auto;
  min-width: 260px;
  max-width: 320px;
  padding: 6px;
}

.members-detail-modal h3 {
  margin-bottom: 10px;
  color: #374151;
  font-size: 0.95rem;
  text-align: center;
}

.members-detail-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 250px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.member-detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: #f8fafc;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.member-detail-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.member-info {
  display: flex;
  align-items: center;
}

.member-data {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.member-role-badge {
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
}

.member-role-badge.admin {
  background: #fef3c7;
  color: #92400e;
}

.member-role-badge.member {
  background: #f0f9ff;
  color: #0369a1;
}

.member-actions {
  display: flex;
  gap: 4px;
}

.remove-member-btn {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 3px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-member-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

.members-modal-footer {
  display: flex;
  justify-content: center;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.close-members-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-members-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

@media (max-width: 768px) {
  .members-detail-modal {
    min-width: 240px;
    padding: 4px;
  }
  
  .member-detail-item {
    padding: 6px;
  }
}
</style>