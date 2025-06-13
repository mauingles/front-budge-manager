<template>
  <AppLayout>
    <div v-if="isLoading" class="loading">Cargando...</div>
    <div v-if="!isOnline && !isLoading" class="offline">Sin conexión</div>
    
    <LoginForm v-if="!currentUser && !authLoading" 
      @login="handleLogin" 
      @register="handleRegister"
      @google-login="handleGoogleLogin" />
    
    
    <!-- App principal si está autenticado -->
    <div v-else-if="currentUser && !authLoading" class="main-app">
      <header class="header whatsapp-header">
        <div class="mcdonalds-title">
          <svg class="app-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
          </svg>
          <h1>Budget Manager</h1>
          <span class="slogan">¡I'm lovin' it!</span>
        </div>
        <div class="actions">
          <button @click="openForm('income')" class="btn btn-income">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 16px; height: 16px;">
              <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
              <polyline points="23,6 18,6 18,11"/>
            </svg>
            Ingresos
          </button>
          <button @click="openForm('expense')" class="btn btn-expense">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 16px; height: 16px;">
              <polyline points="1,18 8.5,10.5 13.5,15.5 23,6"/>
              <polyline points="1,18 6,18 6,13"/>
            </svg>
            Gastos
          </button>
          <GroupSelectorModal 
            v-model="selectedGroup" 
            :available-groups="userGroups" 
          />
          <DatePicker v-model="selectedMonth" />
          <button @click="openGroupModal" class="btn" title="Grupos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 16px; height: 16px;">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </button>
          <button @click="showUserModal = true" class="btn" title="Perfil de usuario">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 16px; height: 16px;">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </header>
      
      <div class="dashboard">
        <MonthlyBalance 
          :total-income="totalIncome" 
          :total-expenses="totalExpenses"
          :selected-month="selectedMonth"
          :selected-group="selectedGroup" />
        
        <BaseCard>
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            {{ getTransactionsSectionTitle() }}
          </h3>
          <TransactionList 
            :transactions="filteredTransactions" 
            :current-user="currentUser"
            :has-group-access="hasGroupAccess"
            :groups="groups"
            :show-group-tags="!selectedGroup"
            @edit="editTransaction"
            @delete="deleteTransaction" />
        </BaseCard>
      </div>
    </div>
    
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
        @submit="saveTransaction" />
    </BaseModal>
    
    <UserModal 
      :show="showUserModal"
      :current-user="currentUser"
      :master-password="MASTER_PASSWORD"
      :all-users="users"
      @close="showUserModal = false"
      @update-master="updateMasterPassword"
      @change-password="handlePasswordChange"
      @change-username="handleUsernameChange"
      @reset-user-password="handleUserPasswordReset"
      @delete-user="handleDeleteUser"
      @refresh-user-data="refreshUserData"
      @logout="handleLogout" />
    
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
      @unhide-group="handleUnhideGroup" />
    
    <NotificationContainer />
    <ConfirmDialog
      :show="confirmState.show"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-text="confirmState.confirmText"
      :cancel-text="confirmState.cancelText"
      :type="confirmState.type"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @close="closeConfirm" />
  </AppLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import AppLayout from './components/AppLayout.vue'
import MonthlyBalance from './components/MonthlyBalance.vue'
import BaseCard from './components/BaseCard.vue'
import TransactionList from './components/TransactionList.vue'
import BaseModal from './components/BaseModal.vue'
import TransactionForm from './components/TransactionForm.vue'
import DatePicker from './components/DatePicker.vue'
import GroupSelectorModal from './components/GroupSelectorModal.vue'
import LoginForm from './components/LoginForm.vue'
import UserModal from './components/UserModal.vue'
import GroupManagementModal from './components/GroupManagementModal.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import apiService from './services/api.js'
import { useAuth } from '@/composables/useAuth.js'
import { useNotifications } from '@/composables/useNotifications.js'
import { useConfirm } from '@/composables/useConfirm.js'

const { user: firebaseUser, loading: authLoading, logout: firebaseLogout } = useAuth()
const { addNotification } = useNotifications()
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
const getCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
const selectedMonth = ref(getCurrentMonth())
const selectedGroup = ref(null) // Grupo seleccionado actualmente
const transactions = ref([])
const groups = ref([])

const showModal = ref(false)
const editing = ref(false)
const editingTransaction = ref(null)
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
  const isAdmin = currentUser.value.role === 'admin'
  const isSuperAdmin = currentUser.value.role === 'superadmin'
  
  // Filtrar por acceso del usuario
  filtered = filtered.filter(t => {
    // Admin y SuperAdmin pueden ver todas las transacciones
    if (isAdmin || isSuperAdmin) {
      return true
    }
    
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
  
  const isAdmin = currentUser.value.role === 'admin'
  const isSuperAdmin = currentUser.value.role === 'superadmin'
  
  // Admin y SuperAdmin tienen acceso a todos los grupos
  if (isAdmin || isSuperAdmin) {
    return true
  }
  
  // Usuarios regulares deben ser miembros del grupo
  const group = groups.value.find(g => g.id === groupId)
  return group?.members.some(member => member.id === currentUser.value?.id) || false
}

const userGroups = computed(() => {
  if (!currentUser.value) return []
  
  const isAdmin = currentUser.value.role === 'admin'
  const isSuperAdmin = currentUser.value.role === 'superadmin'
  
  console.log('🔍 USER GROUPS DEBUG:')
  console.log('- Usuario actual:', currentUser.value.email, 'Role:', currentUser.value.role, 'ID:', currentUser.value.id, 'Tipo ID:', typeof currentUser.value.id)
  console.log('- Total grupos en sistema:', groups.value.length)
  console.log('- Todos los grupos:', groups.value.map(g => ({ name: g.name, id: g.id, members: g.members.map(m => ({ id: m.id, username: m.username })) })))
  
  // Admin y SuperAdmin pueden ver todos los grupos
  if (isAdmin || isSuperAdmin) {
    console.log('👑 Admin/SuperAdmin - todos los grupos disponibles')
    return groups.value.filter(group => {
      const isHidden = group.hiddenFor && group.hiddenFor.includes(currentUser.value.id)
      return !isHidden
    })
  }
  
  // Usuarios regulares solo ven grupos donde son miembros
  console.log('👤 Usuario regular - solo grupos donde es miembro')
  const userFilteredGroups = groups.value.filter(group => {
    console.log(`- Grupo "${group.name}":`)
    console.log('  - members:', group.members)
    console.log('  - currentUser.id:', currentUser.value?.id)
    const isMember = group.members.some(member => {
      console.log('    - member.id:', member.id, 'tipo:', typeof member.id)
      console.log('    - currentUser.id:', currentUser.value?.id, 'tipo:', typeof currentUser.value?.id)
      return member.id === currentUser.value?.id
    })
    const isHidden = group.hiddenFor && group.hiddenFor.includes(currentUser.value.id)
    console.log(`  - Es miembro: ${isMember}`)
    console.log(`  - Está oculto: ${isHidden}`)
    return isMember && !isHidden
  })
  console.log('- Grupos visibles para usuario:', userFilteredGroups.length)
  return userFilteredGroups
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
    selectedMonth.value = getCurrentMonth()
    selectedGroup.value = null
    
    if (firebaseUser.value) {
      let user = users.value.find(u => u.email === firebaseUser.value.email)
      if (!user) {
        // Crear nuevo usuario si no existe
        user = {
          id: Date.now(),
          username: firebaseUser.value.displayName || firebaseUser.value.email.split('@')[0],
          email: firebaseUser.value.email,
          photoURL: firebaseUser.value.photoURL,
          uid: firebaseUser.value.uid,
          role: 'user',
          isGoogleUser: true,
          password: null
        }
        users.value.push(user)
      } else {
        // Usuario existente: sincronizar datos de Firebase con los datos del servidor
        user.photoURL = firebaseUser.value.photoURL
        user.uid = firebaseUser.value.uid
        if (firebaseUser.value.displayName) {
          user.username = firebaseUser.value.displayName
        }
        // El rol se mantiene desde el servidor (no se sobrescribe)
      }
      currentUser.value = user
    } else {
      currentUser.value = null
    }
    
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
      users: users.value || [],
      transactions: transactions.value || [],
      groups: groups.value || [],
      settings: {
        masterPassword: MASTER_PASSWORD.value || 'admin123',
        selectedMonth: selectedMonth.value || getCurrentMonth(),
        selectedGroup: selectedGroup.value || null
      }
      // currentUser removido - Firebase Auth maneja esto
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
watch(firebaseUser, async (newFirebaseUser) => {
  if (newFirebaseUser) {
    // Usuario de Firebase autenticado - recargar datos del servidor para obtener roles actualizados
    console.log('🔄 Firebase user autenticado, recargando datos del servidor...')
    await loadData()
    
    // Después de recargar, buscar el usuario actualizado
    const existingUser = users.value.find(u => u.email === newFirebaseUser.email)
    
    if (existingUser) {
      // Usuario local existente: sincronizar datos de Firebase preservando el rol del servidor
      existingUser.photoURL = newFirebaseUser.photoURL
      existingUser.uid = newFirebaseUser.uid
      if (newFirebaseUser.displayName) {
        existingUser.username = newFirebaseUser.displayName
      }
      currentUser.value = existingUser
      console.log('✅ Usuario Google existente sincronizado:', existingUser.email, 'Role:', existingUser.role)
    } else {
      // Nuevo usuario de Firebase (no debería pasar después de loadData, pero por seguridad)
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
      console.log('✅ Nuevo usuario Google creado:', newUser.email, 'Role:', newUser.role)
    }
  } else if (!newFirebaseUser && currentUser.value?.isGoogleUser) {
    // Firebase user logged out y current user es de Google
    currentUser.value = null
  }
})

// Función para refrescar datos del usuario actual
const refreshUserData = async () => {
  if (!currentUser.value) return
  
  try {
    console.log('🔄 Refrescando datos del usuario...')
    const data = await apiService.getAllData()
    users.value = data.users || []
    
    // Buscar y actualizar el usuario actual
    const updatedUser = users.value.find(u => u.email === currentUser.value.email)
    if (updatedUser) {
      currentUser.value = updatedUser
      console.log('✅ Datos del usuario actualizados:', updatedUser.email, 'Role:', updatedUser.role)
      addNotification('Datos de usuario actualizados', 'success')
    }
  } catch (error) {
    console.error('Error al refrescar datos del usuario:', error)
    addNotification('Error al actualizar datos del usuario', 'error')
  }
}

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
    return `Transacciones del grupo ${selectedGroup.value.name.charAt(0).toUpperCase() + selectedGroup.value.name.slice(1).toLowerCase()}`
  }
  return 'Todas las transacciones'
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
    const canEdit = existingTransaction.userId === currentUser.value.id ||
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
  
}

const editTransaction = (transaction) => {
  editing.value = true
  editingTransaction.value = transaction
  formType.value = transaction.type
  showModal.value = true
}

const deleteTransaction = async (transactionId) => {
  const confirmed = await confirm({
    title: 'Eliminar',
    message: '¿Eliminar esta transacción?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    type: 'danger'
  })
  
  if (confirmed) {
    transactions.value = transactions.value.filter(t => t.id !== transactionId)
    
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
  // Sistema de registro local (solo usuarios normales)
  const existingUser = users.value.find(u => u.email === userData.email)
  if (existingUser) {
    addNotification('El usuario ya existe', 'error')
    return
  }
  
  const newUser = {
    id: Date.now(),
    username: userData.email.split('@')[0],
    email: userData.email,
    password: userData.password,
    role: 'user', // Siempre rol 'user' por defecto
    isGoogleUser: false
  }
  
  users.value.push(newUser)
  currentUser.value = newUser
  
  console.log('✅ Usuario manual creado:', newUser.email, 'Role:', newUser.role)
  addNotification('Usuario registrado correctamente', 'success')
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
    
  }
}

const handleUsernameChange = (newUsername) => {
  // Actualizar nombre de usuario del usuario actual
  const userIndex = users.value.findIndex(u => u.id === currentUser.value.id)
  if (userIndex !== -1) {
    users.value[userIndex].username = newUsername
    currentUser.value.username = newUsername
    
    // Actualizar también en todas las transacciones del usuario
    transactions.value.forEach(transaction => {
      if (transaction.userId === currentUser.value.id || transaction.user === currentUser.value.username) {
        transaction.user = newUsername
      }
    })
    
    // Actualizar en todos los grupos donde sea miembro
    groups.value.forEach(group => {
      const memberIndex = group.members.findIndex(m => m.id === currentUser.value.id)
      if (memberIndex !== -1) {
        group.members[memberIndex].username = newUsername
      }
    })
    
    addNotification('Nombre de usuario actualizado correctamente', 'success')
    
  }
}

const handleUserPasswordReset = (userId) => {
  // Encontrar el usuario
  const userToReset = users.value.find(u => u.id === userId)
  if (!userToReset) {
    addNotification('Usuario no encontrado', 'error')
    return
  }
  
  // Verificar permisos de reseteo
  const currentUserRole = currentUser.value.role
  const targetUserRole = userToReset.role
  
  let canReset = false
  
  if (currentUserRole === 'superadmin') {
    // SuperAdmin puede resetear admin y user
    canReset = targetUserRole === 'admin' || targetUserRole === 'user'
  } else if (currentUserRole === 'admin') {
    // Admin solo puede resetear user
    canReset = targetUserRole === 'user'
  }
  
  if (!canReset) {
    addNotification('No tienes permisos para resetear la contraseña de este usuario', 'error')
    return
  }
  
  // Resetear contraseña a "123" por defecto
  const userIndex = users.value.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    users.value[userIndex].password = '123'
    addNotification(`Contraseña reseteada para ${userToReset.username}. Nueva contraseña: 123`, 'success')
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
  
  // Verificar permisos de eliminación
  const currentUserRole = currentUser.value.role
  const targetUserRole = userToDelete.role
  
  let canDelete = false
  
  if (currentUserRole === 'superadmin') {
    // SuperAdmin puede eliminar admin y user
    canDelete = targetUserRole === 'admin' || targetUserRole === 'user'
  } else if (currentUserRole === 'admin') {
    // Admin solo puede eliminar user
    canDelete = targetUserRole === 'user'
  }
  
  if (!canDelete) {
    addNotification('No tienes permisos para eliminar este usuario', 'error')
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
  
  
  addNotification(`¡Te has unido al grupo "${group.name}"! El código de invitación ha sido invalidado.`, 'success')
}

const handleRemoveMember = ({ groupId, memberId }) => {
  const group = groups.value.find(g => g.id === groupId)
  if (!group) return
  
  group.members = group.members.filter(m => m.id !== memberId)
  
}

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

const handleGenerateNewCode = (groupId) => {
  const group = groups.value.find(g => g.id === groupId)
  if (!group) return
  
  // Generar nuevo código
  group.inviteCode = generateInviteCode()
  
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
  if (!group) {
    addNotification('Grupo no encontrado', 'error')
    return
  }
  
  // Verificar permisos de eliminación
  const currentUserRole = currentUser.value.role
  let canDelete = false
  
  if (currentUserRole === 'superadmin') {
    // SuperAdmin puede eliminar cualquier grupo
    canDelete = true
  } else if (currentUserRole === 'admin') {
    // Admin puede eliminar grupos creados por usuarios con rol 'user'
    const groupCreator = users.value.find(u => u.id === group.createdBy)
    canDelete = groupCreator && groupCreator.role === 'user'
  } else if (currentUserRole === 'user') {
    // Usuario regular solo puede eliminar grupos que creó
    canDelete = group.createdBy === currentUser.value.id
  }
  
  if (!canDelete) {
    addNotification('No tienes permisos para eliminar este grupo', 'error')
    return
  }
  
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
/* App-specific styles only - global styles moved to design-system.css */

/* Global styles moved to design-system.css */

#app {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.loading {
  text-align: center;
  padding: var(--spacing-4xl);
  color: var(--text-muted);
}

.offline {
  background: var(--color-danger);
  color: var(--bg-primary);
  padding: var(--spacing-md);
  text-align: center;
  font-weight: var(--font-weight-semibold);
}

/* Header */
.header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: var(--spacing-lg) var(--spacing-2xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  position: relative;
  z-index: 2;
}

.mcdonalds-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.app-icon {
  width: 32px;
  height: 32px;
  color: var(--text-primary);
  background: transparent;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-xs);
  border: 1px solid var(--border-primary);
}

.header h1 {
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.025em;
  margin: 0;
  font-family: var(--font-family-base);
}

.slogan {
  display: none;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

/* Header buttons using design system */
.btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
  text-decoration: none;
  height: 36px;
}

.btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.btn-income {
  background: var(--color-success);
  color: var(--bg-primary);
  border-color: var(--color-success);
}

.btn-income:hover {
  background: var(--color-success-hover);
  border-color: var(--color-success-hover);
}

.btn-expense {
  background: var(--color-danger);
  color: var(--bg-primary);
  border-color: var(--color-danger);
}

.btn-expense:hover {
  background: var(--color-danger-hover);
  border-color: var(--color-danger-hover);
}

.dashboard {
  padding: var(--spacing-2xl);
  display: grid;
  grid-template-columns: 350px 1fr;
  grid-template-rows: auto;
  gap: var(--spacing-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard > *:first-child {
  grid-column: 1;
  grid-row: 1;
}

.dashboard > *:last-child {
  grid-column: 2;
  grid-row: 1;
}

h3 {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: var(--spacing-lg);
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .header h1 {
    font-size: var(--font-size-2xl);
    text-align: center;
    margin-bottom: var(--spacing-sm);
  }
  
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: var(--spacing-sm);
    width: 100%;
  }
  
  .actions > button:nth-child(1) { grid-column: 1; grid-row: 1; }
  .actions > button:nth-child(2) { grid-column: 2; grid-row: 1; }
  .actions > button:nth-child(3) { grid-column: 1; grid-row: 2; }
  .actions > select:nth-child(4) { grid-column: 2; grid-row: 2; }
  .actions > *:nth-child(5) { grid-column: 1; grid-row: 3; }
  .actions > button:nth-child(6) { grid-column: 2; grid-row: 3; }
  .actions > button:nth-child(7) { grid-column: 2; grid-row: 3; }
  
  .dashboard {
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    max-width: 100%;
  }
  
  .btn {
    padding: var(--spacing-md) var(--spacing-sm);
    font-size: var(--font-size-sm);
    min-width: 44px;
    height: 44px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 12px;
    gap: 10px;
  }
  
  .header h1 {
    font-size: 1.25rem;
    margin-bottom: 4px;
  }
  
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Solo 2 columnas */
    grid-template-rows: auto auto; /* 2 filas iniciales */
    gap: 8px;
    width: 100%;
    align-items: stretch;
  }
  
  /* Primera fila: Solo Ingresos y Gastos */
  .actions > button:nth-child(1) { /* Botón Ingresos */
    grid-column: 1; 
    grid-row: 1; 
  }
  
  .actions > button:nth-child(2) { /* Botón Gastos */
    grid-column: 2; 
    grid-row: 1; 
  }
  
  /* Segunda fila: DatePicker y GroupSelector */
  .actions > *:nth-child(3) { /* GroupSelectorModal */
    grid-column: 2; 
    grid-row: 2; 
  }
  
  .actions > *:nth-child(4) { /* DatePicker */
    grid-column: 1; 
    grid-row: 2; 
  }
  
  /* Tercera fila: Grupos y Perfil */
  .actions > button:nth-child(5) { /* Botón Grupos */
    grid-column: 1; 
    grid-row: 3; 
  }
  
  .actions > button:nth-child(6) { /* Botón Perfil */
    grid-column: 2; 
    grid-row: 3; 
  }
  
  /* Estilos para todos los botones en móvil */
  .actions > button {
    width: 100%;
    height: 44px;
    min-width: 0;
    max-width: 100%;
    padding: 10px 8px;
    font-size: 12px;
    font-weight: 600;
    gap: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Estilos para los componentes (GroupSelector, DatePicker) */
  .actions > *:not(button) {
    width: 100%;
    height: 44px;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  /* Iconos más pequeños en móvil */
  .actions svg {
    width: 18px !important;
    height: 18px !important;
    flex-shrink: 0;
  }
  
  .dashboard {
    padding: var(--spacing-sm);
    gap: var(--spacing-lg);
  }
}
</style>