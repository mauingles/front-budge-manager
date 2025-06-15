<template>
  <AppLayout>
    
    <!-- Estados de carga y conexión -->
    <div v-if="isLoading" class="loading">Cargando...</div>
    <div v-else-if="!isOnline && !isLoading" class="offline">Sin conexión</div>
    
    <!-- Login form si no hay usuario autenticado -->
    <LoginForm v-else-if="!currentUser && !authLoading" 
      @login="handleLogin" 
      @register="handleRegister"
      @google-login="handleGoogleLogin" />
    
    <!-- App principal si está autenticado -->
    <div v-else-if="currentUser && !authLoading" class="main-app">
      <header class="header whatsapp-header">
        <!-- Botón perfil flotante solo en móvil -->
        <button @click="showUserModal = true" class="btn-profile-mobile" title="Perfil de usuario">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
        
        <div class="header-title">
          <svg class="app-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
          </svg>
          <h1>Budget Manager</h1>
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
          <DatePicker v-model="selectedMonth" />
          <ExpenseDivisionModal 
            :selected-group="selectedGroup"
            :transactions="transactions"
            :selected-month="selectedMonth"
            @division-change="handleDivisionChange"
          />
          
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
          :selected-group="selectedGroup"
          :available-groups="userGroups"
          :current-user="currentUser"
          @update:selectedGroup="handleGroupChange"
          @generate-invite-code="handleGenerateInviteCode"
          @create-group="openGroupManagement"
          @create-group-for-sharing="handleCreateGroupForSharing" />
        
        <BaseCard>
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Transacciones
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
      <TransactionForm 
        :initial-type="formType"
        :selected-month="selectedMonth"
        :current-user="currentUser?.username || currentUser?.email || currentUser?.displayName"
        :editing-transaction="editingTransaction"
        :is-editing="editing"
        :available-groups="userGroups"
        :preselected-group="selectedGroup"
        @submit="saveTransaction"
        @create-group="handleCreateGroupFromTransaction" />
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
      @open-group-management="openGroupManagement"
      @logout="handleLogout" />
    
    <GroupManagementModal 
      :show="showGroupManagementModal"
      :current-user="currentUser"
      :user-groups="userGroups"
      :all-groups="groups"
      :all-users="users"
      :selected-group="selectedGroup"
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

      <ConfirmDialog
      :show="autoGroupJoin.show"
      :title="autoGroupJoin.title"
      :message="autoGroupJoin.message"
      :confirm-text="autoGroupJoin.confirmText"
      :cancel-text="autoGroupJoin.cancelText"
      :type="autoGroupJoin.type"
      @confirm="autoGroupJoinHandleConfirm"
      @cancel="autoGroupJoinHandleCancel"
      @close="autoGroupJoinCloseConfirm" />

    <!-- PWA Install Component -->
    <pwa-install
      ref="pwaInstallRef"
      manual-chrome="false"
      manual-apple="false"
      install-description="¡Instala Budget Manager para acceso rápido desde tu escritorio!"
      name="Budget Manager"
      description="Gestiona tu presupuesto de forma fácil y rápida"
      disable-screenshots="true"
      @pwa-install-success-event="handlePWAInstallSuccess"
      @pwa-install-fail-event="handlePWAInstallFail"
      @pwa-user-choice-result-event="handlePWAUserChoice"
    ></pwa-install>
  </AppLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import AppLayout from './components/AppLayout.vue'
import MonthlyBalance from './components/MonthlyBalance.vue'
import BaseCard from './components/BaseCard.vue'
import TransactionList from './components/TransactionList.vue'
import BaseModal from './components/BaseModal.vue'
import TransactionForm from './components/TransactionForm.vue'
import DatePicker from './components/DatePicker.vue'
import GroupSelectorModal from './components/GroupSelectorModal.vue'
import ExpenseDivisionModal from './components/ExpenseDivisionModal.vue'
import LoginForm from './components/LoginForm.vue'
import UserModal from './components/UserModal.vue'
import GroupManagementModal from './components/GroupManagementModal.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import '@khmyznikov/pwa-install'
import apiService from './services/api.js'
import * as firestoreService from './services/firestore.js'
import { useAuth } from '@/composables/useAuth.js'
import { useNotifications } from '@/composables/useNotifications.js'
import { useConfirm } from '@/composables/useConfirm.js'
import { usePWA } from '@/composables/usePWA.js'

const { user: firebaseUser, loading: authLoading, logout: firebaseLogout } = useAuth()
const { addNotification } = useNotifications()
const { confirmState, confirm, handleConfirm, handleCancel, closeConfirm } = useConfirm()
const { confirmState: autoGroupJoin, confirm: autoGroupJoinConfirm, handleConfirm: autoGroupJoinHandleConfirm, handleCancel: autoGroupJoinHandleCancel, closeConfirm: autoGroupJoinCloseConfirm } = useConfirm()

// PWA functionality
const {
  isInstalled,
  canInstall,
  isStandalone,
  isOnline: pwaIsOnline,
  updateAvailable,
  updateApp,
  isMobile
} = usePWA()

// Estado de conexión
const isLoading = ref(true)
const isOnline = ref(true)
const errorMessage = ref('')
// isFirestoreEnabled variable removed - always using Firestore now
const hasMigrated = ref(false)
const groupCodeHandled = ref(false)

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
const pendingGroupForSharing = ref(false)

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
  // console.log('🔍 Calculando userGroups para:', currentUser.value?.email, 'Role:', currentUser.value?.role)
  // console.log('📊 Total grupos disponibles:', groups.value.length)
  
  if (!currentUser.value) {
    console.log('❌ No hay currentUser - retornando array vacío')
    return []
  }
  
  const isAdmin = currentUser.value.role === 'admin'
  const isSuperAdmin = currentUser.value.role === 'superadmin'
  
  // Admin y SuperAdmin pueden ver todos los grupos
  if (isAdmin || isSuperAdmin) {
    console.log('👑 Usuario admin/superadmin - mostrando todos los grupos')
    return groups.value.filter(group => {
      const isHidden = group.hiddenFor && group.hiddenFor.includes(currentUser.value.id)
      return !isHidden
    }).map(group => {
      // Para admins, mostrar el nombre original
      return {
        ...group,
        displayName: group.name
      }
    })
  }
  
  // console.log('👤 Usuario regular - filtrando grupos por membresía')
  // console.log('🆔 Usuario ID:', currentUser.value.id)
  // console.log('📧 Usuario email:', currentUser.value.email)
  // console.log('👤 Username:', currentUser.value.username)
  
  // Usuarios regulares solo ven grupos donde son miembros
  const userFilteredGroups = groups.value.filter(group => {
    console.log(`🔍 Evaluando grupo "${group.name}":`)
    console.log('   📋 Miembros:', group.members)
    console.log('   👤 Creado por:', group.createdBy)
    
    // Manejar tanto formato de miembros como strings o como objetos
    const isMember = group.members.some(member => {
      if (typeof member === 'string') {
        // Si el miembro es un string, comparar con el username
        const match = member === currentUser.value?.username || member === currentUser.value?.email?.split('@')[0]
        console.log(`   ✅ String member "${member}" matches: ${match}`)
        return match
      } else {
        // Si el miembro es un objeto, usar el ID
        const match = member.id === currentUser.value?.id
        console.log(`   ✅ Object member ID ${member.id} matches current user ID ${currentUser.value?.id}: ${match}`)
        return match
      }
    })
    
    const isHidden = group.hiddenFor && group.hiddenFor.includes(currentUser.value.id)
    const shouldShow = isMember && !isHidden
    
    console.log(`   🏆 Resultado - Es miembro: ${isMember}, Está oculto: ${isHidden}, Mostrar: ${shouldShow}`)
    
    return shouldShow
  }).map(group => {
    // Buscar si el usuario tiene un displayName personalizado para este grupo
    const userMember = group.members.find(member => {
      if (typeof member === 'string') {
        return member === currentUser.value?.username || member === currentUser.value?.email?.split('@')[0]
      } else {
        return member.id === currentUser.value.id
      }
    })
    const displayName = (typeof userMember === 'object' ? userMember?.displayName : null) || group.name
    
    return {
      ...group,
      displayName: displayName
    }
  })
  
  console.log(`📈 Total grupos filtrados para mostrar: ${userFilteredGroups.length}`)
  console.log('📝 Grupos a mostrar:', userFilteredGroups.map(g => g.name))
  
  return userFilteredGroups
})

// Configuración inicial de Firestore
const initializeFirestore = async () => {
  try {
    console.log('🔥 Inicializando Firestore...')
    
    // Configurar listeners en tiempo real
    setupRealtimeListeners()
    
    console.log('✅ Firestore inicializado correctamente')
    
  } catch (error) {
    console.error('❌ Error inicializando Firestore:', error)
    addNotification('Error conectando a Firestore', 'error')
    throw error // Propagar el error para manejo en onMounted
  }
}

// Configurar todos los listeners en tiempo real
const setupRealtimeListeners = () => {
  console.log('👂 Configurando listeners en tiempo real...')
  
  // Listener para usuarios
  firestoreService.listenToUsers((updatedUsers) => {
    console.log('🔄 Usuarios actualizados desde Firestore:', updatedUsers.length)
    console.log('👥 Usuarios:', updatedUsers.map(u => u.email))
    users.value = updatedUsers
    
    // Actualizar usuario actual si existe y está autenticado
    if (currentUser.value && firebaseUser.value) {
      const updatedCurrentUser = users.value.find(u => u.email === firebaseUser.value.email)
      if (updatedCurrentUser) {
        currentUser.value = updatedCurrentUser
      }
    } else if (firebaseUser.value && !currentUser.value) {
      // Si hay usuario de Firebase pero no currentUser, intentar autenticación
      handleUserAuthentication()
    }
  })
  
  // Listener para transacciones
  firestoreService.listenToTransactions((updatedTransactions) => {
    console.log('🔄 Transacciones actualizadas desde Firestore:', updatedTransactions.length)
    transactions.value = updatedTransactions
  })
  
  // Listener para grupos
  firestoreService.listenToGroups((updatedGroups) => {
    console.log('🔄 Grupos actualizados desde Firestore:', updatedGroups.length)
    console.log('🏢 Grupos:', updatedGroups.map(g => ({ name: g.name, createdBy: g.createdBy, members: g.members?.map(m => m.username) })))
    groups.value = updatedGroups
    
    // Actualizar grupo seleccionado si existe
    if (selectedGroup.value) {
      const updatedSelectedGroup = groups.value.find(g => g.id === selectedGroup.value.id)
      if (updatedSelectedGroup) {
        selectedGroup.value = updatedSelectedGroup
      } else {
        selectedGroup.value = null
      }
    }
    
    // Asegurar que siempre haya un grupo seleccionado
    autoSelectGroup()
  })
  
  // Listener para configuraciones
  firestoreService.listenToSettings((updatedSettings) => {
    console.log('🔄 Configuraciones actualizadas desde Firestore')
    MASTER_PASSWORD.value = updatedSettings.masterPassword || 'admin123'
    // No actualizar selectedMonth automáticamente desde Firestore para preservar la experiencia del usuario
  })
}


// Manejo de autenticación de usuario
const handleUserAuthentication = async () => {
  console.log('🔐 Autenticando usuario:', firebaseUser.value?.email)
  console.log('🆔 Firebase UID:', firebaseUser.value?.uid)
  console.log('📊 Usuarios cargados en memory:', users.value.length)
  
  if (firebaseUser.value) {
    // Si no hay usuarios cargados aún, esperar un poco
    if (users.value.length === 0) {
      console.log('⏳ No hay usuarios cargados, esperando 3 segundos...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      console.log('📊 Usuarios después de esperar:', users.value.length)
    }
    
    // Buscar por email Y por UID para mayor seguridad
    let user = users.value.find(u => 
      u.email === firebaseUser.value.email || u.uid === firebaseUser.value.uid
    )
    console.log('👤 Usuario encontrado en DB:', user ? `Sí (ID: ${user.id})` : 'No')
    
    if (!user) {
      // Crear nuevo usuario si no existe - USAR UID como ID base
      const userId = firebaseUser.value.uid.slice(-10) // Usar los últimos 10 caracteres del UID
      const numericId = parseInt(userId, 36) || Date.now() // Convertir a número o usar timestamp como fallback
      
      user = {
        id: numericId,
        username: firebaseUser.value.displayName || firebaseUser.value.email.split('@')[0],
        email: firebaseUser.value.email,
        photoURL: firebaseUser.value.photoURL,
        uid: firebaseUser.value.uid,
        role: 'user',
        isGoogleUser: true,
        password: null
      }
      
      console.log('🆕 Creando nuevo usuario con ID:', user.id)
      await firestoreService.addUser(user)
      
      // Crear grupo por defecto "Mis finanzas" para el nuevo usuario y seleccionarlo
      const defaultGroup = await createDefaultGroup(user)
      selectedGroup.value = defaultGroup
    } else {
      // Usuario existente: sincronizar datos de Firebase con los datos del servidor
      console.log('🔄 Actualizando datos de usuario existente')
      user.photoURL = firebaseUser.value.photoURL
      user.uid = firebaseUser.value.uid
      if (firebaseUser.value.displayName) {
        user.username = firebaseUser.value.displayName
      }
    }
    
    currentUser.value = user
    
    // Si es un usuario existente sin grupo seleccionado, seleccionar su grupo "Mis finanzas" si existe
    if (!selectedGroup.value || (user.role === 'user' && !selectedGroup.value)) {
      const userDefaultGroup = groups.value.find(g => 
        g.createdBy === user.id && g.name === 'Mis finanzas'
      )
      if (userDefaultGroup) {
        console.log('📌 Seleccionando grupo existente "Mis finanzas" para usuario existente')
        selectedGroup.value = userDefaultGroup
      } else {
        console.log('⚠️ Usuario existente sin grupo "Mis finanzas" - esto no debería pasar')
        // No crear el grupo aquí para usuarios existentes
        // Dejar que se maneje en el watcher de grupos cuando se carguen
      }
    }
    
    await handleGroupCode()
    
    // Auto-seleccionar grupo después de autenticación
    autoSelectGroup()
  } else {
    currentUser.value = null
    selectedGroup.value = null
  }
}


// Watcher para sincronizar Firebase user con currentUser
watch(firebaseUser, async (newFirebaseUser) => {
  if (newFirebaseUser) {
    // Usuario autenticado - manejar después de que Firestore esté inicializado
    if (!isLoading.value) {
      await handleUserAuthentication()
    }
  } else if (!newFirebaseUser && currentUser.value?.isGoogleUser) {
    // Firebase user logged out
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

// Watcher para configuraciones en Firestore
watch([MASTER_PASSWORD], async () => {
  if (!isLoading.value) {
    try {
      await firestoreService.updateSettings({
        masterPassword: MASTER_PASSWORD.value
      })
    } catch (error) {
      console.error('Error actualizando configuraciones en Firestore:', error)
    }
  }
}, { deep: true })

// Función temporal para limpiar grupos duplicados "Mis finanzas"
const cleanupDuplicateGroups = async () => {
  if (!currentUser.value || groups.value.length === 0) return
  
  // Encontrar todos los grupos "Mis finanzas" del usuario actual
  const misFinanzasGroups = groups.value.filter(g => 
    g.name === 'Mis finanzas' && 
    g.members.some(member => {
      if (typeof member === 'string') {
        return member === currentUser.value.username || member === currentUser.value.email?.split('@')[0]
      } else {
        return member.id === currentUser.value.id
      }
    })
  )
  
  // Solo log si hay múltiples grupos
  if (misFinanzasGroups.length > 1) {
    console.log(`🧹 Encontrados ${misFinanzasGroups.length} grupos "Mis finanzas" para este usuario`)
  }
  
  if (misFinanzasGroups.length > 1) {
    console.log('🗑️ Eliminando grupos duplicados...')
    // Mantener solo el más reciente (mayor ID)
    const sortedGroups = misFinanzasGroups.sort((a, b) => b.id - a.id)
    const keepGroup = sortedGroups[0]
    const toDelete = sortedGroups.slice(1)
    
    let actuallyDeleted = 0
    for (const group of toDelete) {
      console.log(`🗑️ Eliminando grupo duplicado: ${group.id}`)
      try {
        await firestoreService.deleteGroup(group.id)
        actuallyDeleted++
      } catch (error) {
        console.error(`❌ Error eliminando grupo duplicado ${group.id}:`, error)
      }
    }
    
    // Solo mostrar mensaje si realmente se eliminaron grupos
    if (actuallyDeleted > 0) {
      // Seleccionar el grupo que se mantiene
      selectedGroup.value = keepGroup
      addNotification('Grupos duplicados limpiados', 'success', 2000)
    }
  }
}

// Watcher para seleccionar grupo por defecto cuando se cargan los grupos
watch([groups, currentUser], async () => {
  if (currentUser.value && groups.value.length > 0) {
    // Limpiar duplicados primero
    await cleanupDuplicateGroups()
    
    // Luego seleccionar el grupo por defecto si no hay ninguno seleccionado
    if (!selectedGroup.value) {
      console.log('👀 Grupos cargados, verificando grupo por defecto para usuario existente')
      const userDefaultGroup = groups.value.find(g => 
        g.createdBy === currentUser.value.id && g.name === 'Mis finanzas'
      )
      if (userDefaultGroup) {
        console.log('✅ Seleccionando grupo "Mis finanzas" existente')
        selectedGroup.value = userDefaultGroup
      }
    }
  }
}, { immediate: true })

// Inicializar aplicación al montar
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Siempre usar Firestore, tanto en localhost como en producción
    console.log('🔥 Inicializando Firestore para todos los entornos')
    await initializeFirestore()
    
    // Después de inicializar, manejar autenticación si hay usuario de Firebase
    if (firebaseUser.value) {
      await handleUserAuthentication()
    }
    
    if (currentUser.value) {
      await handleGroupCode()
    }
  } catch (error) {
    console.error('Error inicializando aplicación:', error)
    addNotification('Error inicializando la aplicación', 'error')
  } finally {
    isLoading.value = false
  }
})

// Limpiar listeners al desmontar
onUnmounted(() => {
  firestoreService.unsubscribeAll()
})

// Función para seleccionar automáticamente un grupo cuando no hay ninguno seleccionado
const autoSelectGroup = () => {
  if (!currentUser.value || selectedGroup.value) return
  
  console.log('🔍 Auto-seleccionando grupo...')
  
  // Obtener grupos accesibles para el usuario actual
  const accessibleGroups = userGroups.value
  
  if (accessibleGroups.length === 0) {
    console.log('⚠️ No hay grupos accesibles para auto-seleccionar')
    return
  }
  
  // Prioridades para la selección automática:
  // 1. Grupo "Mis finanzas" del usuario actual
  // 2. Primer grupo donde el usuario es admin
  // 3. Primer grupo donde el usuario es miembro
  // 4. Primer grupo accesible
  
  let groupToSelect = null
  
  // 1. Buscar "Mis finanzas" del usuario
  groupToSelect = accessibleGroups.find(g => 
    g.name === 'Mis finanzas' && g.createdBy === currentUser.value.id
  )
  
  // 2. Si no hay "Mis finanzas", buscar grupo donde es admin
  if (!groupToSelect) {
    groupToSelect = accessibleGroups.find(g => {
      const member = g.members?.find(m => m.id === currentUser.value.id)
      return member?.role === 'admin'
    })
  }
  
  // 3. Si no es admin de ninguno, buscar donde es miembro
  if (!groupToSelect) {
    groupToSelect = accessibleGroups.find(g => 
      g.members?.some(m => m.id === currentUser.value.id)
    )
  }
  
  // 4. Si nada más funciona, tomar el primer grupo accesible
  if (!groupToSelect) {
    groupToSelect = accessibleGroups[0]
  }
  
  if (groupToSelect) {
    console.log('✅ Auto-seleccionado grupo:', groupToSelect.name)
    selectedGroup.value = groupToSelect
  } else {
    console.log('❌ No se pudo auto-seleccionar ningún grupo')
  }
}

// Métodos
const handleGroupCode = async () => {
  // Evitar ejecutar múltiples veces
  if (groupCodeHandled.value) return
  
  const url = new URL(window.location)
  const groupCode = url.searchParams.get('groupCode')
  if(groupCode) {
    groupCodeHandled.value = true
    
    console.log('🔗 Procesando código de URL:', groupCode)
    console.log('👥 Grupos cargados:', groups.value.length)
    console.log('📋 Códigos disponibles:', groups.value.map(g => ({ name: g.name, code: g.inviteCode, id: g.id })))
    
    // Si no hay grupos cargados aún, esperar un poco
    if (groups.value.length === 0) {
      console.log('⏳ No hay grupos cargados, esperando...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('👥 Grupos después de esperar:', groups.value.length)
      console.log('📋 Códigos después de esperar:', groups.value.map(g => ({ name: g.name, code: g.inviteCode, id: g.id })))
    }
    
    // Buscar el grupo por código de invitación
    const group = groups.value.find(g => g.inviteCode === groupCode)
    if(!group) {
      console.error('❌ Grupo no encontrado con código:', groupCode)
      console.error('📋 Códigos actuales:', groups.value.map(g => g.inviteCode))
      addNotification('Este código no existe o ya fue usado. Pide que te envíen un nuevo código de invitación.', 'error')
      return;
    }
    
    console.log('✅ Grupo encontrado:', group.name, 'ID:', group.id)
    
    // Verificar si el usuario ya es miembro del grupo
    const isAlreadyMember = group.members.some(m => m.id === currentUser.value.id)
    if (isAlreadyMember) {
      addNotification(`Ya eres miembro del grupo "${group.name}"`, 'info')
      selectedGroup.value = group
      window.history.pushState({}, document.title, "/" + '' )
      return
    }
    
    // Validar expiración del código
    if (group.inviteCodeCreatedAt) {
      const createdAt = new Date(group.inviteCodeCreatedAt)
      const now = new Date()
      const hoursDiff = (now - createdAt) / (1000 * 60 * 60)
      
      if (hoursDiff > (group.inviteCodeExpiresIn || 3)) {
        addNotification('Este código ha caducado. Pide que te envíen un nuevo código de invitación.', 'error')
        return
      }
    }
    
    // Validar límite de usos
    if ((group.inviteCodeUsedCount || 0) >= (group.inviteCodeMaxUses || 5)) {
      addNotification('Este código ya fue usado el máximo de veces. Pide que te envíen un nuevo código de invitación.', 'error')
      return
    }
    
    // Mostrar confirmación para unirse al grupo
    const admin = group.members.find(m => m.role === 'admin');
    const acceptedInvitation = await autoGroupJoinConfirm({
      title: 'Has sido invitado a unirse a un grupo',
      message: `${admin.username} te invitó a unirte al grupo ${group.name}`,
      confirmText: 'Unirse',
      cancelText: 'Cancelar',
    })

    if(acceptedInvitation) {
      await handleJoinGroup(groupCode);
      // El grupo se seleccionará automáticamente después de unirse exitosamente
    }
    window.history.pushState({}, document.title, "/" + '' );
  }
}

const openForm = (type) => {
  formType.value = type
  showModal.value = true
}

const openGroupManagement = () => {
  showUserModal.value = false // Cerrar el modal de usuario
  showGroupManagementModal.value = true // Abrir gestión de grupos
}

const handleCreateGroupForSharing = () => {
  pendingGroupForSharing.value = true
  showGroupManagementModal.value = true
}

const handleCreateGroupFromTransaction = () => {
  // Cerrar el modal de transacción
  showModal.value = false
  // Abrir el modal de gestión de grupos
  showGroupManagementModal.value = true
}

const handleGroupChange = (newGroup) => {
  selectedGroup.value = newGroup
}

const handleDivisionChange = (divisionType) => {
  console.log('División seleccionada:', divisionType)
  addNotification(`División seleccionada: ${getDivisionDisplayName(divisionType)}`, 'success')
}

const getDivisionDisplayName = (type) => {
  switch(type) {
    case 'equal': return 'Todos por igual'
    case 'percentage': return 'Por porcentaje'
    case 'custom': return 'Montos específicos'
    case 'none': return 'Sin dividir'
    default: return 'Desconocido'
  }
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
  return formType.value === 'income' ? 'Categoría' : 'Categoría'
}

const getTransactionsSectionTitle = () => {
  return 'Transacciones'
}
const saveTransaction = async (transaction) => {
  try {
    // Agregar datos de usuario y grupo a la transacción
    const transactionData = {
      ...transaction,
      groupId: transaction.groupId || null,
      userId: currentUser.value.id,
      createdAt: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    if (editing.value && editingTransaction.value) {
      // Editar transacción existente
      const existingTransaction = transactions.value.find(t => t.id === editingTransaction.value.id)
      
      if (existingTransaction.userId !== currentUser.value.id) {
        addNotification('Solo el creador puede editar esta transacción', 'error')
        return
      }
      
      const updatedTransaction = {
        ...transactionData,
        id: editingTransaction.value.id,
        userId: existingTransaction.userId
      }
      
      await firestoreService.updateTransaction(editingTransaction.value.id, updatedTransaction)
      
      const typeText = transactionData.type === 'income' ? 'ingreso' : 'gasto'
      addNotification(`${typeText.charAt(0).toUpperCase() + typeText.slice(1)} editado correctamente`, 'success', 2000)
    } else {
      // Agregar nueva transacción
      const newTransaction = {
        ...transactionData,
        id: Date.now()
      }
      
      await firestoreService.addTransaction(newTransaction)
      
      const typeText = transactionData.type === 'income' ? 'ingreso' : 'gasto'
      addNotification(`${typeText.charAt(0).toUpperCase() + typeText.slice(1)} creado correctamente`, 'success', 2000)
    }
    
    closeModal()
  } catch (error) {
    console.error('Error guardando transacción:', error)
    addNotification('Error guardando la transacción', 'error')
  }
}

const editTransaction = (transaction) => {
  // Verificar que solo el creador pueda editar
  if (transaction.userId !== currentUser.value.id) {
    addNotification('Solo el creador puede editar esta transacción', 'error')
    return
  }
  
  editing.value = true
  editingTransaction.value = transaction
  formType.value = transaction.type
  showModal.value = true
}

const deleteTransaction = async (transactionId) => {
  try {
    const transaction = transactions.value.find(t => t.id === transactionId)
    if (!transaction) {
      addNotification('Transacción no encontrada', 'error')
      return
    }
    
    if (transaction.userId !== currentUser.value.id) {
      addNotification('Solo el creador puede eliminar esta transacción', 'error')
      return
    }
    
    const confirmed = await confirm({
      title: '¿Eliminar esta transacción?',
      message: ' ',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    })
    
    if (confirmed) {
      await firestoreService.deleteTransaction(transactionId)
      addNotification('Transacción eliminada correctamente', 'success', 2000)
    }
  } catch (error) {
    console.error('Error eliminando transacción:', error)
    addNotification('Error eliminando la transacción', 'error')
  }
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

const updateMasterPassword = async (newPassword) => {
  try {
    MASTER_PASSWORD.value = newPassword
    
    await firestoreService.updateSettings({
      masterPassword: newPassword
    })
    
    addNotification('Contraseña maestra actualizada', 'success')
  } catch (error) {
    console.error('Error actualizando contraseña maestra:', error)
    addNotification('Error actualizando la contraseña maestra', 'error')
  }
}

const handlePasswordChange = async (passwordData) => {
  try {
    if (currentUser.value.password !== passwordData.currentPassword) {
      addNotification('La contraseña actual es incorrecta', 'error')
      return
    }
    
    await firestoreService.updateUser(currentUser.value.id, {
      ...currentUser.value,
      password: passwordData.newPassword
    })
    
    currentUser.value.password = passwordData.newPassword
    addNotification('Contraseña actualizada correctamente', 'success')
  } catch (error) {
    console.error('Error actualizando contraseña:', error)
    addNotification('Error actualizando la contraseña', 'error')
  }
}

const handleUsernameChange = async (newUsername) => {
  try {
    // Actualizar usuario en Firestore
    await firestoreService.updateUser(currentUser.value.id, {
      ...currentUser.value,
      username: newUsername
    })
    
    currentUser.value.username = newUsername
    
    // Actualizar transacciones del usuario
    const userTransactions = transactions.value.filter(t => 
      t.userId === currentUser.value.id || t.user === currentUser.value.username
    )
    
    for (const transaction of userTransactions) {
      const updatedTransaction = { ...transaction, user: newUsername }
      await firestoreService.updateTransaction(transaction.id, updatedTransaction)
    }
    
    // Actualizar grupos donde sea miembro
    const userGroups = groups.value.filter(group => 
      group.members.some(m => m.id === currentUser.value.id)
    )
    
    for (const group of userGroups) {
      const updatedMembers = group.members.map(member => 
        member.id === currentUser.value.id 
          ? { ...member, username: newUsername }
          : member
      )
      
      await firestoreService.updateGroup(group.id, {
        ...group,
        members: updatedMembers
      })
    }
    
    addNotification('Nombre de usuario actualizado correctamente', 'success')
  } catch (error) {
    console.error('Error actualizando nombre de usuario:', error)
    addNotification('Error actualizando el nombre de usuario', 'error')
  }
}

const handleUserPasswordReset = async (userId) => {
  try {
    const userToReset = users.value.find(u => u.id === userId)
    if (!userToReset) {
      addNotification('Usuario no encontrado', 'error')
      return
    }
    
    const currentUserRole = currentUser.value.role
    const targetUserRole = userToReset.role
    
    let canReset = false
    
    if (currentUserRole === 'superadmin') {
      canReset = targetUserRole === 'admin' || targetUserRole === 'user'
    } else if (currentUserRole === 'admin') {
      canReset = targetUserRole === 'user'
    }
    
    if (!canReset) {
      addNotification('No tienes permisos para resetear la contraseña de este usuario', 'error')
      return
    }
    
    await firestoreService.updateUser(userId, {
      ...userToReset,
      password: '123'
    })
    
    addNotification(`Contraseña reseteada para ${userToReset.username}. Nueva contraseña: 123`, 'success')
  } catch (error) {
    console.error('Error reseteando contraseña:', error)
    addNotification('Error reseteando la contraseña', 'error')
  }
}

const handleDeleteUser = async (userId) => {
  try {
    const userToDelete = users.value.find(u => u.id === userId)
    if (!userToDelete) return
    
    if (userId === currentUser.value.id) {
      addNotification('No puedes eliminar tu propia cuenta', 'error')
      return
    }
    
    const currentUserRole = currentUser.value.role
    const targetUserRole = userToDelete.role
    
    let canDelete = false
    
    if (currentUserRole === 'superadmin') {
      canDelete = targetUserRole === 'admin' || targetUserRole === 'user'
    } else if (currentUserRole === 'admin') {
      canDelete = targetUserRole === 'user'
    }
    
    if (!canDelete) {
      addNotification('No tienes permisos para eliminar este usuario', 'error')
      return
    }
    
    // Eliminar usuario
    await firestoreService.deleteUser(userId)
    
    // Actualizar grupos removiendo al usuario
    const userGroups = groups.value.filter(group => 
      group.members.some(member => member.id === userId)
    )
    
    for (const group of userGroups) {
      const updatedMembers = group.members.filter(member => member.id !== userId)
      await firestoreService.updateGroup(group.id, {
        ...group,
        members: updatedMembers
      })
    }
    
    // Eliminar transacciones privadas del usuario
    const userPrivateTransactions = transactions.value.filter(t => 
      t.userId === userId && !t.groupId
    )
    
    for (const transaction of userPrivateTransactions) {
      await firestoreService.deleteTransaction(transaction.id)
    }
    
    addNotification(`Usuario ${userToDelete.username} eliminado correctamente`, 'success')
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    addNotification('Error eliminando el usuario', 'error')
  }
}

const closeModal = () => {
  showModal.value = false
  editing.value = false
  editingTransaction.value = null
}

// Métodos de grupos
// Función para verificar si un nombre de grupo ya existe (sin importar mayúsculas/minúsculas)
const isGroupNameTaken = (groupName) => {
  if (!groupName || typeof groupName !== 'string') {
    console.warn('⚠️ isGroupNameTaken: groupName inválido:', groupName)
    return false
  }
  
  console.log('🔍 Verificando nombre de grupo:', groupName)
  console.log('📋 Grupos existentes:', groups.value.map(g => ({ name: g?.name, type: typeof g?.name })))
  
  return groups.value.some(group => {
    // Validar que el grupo tenga un nombre válido
    if (!group || !group.name || typeof group.name !== 'string') {
      console.warn('⚠️ Grupo con nombre inválido encontrado:', group)
      return false
    }
    return group.name.toLowerCase().trim() === groupName.toLowerCase().trim()
  })
}

const handleCreateGroup = async (groupData) => {
  try {
    console.log('🏗️ Creando grupo:', groupData.name, 'por usuario:', currentUser.value?.email)
    // Verificar si el nombre ya existe
    if (isGroupNameTaken(groupData.name)) {
      addNotification('Ya existe un grupo con ese nombre. Elige un nombre diferente.', 'error')
      return
    }
    
    const newGroup = {
      id: Date.now(),
      name: groupData.name.trim(), // Limpiar espacios
      description: groupData.description || '',
      createdBy: currentUser.value.id,
      createdAt: new Date().toISOString(),
      inviteCode: generateInviteCode(),
      inviteCodeCreatedAt: new Date().toISOString(),
      inviteCodeUsedCount: 0,
      inviteCodeMaxUses: 5,
      inviteCodeExpiresIn: 3,
      members: [
        {
          id: currentUser.value.id,
          username: currentUser.value.username || currentUser.value.email?.split('@')[0],
          role: 'admin'
        }
      ]
    }
    
    await firestoreService.addGroup(newGroup)
    
    // Auto-seleccionar el grupo recién creado en todos los casos
    selectedGroup.value = newGroup
    console.log('✅ Grupo creado y auto-seleccionado:', newGroup.name)
    
    // Si estamos creando un grupo para compartir desde "Mis finanzas"
    if (pendingGroupForSharing.value) {
      showGroupManagementModal.value = false
      pendingGroupForSharing.value = false
      showModal.value = false
      
      handleGenerateInviteCode(newGroup.id, false)
      addNotification(`Grupo "${newGroup.name}" creado y seleccionado. Ahora puedes compartirlo.`, 'success', 6000)
      return
    }
    
    // Cerrar modales si están abiertos
    if (showGroupManagementModal.value && !showModal.value) {
      showGroupManagementModal.value = false
      showModal.value = false
    }
    
    addNotification(`Grupo "${newGroup.name}" creado y seleccionado correctamente`, 'success', 3000)
  } catch (error) {
    console.error('Error creando grupo:', error)
    addNotification('Error creando el grupo', 'error')
  }
}

// Función para generar un nombre único para grupos con conflicto de nombres
const generateUniqueGroupName = (originalName) => {
  // Si el usuario ya tiene un grupo con ese nombre, agregar # al inicio
  const userGroups = groups.value.filter(g => 
    g.members.some(m => m.id === currentUser.value.id)
  )
  
  const hasNameConflict = userGroups.some(g => 
    g.name.toLowerCase().trim() === originalName.toLowerCase().trim()
  )
  
  if (hasNameConflict) {
    return `#${originalName}`
  }
  
  return originalName
}

const handleJoinGroup = async (inviteCode) => {
  try {
    console.log('🔍 Intentando unirse al grupo con código:', inviteCode)
    console.log('👤 Usuario actual:', currentUser.value?.email, 'ID:', currentUser.value?.id)
    console.log('🔍 Grupos disponibles:', groups.value.length)
    console.log('📋 Códigos existentes:', groups.value.map(g => ({ name: g.name, code: g.inviteCode, id: g.id })))
    
    if (!currentUser.value?.id) {
      console.error('❌ Usuario actual no tiene ID válido')
      addNotification('Error: Usuario no válido', 'error')
      return
    }
    
    const group = groups.value.find(g => g.inviteCode === inviteCode)
    
    if (!group) {
      console.error('❌ Grupo no encontrado con código:', inviteCode)
      addNotification('Código de invitación inválido o expirado', 'error')
      return
    }
    
    console.log('👥 Grupo encontrado:', group.name, 'ID:', group.id)
    console.log('🧑‍🤝‍🧑 Miembros actuales:', group.members)
    console.log('📊 Datos del grupo completos:', {
      id: group.id,
      name: group.name,
      createdBy: group.createdBy,
      inviteCode: group.inviteCode,
      inviteCodeCreatedAt: group.inviteCodeCreatedAt,
      inviteCodeUsedCount: group.inviteCodeUsedCount,
      inviteCodeMaxUses: group.inviteCodeMaxUses,
      inviteCodeExpiresIn: group.inviteCodeExpiresIn,
      members: group.members
    })
    
    // Verificar si ya es miembro antes de hacer otras validaciones
    const isAlreadyMember = group.members.some(m => m.id === currentUser.value.id)
    if (isAlreadyMember) {
      console.log('⚠️ Usuario ya es miembro del grupo')
      addNotification('Ya eres miembro de este grupo', 'warning')
      return
    }
    
    if (group.inviteCodeCreatedAt) {
      const createdAt = new Date(group.inviteCodeCreatedAt)
      const now = new Date()
      const hoursDiff = (now - createdAt) / (1000 * 60 * 60)
      
      console.log('⏰ Verificando expiración:', hoursDiff, 'horas desde creación')
      
      if (hoursDiff > (group.inviteCodeExpiresIn || 3)) {
        console.error('❌ Código expirado por tiempo')
        addNotification('Este código ha caducado. Pide que te envíen un nuevo código de invitación.', 'error')
        return
      }
    }
    
    const usedCount = group.inviteCodeUsedCount || 0
    const maxUses = group.inviteCodeMaxUses || 5
    console.log('📊 Usos:', usedCount, 'de', maxUses)
    
    if (usedCount >= maxUses) {
      console.error('❌ Código expirado por límite de usos')
      addNotification('Este código ya fue usado el máximo de veces. Pide que te envíen un nuevo código de invitación.', 'error')
      return
    }
    
    // Verificar si el usuario ya tiene un grupo con el mismo nombre
    const originalGroupName = group.name
    const displayName = generateUniqueGroupName(originalGroupName)
    
    // Asegurar que el ID del usuario sea un número entero
    const userId = typeof currentUser.value.id === 'string' ? 
      parseInt(currentUser.value.id) : currentUser.value.id
    
    const newMember = {
      id: userId,
      username: currentUser.value.username || currentUser.value.email?.split('@')[0],
      role: 'member'
    }
    
    // Solo agregar displayName si es diferente del original
    if (displayName !== originalGroupName) {
      newMember.displayName = displayName
    }
    
    console.log('➕ Agregando nuevo miembro:', newMember)
    console.log('🔢 ID del usuario:', userId, 'Tipo:', typeof userId)
    console.log('👤 Usuario actual completo:', {
      id: currentUser.value.id,
      email: currentUser.value.email,
      username: currentUser.value.username
    })
    
    // Construir el grupo actualizado de forma segura
    const safeMember = {
      id: userId,
      username: currentUser.value.username || currentUser.value.email?.split('@')[0],
      role: 'member'
    }
    
    // Solo agregar displayName si existe y no es undefined
    if (displayName !== originalGroupName && displayName) {
      safeMember.displayName = displayName
    }
    
    // Limpiar miembros existentes para asegurar que no tengan campos undefined
    const cleanExistingMembers = group.members.map(member => {
      const cleanMember = {
        id: member.id,
        username: member.username,
        role: member.role
      }
      
      // Solo agregar displayName si existe y no es undefined
      if (member.displayName && member.displayName !== undefined) {
        cleanMember.displayName = member.displayName
      }
      
      return cleanMember
    })
    
    const updatedGroup = {
      id: group.id,
      name: group.name,
      description: group.description || '',
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      members: [...cleanExistingMembers, safeMember],
      inviteCodeUsedCount: usedCount + 1
    }
    
    // Solo agregar campos de invitación si existen y no son undefined
    if (group.inviteCode) {
      updatedGroup.inviteCode = group.inviteCode
    }
    if (group.inviteCodeCreatedAt) {
      updatedGroup.inviteCodeCreatedAt = group.inviteCodeCreatedAt
    }
    if (group.inviteCodeMaxUses !== undefined) {
      updatedGroup.inviteCodeMaxUses = group.inviteCodeMaxUses
    }
    if (group.inviteCodeExpiresIn !== undefined) {
      updatedGroup.inviteCodeExpiresIn = group.inviteCodeExpiresIn
    }
    
    // Función más robusta para detectar y limpiar campos undefined
    const findUndefinedFields = (obj, path = '') => {
      const undefinedFields = []
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key
        
        if (value === undefined) {
          undefinedFields.push(currentPath)
        } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          undefinedFields.push(...findUndefinedFields(value, currentPath))
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item === undefined) {
              undefinedFields.push(`${currentPath}[${index}]`)
            } else if (item !== null && typeof item === 'object') {
              undefinedFields.push(...findUndefinedFields(item, `${currentPath}[${index}]`))
            }
          })
        }
      }
      
      return undefinedFields
    }
    
    // Detectar campos undefined antes de limpiar
    const undefinedFields = findUndefinedFields(updatedGroup)
    if (undefinedFields.length > 0) {
      console.warn('⚠️ Campos undefined detectados:', undefinedFields)
    }
    
    // Limpiar campos undefined de forma recursiva
    const deepClean = (obj) => {
      if (obj === null || obj === undefined) return null
      
      if (Array.isArray(obj)) {
        return obj.map(item => deepClean(item)).filter(item => item !== null && item !== undefined)
      }
      
      if (typeof obj === 'object') {
        const cleaned = {}
        for (const [key, value] of Object.entries(obj)) {
          const cleanedValue = deepClean(value)
          if (cleanedValue !== undefined && cleanedValue !== null) {
            cleaned[key] = cleanedValue
          }
        }
        return cleaned
      }
      
      return obj
    }
    
    const cleanedGroup = deepClean(updatedGroup)
    
    console.log('💾 Actualizando grupo en Firestore...')
    console.log('🧹 Grupo limpio:', cleanedGroup)
    console.log('🔍 Verificando estructura del grupo antes de actualizar:', {
      hasId: !!group.id,
      idType: typeof group.id,
      groupId: group.id,
      membersCount: cleanedGroup.members?.length,
      firstMember: cleanedGroup.members?.[0],
      lastMember: cleanedGroup.members?.[cleanedGroup.members.length - 1]
    })
    
    // Validación final antes de enviar a Firestore
    const hasUndefined = JSON.stringify(cleanedGroup).includes('undefined')
    if (hasUndefined) {
      console.error('🚨 DETECTADO UNDEFINED EN DATOS FINALES')
      console.error('📋 Datos con undefined:', JSON.stringify(cleanedGroup, null, 2))
      throw new Error('Datos contienen campos undefined')
    }
    
    try {
      await firestoreService.updateGroup(group.id, cleanedGroup)
    } catch (firestoreError) {
      console.error('❌ Error específico de Firestore:', firestoreError)
      console.error('📋 Estructura que causó el error:', JSON.stringify(cleanedGroup, null, 2))
      throw firestoreError
    }
    console.log('✅ Grupo actualizado exitosamente')
    
    const usesLeft = maxUses - updatedGroup.inviteCodeUsedCount
    
    const joinMessage = displayName !== originalGroupName 
      ? `¡Te has unido al grupo "${displayName}" (nombre original: "${originalGroupName}")!`
      : `¡Te has unido al grupo "${group.name}"!`
    
    if (usesLeft > 0) {
      addNotification(`${joinMessage} Quedan ${usesLeft} usos del código.`, 'success')
    } else {
      addNotification(`${joinMessage} Este código ya no puede usarse más.`, 'success')
    }
    
    // Seleccionar automáticamente el grupo al que se acaba de unir
    console.log('🎯 Seleccionando grupo recién unido:', group.name)
    selectedGroup.value = group
  } catch (error) {
    console.error('❌ Error completo uniéndose al grupo:', error)
    console.error('Stack trace:', error.stack)
    addNotification(`Error uniéndose al grupo: ${error.message || 'Error desconocido'}`, 'error')
  }
}

const handleRemoveMember = async ({ groupId, memberId }) => {
  try {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    
    const updatedMembers = group.members.filter(m => m.id !== memberId)
    
    await firestoreService.updateGroup(groupId, {
      ...group,
      members: updatedMembers
    })
  } catch (error) {
    console.error('Error removiendo miembro:', error)
    addNotification('Error removiendo el miembro del grupo', 'error')
  }
}

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

// Función para crear grupo por defecto "Mis finanzas" para nuevos usuarios
const createDefaultGroup = async (user) => {
  try {
    console.log('🏗️ Verificando grupo por defecto para usuario:', user.email)
    console.log('📊 Grupos actualmente cargados:', groups.value.length)
    
    // Verificar si el usuario ya tiene un grupo "Mis finanzas"
    const existingGroup = groups.value.find(g => 
      g.createdBy === user.id && g.name === 'Mis finanzas'
    )
    
    if (existingGroup) {
      console.log('✅ Grupo "Mis finanzas" ya existe para este usuario')
      return existingGroup
    }
    
    // Si no hay grupos cargados aún, esperar un poco y verificar de nuevo
    if (groups.value.length === 0) {
      console.log('⏳ No hay grupos cargados aún, esperando...')
      // Esperar 2 segundos para que se carguen los datos de Firestore
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Verificar de nuevo después de esperar
      const existingGroupAfterWait = groups.value.find(g => 
        g.createdBy === user.id && g.name === 'Mis finanzas'
      )
      
      if (existingGroupAfterWait) {
        console.log('✅ Grupo "Mis finanzas" encontrado después de esperar')
        return existingGroupAfterWait
      }
    }
    
    console.log('🆕 Creando nuevo grupo "Mis finanzas" para usuario nuevo')
    
    const defaultGroup = {
      id: Date.now() + Math.random(),
      name: 'Mis finanzas',
      description: 'Grupo personal para gestionar mis finanzas',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      inviteCode: null,
      members: [
        {
          id: user.id,
          username: user.username || user.email?.split('@')[0],
          role: 'admin'
        }
      ]
    }
    
    await firestoreService.addGroup(defaultGroup)
    
    return defaultGroup
  } catch (error) {
    console.error('Error creando grupo por defecto:', error)
    return null
  }
}

const handleGenerateInviteCode = async (groupId, showNotification = true) => {
  try {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    
    // No generar códigos automáticamente para "Mis finanzas"
    if (group.name === 'Mis finanzas') {
      console.log('⚠️ No se genera código automático para "Mis finanzas"')
      if (showNotification) {
        addNotification('Los códigos de invitación para "Mis finanzas" deben generarse manualmente', 'info')
      }
      return
    }
    
    const updatedGroup = {
      ...group,
      inviteCode: generateInviteCode(),
      inviteCodeCreatedAt: new Date().toISOString(),
      inviteCodeUsedCount: 0,
      inviteCodeMaxUses: 5,
      inviteCodeExpiresIn: 3
    }
    
    await firestoreService.updateGroup(groupId, updatedGroup)
    
    if (showNotification) {
      addNotification('Nuevo código generado', 'success', 5000)
    }
  } catch (error) {
    console.error('Error generando código de invitación:', error)
    addNotification('Error generando el código de invitación', 'error')
  }
}

const handleGenerateNewCode = async (groupId) => {
  try {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    
    // No generar códigos automáticamente para "Mis finanzas"
    if (group.name === 'Mis finanzas') {
      console.log('⚠️ No se genera código automático para "Mis finanzas"')
      addNotification('Los códigos de invitación para "Mis finanzas" deben generarse manualmente', 'info')
      return
    }
    
    const updatedGroup = {
      ...group,
      inviteCode: generateInviteCode(),
      inviteCodeCreatedAt: new Date().toISOString(),
      inviteCodeUsedCount: 0,
      inviteCodeMaxUses: 5,
      inviteCodeExpiresIn: 3
    }
    
    await firestoreService.updateGroup(groupId, updatedGroup)
  } catch (error) {
    console.error('Error generando nuevo código:', error)
    addNotification('Error generando el código de invitación', 'error')
  }
}

const handleLeaveGroup = async (groupId) => {
  try {
    const group = groups.value.find(g => g.id === groupId)
    if (!group || !currentUser.value) return
    
    const updatedMembers = group.members.filter(member => member.id !== currentUser.value.id)
    
    await firestoreService.updateGroup(groupId, {
      ...group,
      members: updatedMembers
    })
    
    if (selectedGroup.value && selectedGroup.value.id === groupId) {
      selectedGroup.value = null
    }
    
    addNotification(`Has salido del grupo "${group.name}"`, 'success')
  } catch (error) {
    console.error('Error saliendo del grupo:', error)
    addNotification('Error saliendo del grupo', 'error')
  }
}

const handleDeleteGroup = async (groupId) => {
  try {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) {
      addNotification('Grupo no encontrado', 'error')
      return
    }
    
    // Proteger el grupo "Mis finanzas" - no se puede eliminar
    if (group.name === 'Mis finanzas' || 
        group.description?.includes('Grupo personal') ||
        (group.inviteCode === null && group.name.toLowerCase().includes('finanzas'))) {
      addNotification('No se puede eliminar el grupo "Mis finanzas". Es tu grupo personal.', 'error')
      return
    }
    
    const currentUserRole = currentUser.value.role
    let canDelete = false
    
    if (currentUserRole === 'superadmin') {
      canDelete = true
    } else if (currentUserRole === 'admin') {
      const groupCreator = users.value.find(u => u.id === group.createdBy)
      canDelete = groupCreator && groupCreator.role === 'user'
    } else if (currentUserRole === 'user') {
      canDelete = group.createdBy === currentUser.value.id
    }
    
    if (!canDelete) {
      addNotification('No tienes permisos para eliminar este grupo', 'error')
      return
    }
    
    // Eliminar grupo
    await firestoreService.deleteGroup(groupId)
    
    // Eliminar transacciones del grupo
    const groupTransactions = transactions.value.filter(t => t.groupId === groupId)
    for (const transaction of groupTransactions) {
      await firestoreService.deleteTransaction(transaction.id)
    }
    
    if (selectedGroup.value && selectedGroup.value.id === groupId) {
      selectedGroup.value = null
    }
    
    addNotification(`Grupo "${group?.name || 'Grupo'}" eliminado correctamente`, 'success')
  } catch (error) {
    console.error('Error eliminando grupo:', error)
    addNotification('Error eliminando el grupo', 'error')
  }
}

const handleHideGroup = async (groupId) => {
  try {
    const group = groups.value.find(g => g.id === groupId)
    if (!group || !currentUser.value) return
    
    const hiddenFor = group.hiddenFor || []
    
    if (!hiddenFor.includes(currentUser.value.id)) {
      const updatedGroup = {
        ...group,
        hiddenFor: [...hiddenFor, currentUser.value.id]
      }
      
      await firestoreService.updateGroup(groupId, updatedGroup)
    }
    
    if (selectedGroup.value && selectedGroup.value.id === groupId) {
      selectedGroup.value = null
    }
    
    addNotification(`Grupo "${group.name}" ocultado correctamente`, 'success')
  } catch (error) {
    console.error('Error ocultando grupo:', error)
    addNotification('Error ocultando el grupo', 'error')
  }
}

const handleUnhideGroup = async (groupId) => {
  try {
    const group = groups.value.find(g => g.id === groupId)
    if (!group || !currentUser.value) return
    
    if (group.hiddenFor) {
      const updatedGroup = {
        ...group,
        hiddenFor: group.hiddenFor.filter(userId => userId !== currentUser.value.id)
      }
      
      await firestoreService.updateGroup(groupId, updatedGroup)
    }
    
    addNotification(`Grupo "${group.name}" ahora es visible`, 'success')
  } catch (error) {
    console.error('Error mostrando grupo:', error)
    addNotification('Error mostrando el grupo', 'error')
  }
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

// PWA Install Handlers
const pwaInstallRef = ref(null)

const handlePWAInstallSuccess = (event) => {
  console.log('PWA Install Success:', event.detail.message)
  addNotification('¡Aplicación instalada exitosamente!', 'success', 5000)
}

const handlePWAInstallFail = (event) => {
  console.log('PWA Install Failed:', event.detail.message)
  addNotification('Error durante la instalación', 'error')
}

const handlePWAUserChoice = (event) => {
  console.log('PWA User Choice:', event.detail.message)
  if (event.detail.message === 'dismissed') {
    addNotification('Instalación cancelada. Puedes instalar más tarde desde el menú del navegador.', 'info', 5000)
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

.header-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.app-icon {
  width: 45px;
  height: 45px;
  color: var(--text-primary);
  background: transparent;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-xs);
  border: 1px solid var(--border-primary);
}

.header h1 {
  color: var(--text-primary);
  font-size: 26px;
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

/* Ocultar botón flotante en desktop por defecto */
.btn-profile-mobile {
  display: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: var(--spacing-lg);
    gap: var(--spacing-md);
    align-items: stretch;
    position: relative;
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
  .actions > *:nth-child(3) { grid-column: 1; grid-row: 2; }
  .actions > *:nth-child(4) { grid-column: 2; grid-row: 2; }
  .actions > button:nth-child(5) { 
    display: none; /* Ocultar el botón perfil del grid en móvil */
  }

  .header-title {
    margin-bottom: 13px;
    margin-top: -10px;
  }
  
  .app-icon {
    width: 32px;
    height: 32px;
  }
  /* Botón perfil flotante visible en móvil */
  .btn-profile-mobile {
    display: flex !important;
    position: absolute;
    top: 0px;
    right: 16px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    color: var(--text-secondary);
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    transition: var(--transition-base);
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .btn-profile-mobile:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
    color: var(--text-primary);
    transform: scale(1.05);
  }
  
  .btn-profile-mobile svg {
    width: 20px !important;
    height: 20px !important;
  }
  
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
  
  /* Perfil de usuario fuera del grid */
  .actions > button:nth-child(5) { /* Botón Perfil */
    display: none; /* Ocultar en grid móvil */
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