const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Métodos para datos completos
  async getAllData() {
    return this.request('/data');
  }

  async saveAllData(data) {
    return this.request('/data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Métodos para transacciones
  async getTransactions() {
    return this.request('/transactions');
  }

  async addTransaction(transaction) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id, transaction) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para usuarios
  async getUsers() {
    return this.request('/users');
  }

  async addUser(user) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  // Métodos para configuraciones
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings) {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();