import { db } from '@/firebase.js'
import { doc, setDoc, getDoc } from 'firebase/firestore'

// Documento principal que contendrá todos los datos de la app
const APP_DATA_DOC = 'data'
const COLLECTION = 'app'

/**
 * Cargar todos los datos de la aplicación desde Firestore
 */
export const loadAppData = async () => {
  try {
    console.log('🔄 Cargando datos desde Firestore...')
    const docRef = doc(db, COLLECTION, APP_DATA_DOC)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      console.log('✅ Datos cargados desde Firestore:', Object.keys(data))
      return data
    } else {
      console.log('📝 No hay datos en Firestore, inicializando...')
      // Estructura inicial por defecto
      const getCurrentMonth = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        return `${year}-${month}`
      }
      
      const initialData = {
        users: [],
        transactions: [],
        groups: [],
        settings: {
          masterPassword: 'admin123',
          selectedMonth: getCurrentMonth(),
          selectedGroup: null
        },
        lastUpdated: new Date().toISOString()
      }
      
      await saveAppData(initialData)
      return initialData
    }
  } catch (error) {
    console.error('❌ Error cargando datos de Firestore:', error)
    throw error
  }
}

/**
 * Guardar todos los datos de la aplicación en Firestore
 */
export const saveAppData = async (data) => {
  try {
    console.log('💾 Guardando datos en Firestore...')
    const docRef = doc(db, COLLECTION, APP_DATA_DOC)
    
    // Filtrar campos undefined/null antes de guardar
    const getCurrentMonth = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      return `${year}-${month}`
    }
    
    const cleanData = {
      users: data.users || [],
      transactions: data.transactions || [],
      groups: data.groups || [],
      settings: {
        masterPassword: data.settings?.masterPassword || 'admin123',
        selectedMonth: data.settings?.selectedMonth || getCurrentMonth(),
        selectedGroup: data.settings?.selectedGroup || null
      },
      lastUpdated: new Date().toISOString()
    }
    
    // Remover campos undefined recursivamente
    const sanitizedData = JSON.parse(JSON.stringify(cleanData))
    
    await setDoc(docRef, sanitizedData)
    console.log('✅ Datos guardados en Firestore')
    return true
  } catch (error) {
    console.error('❌ Error guardando datos en Firestore:', error)
    throw error
  }
}

// Función de tiempo real removida temporalmente para debug

/**
 * Migrar datos existentes del servidor local a Firestore
 */
export const migrateFromLocalData = async (localData) => {
  try {
    console.log('🚀 Migrando datos locales a Firestore...')
    await saveAppData(localData)
    console.log('✅ Migración completada')
    return true
  } catch (error) {
    console.error('❌ Error en migración:', error)
    throw error
  }
}