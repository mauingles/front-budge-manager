import { db } from '@/firebase.js'
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  writeBatch,
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore'

// Colecciones de Firestore
const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions', 
  GROUPS: 'groups',
  SETTINGS: 'settings'
}

// Estado para manejar listeners activos
const activeListeners = new Map()

// Estado para controlar la conexión
let isOffline = false

/**
 * Utilidades para manejar fechas
 */
const getCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Migrar datos existentes del servidor local a Firestore
 */
export const migrateFromLocalData = async (localData) => {
  try {
    console.log('🚀 Iniciando migración a Firestore...')
    const batch = writeBatch(db)
    
    // Migrar usuarios
    if (localData.users && localData.users.length > 0) {
      console.log('👥 Migrando usuarios...')
      for (const user of localData.users) {
        const userRef = doc(db, COLLECTIONS.USERS, user.id.toString())
        batch.set(userRef, {
          ...user,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    }
    
    // Migrar transacciones
    if (localData.transactions && localData.transactions.length > 0) {
      console.log('💰 Migrando transacciones...')
      for (const transaction of localData.transactions) {
        const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transaction.id.toString())
        batch.set(transactionRef, {
          ...transaction,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    }
    
    // Migrar grupos
    if (localData.groups && localData.groups.length > 0) {
      console.log('👥 Migrando grupos...')
      for (const group of localData.groups) {
        const groupRef = doc(db, COLLECTIONS.GROUPS, group.id.toString())
        batch.set(groupRef, {
          ...group,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    }
    
    // Migrar configuraciones
    if (localData.settings) {
      console.log('⚙️ Migrando configuraciones...')
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'global')
      batch.set(settingsRef, {
        ...localData.settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
    
    await batch.commit()
    console.log('✅ Migración completada exitosamente')
    return true
  } catch (error) {
    console.error('❌ Error en migración:', error)
    throw error
  }
}

/**
 * USUARIOS - Operaciones CRUD y tiempo real
 */
export const listenToUsers = (callback) => {
  console.log('👂 Configurando listener para usuarios...')
  const usersRef = collection(db, COLLECTIONS.USERS)
  
  const unsubscribe = onSnapshot(usersRef, (snapshot) => {
    const users = []
    snapshot.forEach((doc) => {
      const userData = doc.data()
      users.push({ 
        ...userData,
        id: parseInt(doc.id) || doc.id // Asegurar que el ID sea número para compatibilidad
      })
    })
    console.log('👥 Usuarios actualizados en tiempo real:', users.length)
    console.log('📧 Emails de usuarios:', users.map(u => u.email))
    callback(users)
  }, (error) => {
    console.error('❌ Error en listener de usuarios:', error)
    callback([])
  })
  
  activeListeners.set('users', unsubscribe)
  return unsubscribe
}

export const addUser = async (userData) => {
  try {
    console.log('👤 Agregando usuario:', userData.email)
    const userRef = doc(db, COLLECTIONS.USERS, userData.id.toString())
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('✅ Usuario agregado exitosamente')
    return userData
  } catch (error) {
    console.error('❌ Error agregando usuario:', error)
    throw error
  }
}

export const updateUser = async (userId, userData) => {
  try {
    console.log('🔄 Actualizando usuario:', userId)
    const userRef = doc(db, COLLECTIONS.USERS, userId.toString())
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    })
    console.log('✅ Usuario actualizado exitosamente')
    return userData
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error)
    throw error
  }
}

export const deleteUser = async (userId) => {
  try {
    console.log('🗑️ Eliminando usuario:', userId)
    const userRef = doc(db, COLLECTIONS.USERS, userId.toString())
    await deleteDoc(userRef)
    console.log('✅ Usuario eliminado exitosamente')
    return true
  } catch (error) {
    console.error('❌ Error eliminando usuario:', error)
    throw error
  }
}

/**
 * TRANSACCIONES - Operaciones CRUD y tiempo real
 */
export const listenToTransactions = (callback) => {
  console.log('👂 Configurando listener para transacciones...')
  const transactionsRef = collection(db, COLLECTIONS.TRANSACTIONS)
  
  const unsubscribe = onSnapshot(transactionsRef, (snapshot) => {
    const transactions = []
    snapshot.forEach((doc) => {
      const transactionData = doc.data()
      transactions.push({ 
        ...transactionData,
        id: parseInt(doc.id) || doc.id,
        userId: parseInt(transactionData.userId) || transactionData.userId,
        groupId: transactionData.groupId ? (parseInt(transactionData.groupId) || transactionData.groupId) : null
      })
    })
    console.log('💰 Transacciones actualizadas en tiempo real:', transactions.length)
    callback(transactions)
  }, (error) => {
    console.error('❌ Error en listener de transacciones:', error)
    callback([])
  })
  
  activeListeners.set('transactions', unsubscribe)
  return unsubscribe
}

export const addTransaction = async (transactionData) => {
  try {
    console.log('💰 Agregando transacción:', transactionData.type, transactionData.amount)
    const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionData.id.toString())
    await setDoc(transactionRef, {
      ...transactionData,
      // Solo añadir serverTimestamp si no existe createdAt, para no sobrescribir el formato de fecha de la app
      ...(transactionData.createdAt ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp()
    })
    console.log('✅ Transacción agregada exitosamente')
    return transactionData
  } catch (error) {
    console.error('❌ Error agregando transacción:', error)
    throw error
  }
}

export const updateTransaction = async (transactionId, transactionData) => {
  try {
    console.log('🔄 Actualizando transacción:', transactionId)
    const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId.toString())
    await updateDoc(transactionRef, {
      ...transactionData,
      updatedAt: serverTimestamp()
    })
    console.log('✅ Transacción actualizada exitosamente')
    return transactionData
  } catch (error) {
    console.error('❌ Error actualizando transacción:', error)
    throw error
  }
}

export const deleteTransaction = async (transactionId) => {
  try {
    console.log('🗑️ Eliminando transacción:', transactionId)
    const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId.toString())
    await deleteDoc(transactionRef)
    console.log('✅ Transacción eliminada exitosamente')
    return true
  } catch (error) {
    console.error('❌ Error eliminando transacción:', error)
    throw error
  }
}

/**
 * GRUPOS - Operaciones CRUD y tiempo real
 */
export const listenToGroups = (callback) => {
  console.log('👂 Configurando listener para grupos...')
  const groupsRef = collection(db, COLLECTIONS.GROUPS)
  
  const unsubscribe = onSnapshot(groupsRef, (snapshot) => {
    const groups = []
    snapshot.forEach((doc) => {
      const groupData = doc.data()
      groups.push({ 
        ...groupData,
        id: parseInt(doc.id) || doc.id,
        createdBy: parseInt(groupData.createdBy) || groupData.createdBy,
        members: groupData.members?.map(member => ({
          ...member,
          id: parseInt(member.id) || member.id
        })) || []
      })
    })
    console.log('👥 Grupos actualizados en tiempo real:', groups.length)
    console.log('🏢 Grupos disponibles:', groups.map(g => ({ name: g.name, createdBy: g.createdBy, memberCount: g.members.length })))
    callback(groups)
  }, (error) => {
    console.error('❌ Error en listener de grupos:', error)
    callback([])
  })
  
  activeListeners.set('groups', unsubscribe)
  return unsubscribe
}

export const addGroup = async (groupData) => {
  try {
    console.log('👥 Agregando grupo:', groupData.name)
    console.log('🔍 Datos del grupo a guardar:', {
      name: groupData.name,
      createdBy: groupData.createdBy,
      members: groupData.members
    })
    const groupRef = doc(db, COLLECTIONS.GROUPS, groupData.id.toString())
    await setDoc(groupRef, {
      ...groupData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('✅ Grupo agregado exitosamente')
    return groupData
  } catch (error) {
    console.error('❌ Error agregando grupo:', error)
    throw error
  }
}

export const updateGroup = async (groupId, groupData) => {
  try {
    console.log('🔄 Actualizando grupo:', groupId)
    
    // Limpiar campos undefined de forma recursiva y más agresiva
    const cleanData = (obj) => {
      if (obj === null || obj === undefined) {
        return null
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => cleanData(item)).filter(item => item !== null && item !== undefined)
      }
      
      if (typeof obj === 'object') {
        const cleaned = {}
        for (const [key, value] of Object.entries(obj)) {
          const cleanedValue = cleanData(value)
          if (cleanedValue !== undefined && cleanedValue !== null) {
            cleaned[key] = cleanedValue
          }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : null
      }
      
      return obj
    }
    
    const cleanedData = cleanData(groupData)
    console.log('🧼 Datos originales:', JSON.stringify(groupData, null, 2))
    console.log('🧹 Datos limpiados:', JSON.stringify(cleanedData, null, 2))
    
    if (!cleanedData || Object.keys(cleanedData).length === 0) {
      console.error('❌ Datos limpiados están vacíos')
      throw new Error('No hay datos válidos para actualizar')
    }
    
    const groupRef = doc(db, COLLECTIONS.GROUPS, groupId.toString())
    await updateDoc(groupRef, {
      ...cleanedData,
      updatedAt: serverTimestamp()
    })
    console.log('✅ Grupo actualizado exitosamente')
    return groupData
  } catch (error) {
    console.error('❌ Error actualizando grupo:', error)
    throw error
  }
}

export const deleteGroup = async (groupId) => {
  try {
    console.log('🗑️ Eliminando grupo:', groupId)
    const groupRef = doc(db, COLLECTIONS.GROUPS, groupId.toString())
    await deleteDoc(groupRef)
    console.log('✅ Grupo eliminado exitosamente')
    return true
  } catch (error) {
    console.error('❌ Error eliminando grupo:', error)
    throw error
  }
}

/**
 * CONFIGURACIONES - Operaciones CRUD y tiempo real
 */
export const listenToSettings = (callback) => {
  console.log('👂 Configurando listener para configuraciones...')
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'global')
  
  const unsubscribe = onSnapshot(settingsRef, (doc) => {
    if (doc.exists()) {
      const settings = doc.data()
      console.log('⚙️ Configuraciones actualizadas en tiempo real')
      callback(settings)
    } else {
      // Configuraciones por defecto
      const defaultSettings = {
        masterPassword: 'admin123',
        selectedMonth: getCurrentMonth(),
        selectedGroup: null
      }
      console.log('⚙️ Usando configuraciones por defecto')
      callback(defaultSettings)
    }
  }, (error) => {
    console.error('❌ Error en listener de configuraciones:', error)
    callback({
      masterPassword: 'admin123',
      selectedMonth: getCurrentMonth(),
      selectedGroup: null
    })
  })
  
  activeListeners.set('settings', unsubscribe)
  return unsubscribe
}

export const updateSettings = async (settingsData) => {
  try {
    console.log('⚙️ Actualizando configuraciones')
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'global')
    await setDoc(settingsRef, {
      ...settingsData,
      updatedAt: serverTimestamp()
    }, { merge: true })
    console.log('✅ Configuraciones actualizadas exitosamente')
    return settingsData
  } catch (error) {
    console.error('❌ Error actualizando configuraciones:', error)
    throw error
  }
}

/**
 * ADMINISTRACIÓN DE LISTENERS
 */
export const unsubscribeAll = () => {
  console.log('🔌 Desconectando todos los listeners...')
  activeListeners.forEach((unsubscribe, key) => {
    unsubscribe()
    console.log(`✅ Listener ${key} desconectado`)
  })
  activeListeners.clear()
}

export const unsubscribeListener = (listenerKey) => {
  const unsubscribe = activeListeners.get(listenerKey)
  if (unsubscribe) {
    unsubscribe()
    activeListeners.delete(listenerKey)
    console.log(`✅ Listener ${listenerKey} desconectado`)
  }
}

/**
 * CONEXIÓN Y OFFLINE
 */
export const goOffline = async () => {
  try {
    await disableNetwork(db)
    isOffline = true
    console.log('📴 Firestore desconectado')
  } catch (error) {
    console.error('❌ Error al desconectar Firestore:', error)
  }
}

export const goOnline = async () => {
  try {
    await enableNetwork(db)
    isOffline = false
    console.log('🌐 Firestore conectado')
  } catch (error) {
    console.error('❌ Error al conectar Firestore:', error)
  }
}

export const getConnectionStatus = () => {
  return !isOffline
}

/**
 * FUNCIONES LEGACY PARA COMPATIBILIDAD
 */
export const loadAppData = async () => {
  console.warn('⚠️ loadAppData está obsoleto. Use los listeners específicos.')
  return {
    users: [],
    transactions: [],
    groups: [],
    settings: {
      masterPassword: 'admin123',
      selectedMonth: getCurrentMonth(),
      selectedGroup: null
    }
  }
}

export const saveAppData = async (data) => {
  console.warn('⚠️ saveAppData está obsoleto. Use las funciones específicas de cada colección.')
  return true
}