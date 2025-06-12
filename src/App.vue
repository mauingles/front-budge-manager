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
      <header class="header">
        <h1>Budget Manager</h1>
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
            Egresos
          </button>
          <GroupSelectorModal 
            v-model="selectedGroup" 
            :available-groups="userGroups" 
          />
          <DatePicker v-model="selectedMonth" />
          <button @click="openGroupModal" class="btn" title="Equipos">
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
const selectedGroup = ref(null) // Equipo seleccionado actualmente
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
  
  // Filtrar por acceso del usuario (TODOS los usuarios siguen las mismas reglas)
  filtered = filtered.filter(t => {
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
  
  // TODOS los usuarios (incluyendo admin/superadmin) deben ser miembros del grupo
  const group = groups.value.find(g => g.id === groupId)
  return group?.members.some(member => member.id === currentUser.value?.id) || false
}

const userGroups = computed(() => {
  if (!currentUser.value) return []
  
  console.log('🔍 USER GROUPS DEBUG:')
  console.log('- Usuario actual:', currentUser.value.email, 'Role:', currentUser.value.role, 'ID:', currentUser.value.id, 'Tipo ID:', typeof currentUser.value.id)
  console.log('- Total grupos en sistema:', groups.value.length)
  console.log('- Todos los grupos:', groups.value.map(g => ({ name: g.name, id: g.id, members: g.members.map(m => ({ id: m.id, username: m.username })) })))
  
  // TODOS los usuarios (incluyendo admin/superadmin) solo ven grupos donde son miembros
  console.log('👤 Todos los usuarios - solo grupos donde son miembros')
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
    return `Transacciones del Equipo ${selectedGroup.value.name}`
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
  
  console.log('✅ Usuario manual creado:', newUser.email, 'Role:', newUser.role)
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

const handleUserPasswordReset = (resetData) => {
  // Encontrar y actualizar la contraseña del usuario
  const userIndex = users.value.findIndex(u => u.id === resetData.userId)
  if (userIndex !== -1) {
    users.value[userIndex].password = resetData.newPassword
    
    // Si es el usuario actual, también actualizar currentUser
    if (currentUser.value.id === resetData.userId) {
      currentUser.value.password = resetData.newPassword
    }
    
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
    addNotification('Ya eres miembro de este equipo', 'warning')
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
  
  
  addNotification(`¡Te has unido al equipo "${group.name}"! El código de invitación ha sido invalidado.`, 'success')
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
  
  addNotification(`Has salido del equipo "${group.name}"`, 'success')
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
      addNotification(`¡Te has unido al equipo "${group.name}"!`, 'success')
    } else {
      addNotification('Ya eres miembro de este equipo', 'warning')
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
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
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

.loading {
  text-align: center;
  padding: 40px;
  color: white;
}

.offline {
  background: #ef4444;
  color: white;
  padding: 12px;
  text-align: center;
  font-weight: 600;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.header h1 {
  color: #0f172a;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-income {
  border-color: #10b981;
  color: #10b981;
  background: #ecfdf5;
}

.btn-income:hover {
  background: #d1fae5;
  border-color: #059669;
}

.btn-expense {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

.btn-expense:hover {
  background: #fee2e2;
  border-color: #dc2626;
}

.btn-logout {
  border-color: #475569;
  color: #334155;
  background: #f8fafc;
  width: auto !important;
  max-width: 24px !important;
  min-width: 24px !important;
  padding: 8px 2px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.btn-logout:hover {
  background: #f1f5f9;
  border-color: #334155;
  color: #1e293b;
}

.dashboard {
  padding: 24px;
  display: grid;
  grid-template-columns: 350px 1fr;
  grid-template-rows: auto;
  gap: 24px;
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
  margin: 0 0 20px 0;
  color: #0f172a;
  font-weight: 600;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 16px;
    gap: 12px;
    align-items: stretch;
  }
  
  .header h1 {
    font-size: 1.5rem;
    text-align: center;
    margin-bottom: 8px;
  }
  
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 8px;
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
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 100%;
  }
  
  .btn {
    padding: 12px 8px;
    font-size: 13px;
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
  
  /* Primera fila: Solo Ingresos y Egresos */
  .actions > button:nth-child(1) { /* Botón Ingresos */
    grid-column: 1; 
    grid-row: 1; 
  }
  
  .actions > button:nth-child(2) { /* Botón Egresos */
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
  
  /* Tercera fila: Equipos y Perfil */
  .actions > button:nth-child(5) { /* Botón Equipos */
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
    width: 16px !important;
    height: 16px !important;
    flex-shrink: 0;
  }
  
  .dashboard {
    padding: 8px;
    gap: 16px;
  }
  
  select {
    font-size: 12px;
    padding: 10px 8px;
    min-width: unset;
    height: 40px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    color: #334155;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 8px center;
    background-repeat: no-repeat;
    background-size: 16px;
    padding-right: 32px;
    position: relative;
  }
  
  select:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}
</style>