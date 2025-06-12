import { loadAppData, saveAppData } from './firestore.js'

class ApiService {
  constructor() {
    this.isOnline = true
    this.errorMessage = ''
  }

  // Simular el comportamiento del API anterior pero usando Firestore
  async getAllData() {
    try {
      this.isOnline = true
      this.errorMessage = ''
      return await loadAppData()
    } catch (error) {
      this.isOnline = false
      this.errorMessage = 'Error al cargar datos de Firestore'
      console.error('Error en getAllData:', error)
      throw error
    }
  }

  async saveAllData(data) {
    try {
      this.isOnline = true
      this.errorMessage = ''
      await saveAppData(data)
      return { success: true }
    } catch (error) {
      this.isOnline = false
      this.errorMessage = 'Error al guardar datos en Firestore'
      console.error('Error en saveAllData:', error)
      throw error
    }
  }

  // Métodos legacy para compatibilidad (ya no se usan pero mantenemos por si acaso)
  async getTransactions() {
    const data = await this.getAllData()
    return data.transactions || []
  }

  async addTransaction(transaction) {
    const data = await this.getAllData()
    data.transactions = data.transactions || []
    data.transactions.push({
      ...transaction,
      id: Date.now(),
      createdAt: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    })
    await this.saveAllData(data)
    return { success: true }
  }

  async updateTransaction(id, transaction) {
    const data = await this.getAllData()
    const index = data.transactions.findIndex(t => t.id === id)
    if (index !== -1) {
      data.transactions[index] = { ...transaction, id }
      await this.saveAllData(data)
    }
    return { success: true }
  }

  async deleteTransaction(id) {
    const data = await this.getAllData()
    data.transactions = data.transactions.filter(t => t.id !== id)
    await this.saveAllData(data)
    return { success: true }
  }

  async getUsers() {
    const data = await this.getAllData()
    return data.users || []
  }

  async addUser(user) {
    const data = await this.getAllData()
    data.users = data.users || []
    data.users.push({
      ...user,
      id: Date.now()
    })
    await this.saveAllData(data)
    return { success: true }
  }

  async getSettings() {
    const data = await this.getAllData()
    return data.settings || {}
  }

  async updateSettings(settings) {
    const data = await this.getAllData()
    data.settings = { ...data.settings, ...settings }
    await this.saveAllData(data)
    return { success: true }
  }

  // Health check simulado
  async healthCheck() {
    try {
      await this.getAllData()
      return { status: 'ok', service: 'firestore' }
    } catch (error) {
      return { status: 'error', service: 'firestore', error: error.message }
    }
  }

  // Método para migrar datos del servidor local
  async migrateFromServer() {
    try {
      console.log('🔄 Intentando migrar datos del servidor local...')
      const response = await fetch('http://localhost:3001/api/data')
      if (response.ok) {
        const localData = await response.json()
        console.log('📦 Datos del servidor local obtenidos:', Object.keys(localData))
        await saveAppData(localData)
        console.log('✅ Migración completada desde servidor local')
        return localData
      }
    } catch (error) {
      console.log('⚠️ No se pudo conectar al servidor local (normal en producción)')
    }
    
    // Si no hay servidor local, usar datos por defecto
    return await this.getAllData()
  }
}

export default new ApiService()