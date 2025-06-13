<template>
  <BaseModal :show="show" @close="$emit('close')">
    <div class="user-modal-compact">
      <div class="user-header-compact">
        <div class="user-info">
          <h3>{{ currentUser.username }}</h3>
          <span class="user-email">{{ currentUser.email }}</span>
          <span class="role-badge-compact">{{ getRoleDisplay(currentUser.role) }}</span>
        </div>
      </div>
      
      <div class="actions-compact">
        <button @click="showUsernameChange = true" class="action-compact">
          <svg class="icon-compact" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="m18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
          </svg>
          Cambiar Nombre
        </button>
        
        <button @click="showPasswordReset = true" class="action-compact">
          <svg class="icon-compact" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Cambiar Contraseña
        </button>

        <button @click="refreshUserData" class="action-compact">
          <svg class="icon-compact" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 4v6h6"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          Actualizar Datos
        </button>

        <button v-if="canManageUsers" @click="showUserManagement = true" class="action-compact admin-compact">
          <svg class="icon-compact" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Gestionar Usuarios
        </button>

        <button @click="handleLogout" class="logout action-compact">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 16px; height: 16px;">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
    
    <!-- Modal de cambio de nombre de usuario -->
    <BaseModal :show="showUsernameChange" @close="showUsernameChange = false">
      <div class="compact-modal">
        <h3>Cambiar Nombre</h3>
        <form @submit.prevent="handleUsernameChange" class="compact-form">
          <BaseInput
            v-model="newUsername"
            type="text"
            placeholder="Nuevo nombre de usuario"
            required
          />
          <div class="compact-actions">
            <button type="button" @click="showUsernameChange = false" class="compact-cancel">
              Cancelar
            </button>
            <button type="submit" class="compact-submit">
              Cambiar
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
    
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
    
    <!-- Modal de gestión de usuarios (solo para admin/superadmin) -->
    <BaseModal :show="showUserManagement" @close="showUserManagement = false">
      <div class="user-management-modal">
        <h3>Gestión de Usuarios</h3>
        <div class="users-list">
          <div v-for="user in manageableUsers" :key="user.id" class="user-item">
            <div class="user-info">
              <span class="username">{{ user.username }}</span>
              <span class="user-email">{{ user.email }}</span>
              <span class="role-badge">{{ getRoleDisplay(user.role) }}</span>
            </div>
            <div class="user-actions">
              <button @click="resetUserPassword(user)" class="action-btn reset-btn" title="Restablecer contraseña">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </button>
              <button @click="deleteUser(user)" class="action-btn delete-btn" title="Eliminar usuario">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c-1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
          <div v-if="!manageableUsers.length" class="empty-users">
            No hay usuarios para gestionar
          </div>
        </div>
      </div>
    </BaseModal>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseInput from './BaseInput.vue'
import { useNotifications } from '@/composables/useNotifications.js'

const props = defineProps(['show', 'currentUser', 'allUsers'])
const emit = defineEmits(['close', 'change-password', 'change-username', 'reset-user-password', 'delete-user', 'refresh-user-data'])

const { addNotification } = useNotifications()

const showUsernameChange = ref(false)
const showPasswordReset = ref(false)
const showUserManagement = ref(false)
const newUsername = ref('')

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

const handleLogout = () => {
  emit('logout');
  emit('close')
}

const handleUsernameChange = () => {
  if (!newUsername.value.trim()) {
    addNotification('El nombre de usuario no puede estar vacío', 'error')
    return
  }
  
  if (newUsername.value.trim().length < 2) {
    addNotification('El nombre de usuario debe tener al menos 2 caracteres', 'error')
    return
  }
  
  emit('change-username', newUsername.value.trim())
  
  // Limpiar y cerrar
  newUsername.value = ''
  showUsernameChange.value = false
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

// Computed properties para gestión de usuarios
const canManageUsers = computed(() => {
  if (!props.currentUser) return false
  return props.currentUser.role === 'admin' || props.currentUser.role === 'superadmin'
})

const manageableUsers = computed(() => {
  if (!props.allUsers || !props.currentUser) return []
  
  const currentUserRole = props.currentUser.role
  
  return props.allUsers.filter(user => {
    // No puede gestionar a sí mismo
    if (user.id === props.currentUser.id) return false
    
    // SuperAdmin puede gestionar admin y user
    if (currentUserRole === 'superadmin') {
      return user.role === 'admin' || user.role === 'user'
    }
    
    // Admin solo puede gestionar user
    if (currentUserRole === 'admin') {
      return user.role === 'user'
    }
    
    return false
  })
})

// Funciones para gestión de usuarios
const resetUserPassword = (user) => {
  emit('reset-user-password', user.id)
}

const deleteUser = (user) => {
  emit('delete-user', user.id)
}

const refreshUserData = () => {
  emit('refresh-user-data')
}

</script>

<style scoped>
/* Estilos compactos para modal principal */
.user-modal-compact {
  width: auto;
  min-width: 300px;
  max-width: 340px;
  margin: 0 auto;
}

.user-header-compact {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  text-align: center;
}

.user-header-compact h3 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 600;
}

.user-email {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

.role-badge-compact {
  background: #64748b;
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.025em;
  display: inline-block;
}

.actions-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-compact {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  justify-content: center;
}

.action-compact:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.master-compact {
  border-color: #f59e0b;
  color: #92400e;
  background: #fffbeb;
}

.master-compact:hover {
  border-color: #d97706;
  background: #fef3c7;
}

.admin-compact {
  border-color: #3b82f6;
  color: #1d4ed8;
  background: #eff6ff;
}

.admin-compact:hover {
  border-color: #2563eb;
  background: #dbeafe;
}

.icon-compact {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .user-modal-compact {
    min-width: 280px;
    max-width: 320px;
    width: 100%;
  }
  
  .user-header-compact {
    padding: 16px;
    margin-bottom: 20px;
  }
  
  .action-compact {
    padding: 14px 16px;
    font-size: 14px;
    gap: 12px;
  }
  
  .icon-compact {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .user-modal-compact {
    min-width: 260px;
    max-width: 300px;
    width: 100%;
  }
  
  .user-header-compact {
    padding: 14px;
    margin-bottom: 16px;
  }
  
  .user-header-compact h3 {
    font-size: 18px;
  }
  
  .user-email {
    font-size: 13px;
  }
  
  .action-compact {
    padding: 16px;
    font-size: 15px;
    gap: 14px;
    min-height: 50px;
  }
  
  .icon-compact {
    width: 20px;
    height: 20px;
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

.cancel-btn, .submit-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f8fafc;
  color: #64748b;
}

.submit-btn {
  background: #1e293b;
  color: white;
}

/* Estilos compactos para modal de cambio de nombre */
.compact-modal {
  max-width: 320px;
  margin: 0 auto;
}

.compact-modal h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  text-align: center;
}

.compact-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.compact-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.compact-cancel {
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #64748b;
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.compact-cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.compact-submit {
  padding: 6px 12px;
  background: #1e293b;
  border: 1px solid #1e293b;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.compact-submit:hover {
  background: #334155;
  border-color: #334155;
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
  
  .compact-actions {
    flex-direction: column;
  }
  
  .compact-cancel, .compact-submit {
    width: 100%;
  }
}

.logout { 
  color: red;
}

/* Estilos para gestión de usuarios */
.user-management-modal {
  max-width: 500px;
  margin: 0 auto;
}

.user-management-modal h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  text-align: center;
}

.users-list {
  max-height: 400px;
  overflow-y: auto;
  gap: 8px;
  display: flex;
  flex-direction: column;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.user-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.username {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.user-email {
  color: #64748b;
  font-size: 12px;
}

.role-badge {
  background: #64748b;
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  display: inline-block;
  align-self: flex-start;
}

.user-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #64748b;
}

.reset-btn:hover {
  background: rgba(240, 249, 255, 0.9);
  border-color: #3b82f6;
  color: #3b82f6;
}

.delete-btn:hover {
  background: rgba(254, 242, 242, 0.9);
  border-color: #ef4444;
  color: #ef4444;
}

.empty-users {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 14px;
}
</style>