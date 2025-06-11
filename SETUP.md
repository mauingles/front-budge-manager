# 🚀 Budget Manager - Instalación y Configuración

## 📋 Requisitos
- Node.js 16+ 
- npm o yarn

## 🔧 Instalación

### 1. Backend (Servidor API)
```bash
cd server
npm install
```

### 2. Frontend (Cliente Vue)
```bash
cd ..
npm install
```

## ▶️ Ejecución

### Opción A: Desarrollo (2 terminales)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Servidor en http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Cliente en http://localhost:5173
```

### Opción B: Producción Completa
```bash
# En la raíz del proyecto
npm run build
cd server
npm start
```

## 🗄️ Estructura de Datos

Los datos se guardan en `server/data.json`:
```json
{
  "users": [...],
  "transactions": [...],
  "settings": {
    "masterPassword": "admin123",
    "selectedMonth": "2024-12"
  },
  "currentUser": null
}
```

## 🔐 Usuarios por Defecto

**Super Admin:**
- Usuario: `superadmin`
- Contraseña: `super123`

**Contraseña Maestra:** `admin123`

## 🌐 Endpoints API

- `GET /api/data` - Todos los datos
- `POST /api/data` - Guardar todos los datos
- `GET /api/transactions` - Obtener transacciones
- `POST /api/transactions` - Crear transacción
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción
- `GET /api/users` - Obtener usuarios
- `POST /api/users` - Crear usuario
- `GET/POST /api/settings` - Configuraciones

## 📱 Acceso Multi-dispositivo

1. **Mismo WiFi:** Cambiar `localhost` por IP local en `src/services/api.js`
2. **Internet:** Deployar servidor en Heroku/Railway/Vercel
3. **Red externa:** Usar ngrok para túnel temporal

## 🔄 Backup y Migración

**Backup:** Copiar `server/data.json`
**Restaurar:** Reemplazar `server/data.json` y reiniciar servidor

## 🚨 Troubleshooting

**Error de conexión:**
- Verificar que el servidor esté corriendo en puerto 3001
- Revisar CORS en navegador
- Comprobar firewall/antivirus

**Datos no se guardan:**
- Verificar permisos de escritura en `server/`
- Revisar logs del servidor en consola

**Puerto ocupado:**
- Cambiar puerto en `server/server.js` línea 7
- Actualizar URL en `src/services/api.js` línea 1