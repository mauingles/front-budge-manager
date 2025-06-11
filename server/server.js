const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Estructura de datos por defecto
const defaultData = {
  users: [
    {
      id: 0,
      username: 'superadmin',
      password: 'super123',
      role: 'superadmin'
    }
  ],
  transactions: [
  ],
  settings: {
    masterPassword: 'admin123',
    selectedMonth: '2024-12'
  },
  currentUser: null
};

// Función para leer datos
async function readData() {
  try {
    if (await fs.pathExists(DATA_FILE)) {
      return await fs.readJson(DATA_FILE);
    } else {
      await fs.writeJson(DATA_FILE, defaultData, { spaces: 2 });
      return defaultData;
    }
  } catch (error) {
    console.error('Error reading data:', error);
    return defaultData;
  }
}

// Función para escribir datos
async function writeData(data) {
  try {
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

// Routes

// GET - Obtener todos los datos
app.get('/api/data', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// POST - Actualizar datos completos
app.post('/api/data', async (req, res) => {
  try {
    const success = await writeData(req.body);
    if (success) {
      res.json({ message: 'Data saved successfully' });
    } else {
      res.status(500).json({ error: 'Error saving data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error saving data' });
  }
});

// GET - Obtener solo transacciones
app.get('/api/transactions', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.transactions || []);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

// POST - Agregar nueva transacción
app.post('/api/transactions', async (req, res) => {
  try {
    const data = await readData();
    const newTransaction = {
      ...req.body,
      id: Date.now()
    };
    data.transactions.push(newTransaction);
    
    const success = await writeData(data);
    if (success) {
      res.json(newTransaction);
    } else {
      res.status(500).json({ error: 'Error saving transaction' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error adding transaction' });
  }
});

// PUT - Actualizar transacción
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const data = await readData();
    const transactionId = parseInt(req.params.id);
    const index = data.transactions.findIndex(t => t.id === transactionId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    data.transactions[index] = { ...req.body, id: transactionId };
    
    const success = await writeData(data);
    if (success) {
      res.json(data.transactions[index]);
    } else {
      res.status(500).json({ error: 'Error updating transaction' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating transaction' });
  }
});

// DELETE - Eliminar transacción
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const data = await readData();
    const transactionId = parseInt(req.params.id);
    const initialLength = data.transactions.length;
    
    data.transactions = data.transactions.filter(t => t.id !== transactionId);
    
    if (data.transactions.length === initialLength) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const success = await writeData(data);
    if (success) {
      res.json({ message: 'Transaction deleted successfully' });
    } else {
      res.status(500).json({ error: 'Error deleting transaction' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting transaction' });
  }
});

// GET - Obtener usuarios
app.get('/api/users', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.users || []);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// POST - Agregar nuevo usuario
app.post('/api/users', async (req, res) => {
  try {
    const data = await readData();
    const newUser = {
      ...req.body,
      id: Date.now()
    };
    data.users.push(newUser);
    
    const success = await writeData(data);
    if (success) {
      res.json(newUser);
    } else {
      res.status(500).json({ error: 'Error saving user' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error adding user' });
  }
});

// GET/POST - Settings
app.get('/api/settings', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.settings || {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const data = await readData();
    data.settings = { ...data.settings, ...req.body };
    
    const success = await writeData(data);
    if (success) {
      res.json(data.settings);
    } else {
      res.status(500).json({ error: 'Error saving settings' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating settings' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Data file: ${DATA_FILE}`);
});