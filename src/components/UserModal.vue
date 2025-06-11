<template>
  <BaseModal :show="show" @close="$emit('close')">
    <div class="user-modal">
      <div class="modal-header">
        <div class="user-profile">
          <div class="user-details">
            <h3>{{ currentUser.username }}</h3>
            <span class="user-email">{{ currentUser.email }}</span>
            <span class="role-badge">{{ getRoleLabel(currentUser.role) }}</span>
          </div>
        </div>
      </div>
      
      <div class="modal-content">
        <div class="user-actions">
          <button 
            @click="showPasswordReset = true" 
            class="action-btn centered-btn"
          >
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Cambiar Mi Contraseña
          </button>
          
          <button 
            v-if="currentUser.role === 'superadmin'" 
            @click="showMasterReset = true" 
            class="action-btn master-btn"
          >
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Reset Contraseña Maestra
          </button>
          
          <button 
            v-if="currentUser.role === 'superadmin'" 
            @click="showUserManagement = true" 
            class="action-btn admin-btn"
          >
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="m22 21-3-3m3 3v-3m0 3h-3"/>
            </svg>
            Gestionar Usuarios
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de cambio de contraseña de usuario -->
    <BaseModal :show="showPasswordReset" @close="showPasswordReset = false">
      <h2 style="text-align: center;">Cambiar Contraseña</h2>
      <form @submit.prevent="handlePasswordChange" class="password-form">
        <BaseInput
          v-model="passwordForm.currentPassword"
          type="password"
          label="Contraseña Actual"
          placeholder="Ingresa tu contraseña actual"
          required
        />
        <BaseInput
          v-model="passwordForm.newPassword"
          type="password"
          label="Nueva Contraseña"
          placeholder="Ingresa tu nueva contraseña"
          required
        />
        <BaseInput
          v-model="passwordForm.confirmPassword"
          type="password"
          label="Confirmar Nueva Contraseña"
          placeholder="Confirma tu nueva contraseña"
          required
        />
        <div class="form-actions">
          <button type="button" @click="showPasswordReset = false" class="cancel-btn">
            Cancelar
          </button>
          <button type="submit" class="submit-btn">
            Cambiar Contraseña
          </button>
        </div>
      </form>
    </BaseModal>
    
    <!-- Modal de reset de contraseña maestra -->
    <MasterPasswordReset 
      :show-modal="showMasterReset"
      :current-password="masterPassword"
      @close="showMasterReset = false"
      @update="$emit('update-master', $event)"
    />
    
    <!-- Modal de gestión de usuarios -->
    <BaseModal :show="showUserManagement" @close="showUserManagement = false">
      <h2>Gestión de Usuarios</h2>
      <div class="users-list">
        <div v-for="user in allUsers" :key="user.id" class="user-item">
          <div class="user-item-info">
            <div class="user-details">
              <span class="user-name">{{ user.username }}</span>
              <span class="user-email">{{ user.email }}</span>
              <span class="user-role-badge" :class="user.role">{{ getRoleDisplay(user.role) }}</span>
            </div>
          </div>
          <div class="user-item-actions">
            <button 
              @click="openResetPassword(user)" 
              class="reset-user-btn"
              :disabled="user.id === currentUser.id"
              :title="user.id === currentUser.id ? 'No puedes resetear tu propia contraseña desde aquí' : 'Resetear contraseña'"
            >
              <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Reset
            </button>
            <button 
              @click="deleteUser(user)" 
              class="delete-user-btn"
              :disabled="user.id === currentUser.id"
              :title="user.id === currentUser.id ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'"
            >
              <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
              </svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
    
    <!-- Modal de reset de contraseña de usuario específico -->
    <BaseModal :show="showUserPasswordReset" @close="showUserPasswordReset = false">
      <h2>Resetear Contraseña de {{ selectedUser?.username }}</h2>
      <form @submit.prevent="handleUserPasswordReset" class="password-form">
        <BaseInput
          v-model="newUserPassword"
          type="password"
          label="Nueva Contraseña"
          placeholder="Ingresa la nueva contraseña"
          required
        />
        <BaseInput
          v-model="confirmUserPassword"
          type="password"
          label="Confirmar Nueva Contraseña"
          placeholder="Confirma la nueva contraseña"
          required
        />
        <div class="form-actions">
          <button type="button" @click="showUserPasswordReset = false" class="cancel-btn">
            Cancelar
          </button>
          <button type="submit" class="submit-btn danger-btn">
            Resetear Contraseña
          </button>
        </div>
      </form>
    </BaseModal>
  </BaseModal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseInput from './BaseInput.vue'
import MasterPasswordReset from './MasterPasswordReset.vue'
import { useNotifications } from '@/composables/useNotifications.js'
import { useConfirm } from '@/composables/useConfirm.js'

const props = defineProps(['show', 'currentUser', 'masterPassword', 'allUsers'])
const emit = defineEmits(['close', 'update-master', 'change-password', 'reset-user-password', 'delete-user'])

// Notificaciones
const { addNotification } = useNotifications()

// Confirmaciones  
const { confirm } = useConfirm()

const showPasswordReset = ref(false)
const showMasterReset = ref(false)
const showUserManagement = ref(false)
const showUserPasswordReset = ref(false)
const selectedUser = ref(null)
const newUserPassword = ref('')
const confirmUserPassword = ref('')

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const getRoleDisplay = (role) => {
  switch(role) {
    case 'superadmin': return 'Super Admin'
    case 'admin': return 'Admin'
    case 'user': return 'Usuario'
    default: return 'Usuario'
  }
}

const getRoleLabel = (role) => {
  switch(role) {
    case 'superadmin': return 'Permisos de: Super Admin'
    case 'admin': return 'Permisos de: Admin'
    case 'user': return 'Permisos de: Usuario'
    default: return 'Permisos de: Usuario'
  }
}

const handlePasswordChange = () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    addNotification('Las contraseñas nuevas no coinciden', 'error')
    return
  }
  
  if (passwordForm.newPassword.length < 3) {
    addNotification('La nueva contraseña debe tener al menos 3 caracteres', 'error')
    return
  }
  
  emit('change-password', {
    currentPassword: passwordForm.currentPassword,
    newPassword: passwordForm.newPassword
  })
  
  // Limpiar formulario
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  showPasswordReset.value = false
}

const openResetPassword = (user) => {
  selectedUser.value = user
  newUserPassword.value = ''
  confirmUserPassword.value = ''
  showUserPasswordReset.value = true
}

const handleUserPasswordReset = async () => {
  if (newUserPassword.value !== confirmUserPassword.value) {
    addNotification('Las contraseñas no coinciden', 'error')
    return
  }
  
  if (newUserPassword.value.length < 3) {
    addNotification('La nueva contraseña debe tener al menos 3 caracteres', 'error')
    return
  }
  
  const confirmed = await confirm({
    title: 'Resetear Contraseña',
    message: `¿Estás seguro de que quieres resetear la contraseña de ${selectedUser.value.username}?`,
    confirmText: 'Resetear',
    cancelText: 'Cancelar',
    type: 'danger'
  })
  
  if (confirmed) {
    emit('reset-user-password', {
      userId: selectedUser.value.id,
      newPassword: newUserPassword.value
    })
    
    // Limpiar y cerrar
    newUserPassword.value = ''
    confirmUserPassword.value = ''
    selectedUser.value = null
    showUserPasswordReset.value = false
    showUserManagement.value = false
  }
}

const deleteUser = async (user) => {
  if (user.id === props.currentUser.id) {
    addNotification('No puedes eliminar tu propia cuenta', 'error')
    return
  }
  
  const confirmed = await confirm({
    title: 'Eliminar Usuario',
    message: `¿Estás seguro de que quieres eliminar al usuario ${user.username}? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    type: 'danger'
  })
  
  if (confirmed) {
    emit('delete-user', user.id)
  }
}
</script>

<style scoped>
.user-modal {
  width: auto;
  min-width: 360px;
  max-width: 500px;
  padding-top: 32px;
}

.modal-header {
  margin-bottom: 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.profile-icon {
  width: 40px;
  height: 40px;
  color: #64748b;
}

.user-details {
  text-align: center;
}

.user-details h3 {
  margin: 0 0 4px 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 600;
}

.user-email {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.role-badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.025em;
  border: 1px solid #e2e8f0;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.action-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-1px);
}

.centered-btn {
  justify-content: center;
}

.master-btn {
  border-color: #fbbf24;
  color: #92400e;
}

.master-btn:hover {
  border-color: #f59e0b;
  background: #fffbeb;
}

.admin-btn {
  border-color: #3b82f6;
  color: #1d4ed8;
}

.admin-btn:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.action-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .user-modal {
    min-width: 300px;
    padding-top: 28px;
  }
  
  .user-profile {
    padding: 12px;
  }
  
  .action-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .user-modal {
    min-width: 260px;
    padding-top: 24px;
  }
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 4px;
}

.cancel-btn {
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.submit-btn {
  padding: 8px 16px;
  background: #1e293b;
  border: 1px solid #1e293b;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #334155;
  border-color: #334155;
  transform: translateY(-1px);
}

.danger-btn {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
}

.danger-btn:hover {
  background: #b91c1c !important;
  border-color: #b91c1c !important;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 8px;
  padding-right: 4px;
}

.user-item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  gap: 20px;
}

.user-item-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-item .user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
}

.user-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 16px;
}

.user-item .user-email {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

.user-role-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.025em;
}

.user-role-badge.superadmin {
  background: #dc2626;
  color: white;
}

.user-role-badge.admin {
  background: #f59e0b;
  color: white;
}

.user-role-badge.user {
  background: #6b7280;
  color: white;
}

.user-item-actions {
  display: flex;
  gap: 8px;
}

.reset-user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #dc2626;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-user-btn:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #b91c1c;
  color: #b91c1c;
}

.reset-user-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
  border-color: #d1d5db;
  color: #6b7280;
}

.delete-user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #dc2626;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-user-btn:hover:not(:disabled) {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
  transform: translateY(-1px);
}

.delete-user-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
  border-color: #d1d5db;
  color: #6b7280;
}

@media (max-width: 640px) {
  .user-profile {
    padding: 20px;
  }
  
  .profile-icon {
    width: 40px;
    height: 40px;
  }
  
  .user-details h3 {
    font-size: 18px;
  }
  
  .action-btn {
    padding: 14px 16px;
    font-size: 15px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .submit-btn {
    width: 100%;
  }
}
</style>