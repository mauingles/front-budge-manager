<template>
  <AppLayout>
    <!-- Indicador de carga -->
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Cargando datos...</p>
    </div>
    
    <!-- Indicador de estado de conexión solo cuando hay error -->
    <div v-if="!isOnline && !isLoading" class="connection-status offline">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="status-icon">
        <path d="m22 9-10 10L2 9"/>
      </svg>
      Sin conexión al servidor - {{ errorMessage }}
    </div>
    
    <!-- Pantalla de login si no está autenticado -->
    <div v-if="!currentUser && !authLoading">
      <LoginForm 
        ref="loginForm"
        @login="handleLogin" 
        @register="handleRegister"
        @google-login="handleGoogleLogin"
      />
    </div>
    
    <!-- App principal si está autenticado -->
    <div v-else-if="currentUser && !authLoading" class="main-app">
      <!-- Header con info de usuario -->
      <div class="user-header">
        <div class="user-info">
          <h1 class="app-title">Budget Manager</h1>
        </div>
        <div class="user-actions">
          <button @click="openForm('income')" class="header-btn income-header-btn" title="Agregar Ingreso">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
              <polyline points="23,6 18,6 18,11"/>
            </svg>
            Ingresos
          </button>
          <button @click="openForm('expense')" class="header-btn expense-header-btn" title="Agregar Gasto">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="1,18 8.5,10.5 13.5,15.5 23,6"/>
              <polyline points="1,18 6,18 6,13"/>
            </svg>
            Gastos
          </button>
          <button @click="openGroupModal" class="header-btn" title="Gestionar grupos">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Grupos
          </button>
          <div class="group-selector">
            <select v-model="selectedGroup" class="group-select">
              <option :value="null">Todos los grupos</option>
              <option 
                v-for="group in userGroups" 
                :key="group.id" 
                :value="group"
              >
                {{ group.name }}
              </option>
            </select>
          </div>
          <DatePicker v-model="selectedMonth" class="header-date-picker" />
          <button @click="showUserModal = true" class="user-button" title="Perfil de usuario">
            <svg class="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          <button @click="handleLogout" class="logout-btn-small" title="Cerrar Sesión">
            <svg class="btn-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Layout de grid para desktop, stack para mobile -->
      <div class="dashboard-grid">
        
        <!-- Columna derecha - Balance -->
        <div class="balance-section">
          <MonthlyBalance 
            :total-income="totalIncome" 
            :total-expenses="totalExpenses"
            :selected-month="selectedMonth"
            :selected-group="selectedGroup"
          />
        </div>
        
        <!-- Fila completa - Transacciones -->
        <div class="transactions-section">
          <BaseCard>
            <h3 class="section-title">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              {{ getTransactionsSectionTitle() }}
            </h3>
            <div class="transactions-container">
              <TransactionList 
                :transactions="filteredTransactions" 
                :current-user="currentUser"
                :has-group-access="hasGroupAccess"
                :groups="groups"
                :show-group-tags="!selectedGroup"
                @edit="editTransaction"
                @delete="deleteTransaction"
              />
            </div>
          </BaseCard>
        </div>
      </div>
      
      <!-- Modal para agregar/editar -->
      <BaseModal :show="showModal" @close="closeModal">
        <h2>{{ getModalTitle() }}</h2>
        <TransactionForm 
          :initial-type="formType"
          :selected-month="selectedMonth"
          :current-user="currentUser?.username || currentUser?.email || currentUser?.displayName"
          :editing-transaction="editingTransaction"
          :is-editing="editing"
          :available-groups="userGroups"
          :preselected-group="selectedGroup"
          @submit="saveTransaction" 
        />
      </BaseModal>
      
      <!-- Mensaje de éxito -->
      <BaseAlert v-if="showSuccess">
        ✅ Transacción guardada correctamente
      </BaseAlert>
      
      <!-- Modal de usuario -->
      <UserModal 
        :show="showUserModal"
        :current-user="currentUser"
        :master-password="MASTER_PASSWORD"
        :all-users="users"
        @close="showUserModal = false"
        @update-master="updateMasterPassword"
        @change-password="handlePasswordChange"
        @reset-user-password="handleUserPasswordReset"
        @delete-user="handleDeleteUser"
      />
      
      <!-- Modal de gestión de grupos -->
      <GroupManagementModal 
        :show="showGroupManagementModal"
        :current-user="currentUser"
        :user-groups="userGroups"
        :all-groups="groups"
        :all-users="users"
        @close="showGroupManagementModal = false"
        @create-group="handleCreateGroup"
        @join-group="handleJoinGroup"
        @remove-member="handleRemoveMember"
        @generate-new-code="handleGenerateNewCode"
        @leave-group="handleLeaveGroup"
        @delete-group="handleDeleteGroup"
        @hide-group="handleHideGroup"
        @unhide-group="handleUnhideGroup"
      />
    </div>
    
    <!-- Contenedor de notificaciones -->
    <NotificationContainer />
    
    <!-- Dialog de confirmación -->
    <ConfirmDialog
      :show="confirmState.show"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-text="confirmState.confirmText"
      :cancel-text="confirmState.cancelText"
      :type="confirmState.type"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @close="closeConfirm"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import AppLayout from './components/AppLayout.vue'
import AppHeader from './components/AppHeader.vue'
import MonthlyBalance from './components/MonthlyBalance.vue'
import BaseCard from './components/BaseCard.vue'
import TransactionList from './components/TransactionList.vue'
import BaseModal from './components/BaseModal.vue'
import TransactionForm from './components/TransactionForm.vue'
import DatePicker from './components/DatePicker.vue'
import BaseAlert from './components/BaseAlert.vue'
import LoginForm from './components/LoginForm.vue'
import UserModal from './components/UserModal.vue'
import GroupManager from './components/GroupManager.vue'
import GroupManagementModal from './components/GroupManagementModal.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import apiService from './services/api.js'
import { useAuth } from '@/composables/useAuth.js'
import { useNotifications } from '@/composables/useNotifications.js'
import { useConfirm } from '@/composables/useConfirm.js'

// Autenticación con Firebase
const { user: firebaseUser, loading: authLoading, logout: firebaseLogout } = useAuth()

// Notificaciones
const { addNotification } = useNotifications()

// Confirmaciones
const { confirmState, confirm, handleConfirm, handleCancel, closeConfirm } = useConfirm()

// Estado de conexión
const isLoading = ref(true)
const isOnline = ref(true)
const errorMessage = ref('')

// Estado de autenticación
const currentUser = ref(null)
const users = ref([])
const loginForm = ref(null)
const MASTER_PASSWORD = ref('admin123')

// Estado
const selectedMonth = ref('2025-01')
const selectedGroup = ref(null) // Grupo seleccionado actualmente
const transactions = ref([])
const groups = ref([])

const showModal = ref(false)
const editing = ref(false)
const editingTransaction = ref(null)
const showSuccess = ref(false)
const showUserModal = ref(false)
const showGroupModal = ref(false)
const showGroupManagementModal = ref(false)
const formType = ref('income')

// Computadas
const filteredTransactions = computed(() => {
  if (!currentUser.value) return []
  
  // Filtro base: solo transacciones del mes seleccionado
  let filtered = transactions.value.filter(t => t.date === selectedMonth.value)
  
  // FILTRO PRINCIPAL: Solo transacciones donde el usuario tiene acceso
  const userGroupIds = userGroups.value.map(g => g.id)
  const isAdmin = currentUser.value.role === 'admin' || currentUser.value.role === 'superadmin'
  
  // Filtrar por acceso del usuario
  filtered = filtered.filter(t => {
    // Admins y SuperAdmins ven todo
    if (isAdmin) return true
    
    // Transacciones sin grupo: solo si fueron creadas por el usuario actual
    if (!t.groupId) {
      return t.userId === currentUser.value.id
    }
    
    // Transacciones con grupo: solo si el usuario es miembro del grupo
    return userGroupIds.includes(t.groupId)
  })
  
  // Filtro adicional por grupo seleccionado
  if (selectedGroup.value) {
    // Verificar acceso al grupo seleccionado
    if (!hasGroupAccess(selectedGroup.value.id)) {
      return [] // Sin acceso al grupo
    }
    filtered = filtered.filter(t => t.groupId === selectedGroup.value.id)
  }
  
  return filtered
})

const totalIncome = computed(() => 
  filteredTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
)

const totalExpenses = computed(() => 
  filteredTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
)

// Función para verificar acceso a grupo
const hasGroupAccess = (groupId) => {
  if (!currentUser.value || !groupId) return false
  
  // Admin y SuperAdmin tienen acceso a todo
  if (currentUser.value.role === 'admin' || currentUser.value.role === 'superadmin') {
    return true
  }
  
  // Verificar si es miembro del grupo
  const group = groups.value.find(g => g.id === groupId)
  return group?.members.some(member => member.id === currentUser.value?.id) || false
}

const userGroups = computed(() => {
  if (!currentUser.value) return []
  
  // Admin y SuperAdmin ven todos los grupos
  if (currentUser.value.role === 'admin' || currentUser.value.role === 'superadmin') {
    return groups.value.filter(group => {
      // No mostrar grupos ocultos para el usuario actual
      return !group.hiddenFor || !group.hiddenFor.includes(currentUser.value.id)
    })
  }
  
  // Usuarios normales y de Google solo ven grupos donde son miembros y no están ocultos
  return groups.value.filter(group => {
    const isMember = group.members.some(member => member.id === currentUser.value?.id)
    const isHidden = group.hiddenFor && group.hiddenFor.includes(currentUser.value.id)
    return isMember && !isHidden
  })
})

// Funciones API
const loadData = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const data = await apiService.getAllData()
    
    users.value = data.users || []
    transactions.value = data.transactions || []
    groups.value = data.groups || []
    MASTER_PASSWORD.value = data.settings?.masterPassword || 'admin123'
    selectedMonth.value = data.settings?.selectedMonth || '2025-01'
    
    // Validar acceso al grupo guardado
    const savedGroup = data.settings?.selectedGroup
    if (savedGroup && currentUser.value) {
      // Verificar si el usuario tiene acceso al grupo guardado
      if (hasGroupAccess(savedGroup.id)) {
        selectedGroup.value = savedGroup
      } else {
        selectedGroup.value = null // Reset si no tiene acceso
      }
    } else {
      selectedGroup.value = null
    }
    
    currentUser.value = data.currentUser || null
    
    isOnline.value = true
  } catch (error) {
    console.error('Error loading data:', error)
    isOnline.value = false
    errorMessage.value = 'No se pudo conectar al servidor'
  } finally {
    isLoading.value = false
  }
}

const saveData = async () => {
  try {
    const data = {
      users: users.value,
      transactions: transactions.value,
      groups: groups.value,
      settings: {
        masterPassword: MASTER_PASSWORD.value,
        selectedMonth: selectedMonth.value,
        selectedGroup: selectedGroup.value
      },
      currentUser: currentUser.value
    }
    
    await apiService.saveAllData(data)
    isOnline.value = true
    errorMessage.value = ''
  } catch (error) {
    console.error('Error saving data:', error)
    isOnline.value = false
    errorMessage.value = 'Error al guardar datos'
  }
}

// Watcher para sincronizar Firebase user con currentUser
watch(firebaseUser, (newFirebaseUser) => {
  if (newFirebaseUser) {
    // Usuario de Firebase autenticado
    const existingUser = users.value.find(u => u.email === newFirebaseUser.email)
    
    if (existingUser) {
      // Usuario local existente
      currentUser.value = existingUser
    } else {
      // Nuevo usuario de Firebase
      const newUser = {
        id: Date.now(),
        username: newFirebaseUser.displayName || newFirebaseUser.email.split('@')[0],
        email: newFirebaseUser.email,
        photoURL: newFirebaseUser.photoURL,
        uid: newFirebaseUser.uid,
        role: 'user',
        isGoogleUser: true,
        password: null
      }
      
      users.value.push(newUser)
      currentUser.value = newUser
    }
  } else if (!newFirebaseUser && currentUser.value?.isGoogleUser) {
    // Firebase user logged out y current user es de Google
    currentUser.value = null
  }
})

// Watchers para auto-guardado
watch([users, transactions, groups, MASTER_PASSWORD, selectedMonth, selectedGroup, currentUser], () => {
  if (!isLoading.value) {
    saveData()
  }
}, { deep: true })

// Cargar datos al iniciar
onMounted(() => {
  loadData()
})

// Métodos
const openForm = (type) => {
  formType.value = type
  showModal.value = true
}

const openGroupModal = () => {
  showGroupManagementModal.value = true
}

const getRoleDisplay = (role) => {
  switch(role) {
    case 'superadmin': return 'Super Admin'
    case 'admin': return 'Admin'
    case 'user': return 'Usuario'
    default: return 'Usuario'
  }
}

const getModalTitle = () => {
  if (editing.value) {
    return editingTransaction.value?.type === 'income' ? 'Editar Ingreso' : 'Editar Gasto'
  }
  return formType.value === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto'
}

const getTransactionsSectionTitle = () => {
  if (selectedGroup.value) {
    return `Transacciones grupo ${selectedGroup.value.name}`
  }
  return 'Transacciones'
}
const saveTransaction = (transaction) => {
  // Agregar datos de usuario y grupo a la transacción
  const transactionData = {
    ...transaction,
    groupId: transaction.groupId || null, // Usar el grupo del formulario
    userId: currentUser.value.id // IMPORTANTE: Asignar el ID del usuario actual
  }
  
  if (editing.value && editingTransaction.value) {
    // Editar transacción existente - verificar permisos
    const existingTransaction = transactions.value.find(t => t.id === editingTransaction.value.id)
    
    // Verificar si el usuario puede editar esta transacción
    const canEdit = currentUser.value.role === 'admin' || 
                   currentUser.value.role === 'superadmin' ||
                   existingTransaction.userId === currentUser.value.id ||
                   (existingTransaction.groupId && hasGroupAccess(existingTransaction.groupId))
    
    if (!canEdit) {
      addNotification('No tienes permisos para editar esta transacción', 'error')
      return
    }
    
    const index = transactions.value.findIndex(t => t.id === editingTransaction.value.id)
    if (index !== -1) {
      transactions.value[index] = {
        ...transactionData,
        id: editingTransaction.value.id,
        userId: existingTransaction.userId, // Mantener el usuario original
        createdAt: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }
  } else {
    // Agregar nueva transacción
    transactions.value.push({
      ...transactionData,
      id: Date.now()
    })
  }
  
  closeModal()
  
  // Mostrar notificación específica
  if (editing.value) {
    const typeText = transactionData.type === 'income' ? 'ingreso' : 'gasto'
    addNotification(`${typeText.charAt(0).toUpperCase() + typeText.slice(1)} editado correctamente`, 'success', 2000)
  } else {
    const typeText = transactionData.type === 'income' ? 'ingreso' : 'gasto'
    addNotification(`${typeText.charAt(0).toUpperCase() + typeText.slice(1)} creado correctamente`, 'success', 2000)
  }
  
  // Mostrar mensaje de éxito (mantenemos el existente también)
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const editTransaction = (transaction) => {
  // Verificar permisos de edición más estrictos
  const isAdmin = currentUser.value?.role === 'admin' || currentUser.value?.role === 'superadmin'
  const isOwner = transaction.userId === currentUser.value?.id
  const hasGroupPermission = transaction.groupId ? hasGroupAccess(transaction.groupId) : false
  
  // Solo puede editar si:
  // 1. Es admin/superadmin, O
  // 2. Es el dueño de la transacción, O  
  // 3. Es una transacción de grupo y tiene acceso al grupo
  const canEdit = isAdmin || isOwner || (transaction.groupId && hasGroupPermission)
  
  if (!canEdit) {
    addNotification('No tienes permisos para editar esta transacción', 'error')
    return
  }
  
  editing.value = true
  editingTransaction.value = transaction
  formType.value = transaction.type
  showModal.value = true
}

const deleteTransaction = async (transactionId) => {
  const transaction = transactions.value.find(t => t.id === transactionId)
  if (!transaction) return
  
  // Verificar permisos de eliminación más estrictos
  const isAdmin = currentUser.value?.role === 'admin' || currentUser.value?.role === 'superadmin'
  const isOwner = transaction.userId === currentUser.value?.id
  const hasGroupPermission = transaction.groupId ? hasGroupAccess(transaction.groupId) : false
  
  // Solo puede eliminar si:
  // 1. Es admin/superadmin, O
  // 2. Es el dueño de la transacción, O
  // 3. Es una transacción de grupo y tiene acceso al grupo
  const canDelete = isAdmin || isOwner || (transaction.groupId && hasGroupPermission)
  
  if (!canDelete) {
    addNotification('No tienes permisos para eliminar esta transacción', 'error')
    return
  }
  
  const confirmed = await confirm({
    title: 'Eliminar Transacción',
    message: '¿Estás seguro de que quieres eliminar esta transacción?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    type: 'danger'
  })
  
  if (confirmed) {
    transactions.value = transactions.value.filter(t => t.id !== transactionId)
    
    // Mostrar mensaje de éxito
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  }
}

// Métodos de autenticación
const handleLogin = (userData) => {
  // Sistema de autenticación local (admin/superadmin)
  const user = users.value.find(u => u.email === userData.email && u.password === userData.password)
  if (user) {
    currentUser.value = user
  } else {
    loginForm.value.showError('Usuario o contraseña incorrectos')
  }
}

const handleRegister = (userData) => {
  // Sistema de registro local (admin/superadmin)
  const existingUser = users.value.find(u => u.email === userData.email)
  if (existingUser) {
    loginForm.value.showError('El usuario ya existe')
    return
  }
  
  // Verificar contraseña maestra para admins y super admins
  if (userData.role === 'admin' || userData.role === 'superadmin') {
    if (userData.masterPassword !== MASTER_PASSWORD.value) {
      loginForm.value.showError('Contraseña maestra incorrecta')
      return
    }
  }
  
  const newUser = {
    id: Date.now(),
    username: userData.email.split('@')[0],
    email: userData.email,
    password: userData.password,
    role: userData.role,
    isGoogleUser: false
  }
  
  users.value.push(newUser)
  currentUser.value = newUser
}

const handleGoogleLogin = () => {
  // Google login se maneja automáticamente por el watcher de firebaseUser
  console.log('Google login initiated')
}

const handleLogout = async () => {
  // Pedir confirmación antes de cerrar sesión
  const confirmed = await confirm({
    title: 'Cerrar Sesión',
    message: '¿Estás seguro de que quieres cerrar sesión?',
    confirmText: 'Cerrar Sesión',
    cancelText: 'Cancelar',
    type: 'info'
  })
  
  if (!confirmed) {
    return
  }
  
  try {
    console.log('Cerrando sesión...')
    
    if (currentUser.value?.isGoogleUser) {
      // Logout de Firebase para usuarios de Google
      await firebaseLogout()
    } else {
      // Logout local para usuarios admin/superadmin
      currentUser.value = null
    }
    
    console.log('Sesión cerrada exitosamente')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

const updateMasterPassword = (newPassword) => {
  MASTER_PASSWORD.value = newPassword
  
  // Mostrar mensaje de éxito
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const handlePasswordChange = (passwordData) => {
  // Verificar contraseña actual
  if (currentUser.value.password !== passwordData.currentPassword) {
    addNotification('La contraseña actual es incorrecta', 'error')
    return
  }
  
  // Actualizar contraseña del usuario
  const userIndex = users.value.findIndex(u => u.id === currentUser.value.id)
  if (userIndex !== -1) {
    users.value[userIndex].password = passwordData.newPassword
    currentUser.value.password = passwordData.newPassword
    
    // Mostrar mensaje de éxito
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  }
}

const handleUserPasswordReset = (resetData) => {
  // Encontrar y actualizar la contraseña del usuario
  const userIndex = users.value.findIndex(u => u.id === resetData.userId)
  if (userIndex !== -1) {
    users.value[userIndex].password = resetData.newPassword
    
    // Si es el usuario actual, también actualizar currentUser
    if (currentUser.value.id === resetData.userId) {
      currentUser.value.password = resetData.newPassword
    }
    
    // Mostrar mensaje de éxito
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  }
}

const handleDeleteUser = (userId) => {
  // Encontrar el usuario a eliminar
  const userToDelete = users.value.find(u => u.id === userId)
  if (!userToDelete) return
  
  // No permitir eliminar al usuario actual
  if (userId === currentUser.value.id) {
    addNotification('No puedes eliminar tu propia cuenta', 'error')
    return
  }
  
  // Eliminar al usuario de la lista
  users.value = users.value.filter(u => u.id !== userId)
  
  // Eliminar al usuario de todos los grupos
  groups.value.forEach(group => {
    group.members = group.members.filter(member => member.id !== userId)
  })
  
  // Eliminar las transacciones privadas del usuario (sin grupo)
  transactions.value = transactions.value.filter(t => 
    !(t.userId === userId && !t.groupId) // Mantener transacciones de grupo
  )
  
  // Mostrar mensaje de éxito
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const closeModal = () => {
  showModal.value = false
  editing.value = false
  editingTransaction.value = null
}

// Métodos de grupos
const handleCreateGroup = (groupData) => {
  const newGroup = {
    id: Date.now(),
    name: groupData.name,
    description: groupData.description || '',
    createdBy: currentUser.value.id,
    createdAt: new Date().toISOString(),
    inviteCode: generateInviteCode(),
    members: [
      {
        id: currentUser.value.id,
        username: currentUser.value.username || currentUser.value.email?.split('@')[0],
        role: 'admin'
      }
    ]
  }
  
  groups.value.push(newGroup)
  
  // Mostrar mensaje de éxito
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const handleJoinGroup = (inviteCode) => {
  const group = groups.value.find(g => g.inviteCode === inviteCode)
  
  if (!group) {
    addNotification('Código de invitación inválido o ya fue usado', 'error')
    return
  }
  
  const isAlreadyMember = group.members.some(m => m.id === currentUser.value.id)
  if (isAlreadyMember) {
    addNotification('Ya eres miembro de este grupo', 'warning')
    return
  }
  
  // Agregar usuario al grupo
  group.members.push({
    id: currentUser.value.id,
    username: currentUser.value.username || currentUser.value.email?.split('@')[0],
    role: 'member'
  })
  
  // INVALIDAR el código después del uso (un solo uso)
  group.inviteCode = null
  
  // Mostrar mensaje de éxito
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
  
  addNotification(`¡Te has unido al grupo "${group.name}"! El código de invitación ha sido invalidado.`, 'success')
}

const handleRemoveMember = ({ groupId, memberId }) => {
  const group = groups.value.find(g => g.id === groupId)
  if (!group) return
  
  group.members = group.members.filter(m => m.id !== memberId)
  
  // Mostrar mensaje de éxito
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

const handleGenerateNewCode = (groupId) => {
  const group = groups.value.find(g => g.id === groupId)
  if (!group) return
  
  // Generar nuevo código
  group.inviteCode = generateInviteCode()
  
  // Mostrar mensaje de éxito
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const handleLeaveGroup = (groupId) => {
  const group = groups.value.find(g => g.id === groupId)
  if (!group || !currentUser.value) return
  
  // Remover al usuario actual de los miembros del grupo
  group.members = group.members.filter(member => member.id !== currentUser.value.id)
  
  // Si el grupo seleccionado es el que se está abandonando, resetear selección
  if (selectedGroup.value && selectedGroup.value.id === groupId) {
    selectedGroup.value = null
  }
  
  addNotification(`Has salido del grupo "${group.name}"`, 'success')
}

const handleDeleteGroup = (groupId) => {
  const group = groups.value.find(g => g.id === groupId)
  
  // Eliminar el grupo
  groups.value = groups.value.filter(g => g.id !== groupId)
  
  // Eliminar todas las transacciones del grupo
  transactions.value = transactions.value.filter(t => t.groupId !== groupId)
  
  // Si el grupo seleccionado es el que se está eliminando, resetear selección
  if (selectedGroup.value && selectedGroup.value.id === groupId) {
    selectedGroup.value = null
  }
  
  addNotification(`Grupo "${group?.name || 'Grupo'}" eliminado correctamente`, 'success')
}

const handleHideGroup = (groupId) => {
  const group = groups.value.find(g => g.id === groupId)
  if (!group || !currentUser.value) return
  
  // Inicializar el array hiddenFor si no existe
  if (!group.hiddenFor) {
    group.hiddenFor = []
  }
  
  // Agregar el usuario actual a la lista de usuarios que tienen oculto el grupo
  if (!group.hiddenFor.includes(currentUser.value.id)) {
    group.hiddenFor.push(currentUser.value.id)
  }
  
  // Si el grupo seleccionado es el que se está ocultando, resetear selección
  if (selectedGroup.value && selectedGroup.value.id === groupId) {
    selectedGroup.value = null
  }
  
  addNotification(`Grupo "${group.name}" ocultado correctamente`, 'success')
}

const handleUnhideGroup = (groupId) => {
  const group = groups.value.find(g => g.id === groupId)
  if (!group || !currentUser.value) return
  
  // Remover el usuario actual de la lista de usuarios que tienen oculto el grupo
  if (group.hiddenFor) {
    group.hiddenFor = group.hiddenFor.filter(userId => userId !== currentUser.value.id)
  }
  
  addNotification(`Grupo "${group.name}" ahora es visible`, 'success')
}

// Procesamiento de invitaciones (para futuro)
const processInvitation = (inviteCode) => {
  const group = groups.value.find(g => g.inviteCode === inviteCode)
  if (group && currentUser.value) {
    const isAlreadyMember = group.members.some(m => m.id === currentUser.value.id)
    if (!isAlreadyMember) {
      group.members.push({
        id: currentUser.value.id,
        username: currentUser.value.username,
        role: 'member'
      })
      addNotification(`¡Te has unido al grupo "${group.name}"!`, 'success')
    } else {
      addNotification('Ya eres miembro de este grupo', 'warning')
    }
  } else {
    addNotification('Código de invitación inválido', 'error')
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  background-attachment: fixed;
  background-size: cover;
  color: #334155;
  line-height: 1.6;
}

#app {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

h3 {
  margin-bottom: 20px;
  color: #0f172a;
  font-weight: 600;
  font-size: 1.125rem;
}

.main-app {
  width: 100%;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
  margin-top: 24px;
}


.selectors {
  display: flex;
  align-items: center;
  gap: 20px;
}

.group-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-selector label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.group-selector .select {
  width: 200px;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
}

.group-selector .select:focus {
  outline: none;
  border-color: #3b82f6;
}

.balance-section {
  grid-column: 1 / -1;
  grid-row: 1;
}

.transactions-section {
  grid-column: 1 / -1;
  grid-row: 2;
}

.transactions-container {
  height: auto;
  min-height: 60px;
  max-height: 420px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow-y: auto;
  overflow-x: hidden;
}


.username {
  font-weight: 600;
  color: #0f172a;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: 20px;
  }
  
  .balance-section {
    grid-column: 1;
    grid-row: 1;
  }
  
  .transactions-section {
    grid-column: 1;
    grid-row: 2;
  }
  
  .transactions-container {
    max-height: 350px;
  }
}

@media (max-width: 480px) {
  .transactions-container {
    max-height: 300px;
  }
}

.loading {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #1e40af;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.connection-status {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  width: 16px;
  height: 16px;
}

.connection-status.offline {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  border-radius: 16px;
  margin: 0 0 8px 0;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  width: 100%;
}

@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  
}

.user-info {
  display: flex;
  gap: 24px;
  align-items: center;
}

.app-title {
  margin: 0;
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.05em;
}

.user-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #334155;
  min-width: 32px;
  min-height: 32px;
}

.user-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.user-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  border: 1px solid transparent;
  letter-spacing: 0.025em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px -8px rgba(59, 130, 246, 0.4);
}

.header-btn:active {
  transform: translateY(0);
}

.income-header-btn {
  background: #10b981;
}

.income-header-btn:hover {
  background: #059669;
  box-shadow: 0 8px 25px -8px rgba(16, 185, 129, 0.4);
}

.expense-header-btn {
  background: #ef4444;
}

.expense-header-btn:hover {
  background: #dc2626;
  box-shadow: 0 8px 25px -8px rgba(239, 68, 68, 0.4);
}

.header-date-picker {
  /* DatePicker component will inherit its own styles */
}

.group-selector {
  position: relative;
}

.group-select {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #1e293b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 32px;
}

.group-select:hover {
  border-color: #cbd5e1;
}

.group-select:focus {
  outline: none;
  border-color: #1e293b;
  box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.1);
}

@media (max-width: 768px) {
  .user-actions {
    width: 100%;
    justify-content: center;
  }
}

.role {
  background: #f8fafc;
  color: #64748b;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  letter-spacing: 0.025em;
}

.role.google-user {
  background: #fef3c7;
  color: #92400e;
  border-color: #fbbf24;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-group-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  border: 1px solid transparent;
  letter-spacing: 0.025em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-group-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px -8px rgba(59, 130, 246, 0.4);
}

.add-group-btn:active {
  transform: translateY(0);
}

.logout-btn {
  background: #64748b;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  border: 1px solid transparent;
  letter-spacing: 0.025em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logout-btn:hover {
  background: #475569;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px -8px rgba(100, 116, 139, 0.4);
}

.logout-btn:active {
  transform: translateY(0);
}

.logout-btn-small {
  background: #64748b;
  color: white;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.logout-btn-small:hover {
  background: #475569;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
}

.logout-btn-small:active {
  transform: translateY(0);
}

.btn-icon-small {
  width: 12px;
  height: 12px;
}

.user-icon {
  width: 16px;
  height: 16px;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.section-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 24px;
  letter-spacing: -0.025em;
}

@media (max-width: 640px) {
  .logout-btn, .reset-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>