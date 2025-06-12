<template>
  <BaseCard>
    <h2>{{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}</h2>
    
    <form @submit.prevent="handleSubmit" class="form">
      <div class="field">
        <label>Email</label>
        <BaseInput 
          v-model="email" 
          type="email"
          placeholder="Ingresa tu email"
          required
        />
      </div>
      
      <div class="field">
        <label>Contraseña</label>
        <BaseInput 
          v-model="password" 
          type="password"
          placeholder="Ingresa tu contraseña"
          required
        />
      </div>
      
      <div v-if="!isLogin" class="field">
        <label>Rol</label>
        <select v-model="role" class="select" required @change="onRoleChange">
          <option value="">Seleccionar rol...</option>
          <option value="superadmin">🔱 Super Administrador</option>
          <option value="admin">👑 Administrador</option>
          <option value="user">👤 Usuario</option>
        </select>
      </div>
      
      <div v-if="!isLogin && (role === 'admin' || role === 'superadmin')" class="field">
        <label>Contraseña Maestra de Admin</label>
        <BaseInput 
          v-model="masterPassword" 
          type="password"
          placeholder="Ingresa la contraseña maestra"
          required
        />
        <small class="hint">Se requiere contraseña maestra para crear cuentas de {{ role === 'superadmin' ? 'super administrador' : 'administrador' }}</small>
      </div>
      
      <BaseButton type="submit" :disabled="!isFormValid || loading">
        {{ loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse') }}
      </BaseButton>
      
      <!-- Separador "o" -->
      <div v-if="isLogin" class="divider">
        <span>o</span>
      </div>
      
      <!-- Botón de Google (solo para login) -->
      <button 
        v-if="isLogin" 
        type="button" 
        @click="handleGoogleLogin" 
        class="google-btn"
        :disabled="loading"
      >
        <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {{ loading ? 'Conectando...' : 'Continuar con Google' }}
      </button>
      
      <div class="toggle">
        <button type="button" @click="toggleMode" class="link-btn">
          {{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
        </button>
      </div>
      
      <div v-if="error || authError" class="error">
        ❌ {{ error || authError }}
      </div>
    </form>
  </BaseCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseCard from './BaseCard.vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'
import { useAuth } from '@/composables/useAuth.js'

const emit = defineEmits(['login', 'register', 'google-login'])
const { loginWithGoogle, loginWithEmail, register, error: authError, loading } = useAuth()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const role = ref('')
const masterPassword = ref('')
const error = ref('')

const isFormValid = computed(() => {
  const baseValid = email.value && password.value
  if (!isLogin.value) {
    if (role.value === 'admin' || role.value === 'superadmin') {
      return baseValid && role.value && masterPassword.value
    }
    return baseValid && role.value
  }
  return baseValid
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
  role.value = ''
  masterPassword.value = ''
}

const onRoleChange = () => {
  masterPassword.value = ''
  error.value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  error.value = ''
  
  try {
    if (isLogin.value) {
      // LOGIN: Solo Firebase para usuarios Google, directo para admin/superadmin
      if (role.value === 'admin' || role.value === 'superadmin') {
        // Login local para admin/superadmin
        emit('login', { 
          email: email.value, 
          password: password.value 
        })
      } else {
        // Login con Firebase para usuarios normales
        await loginWithEmail(email.value, password.value)
        emit('login', { email: email.value })
      }
    } else {
      // REGISTRO: Separar flujos
      if (role.value === 'admin' || role.value === 'superadmin') {
        // Registro manual para admin/superadmin (sin Firebase)
        emit('register', { 
          email: email.value, 
          password: password.value,
          role: role.value,
          masterPassword: masterPassword.value 
        })
      } else {
        // Registro con Firebase para usuarios normales
        await register(email.value, password.value)
        emit('register', { 
          email: email.value, 
          role: 'user',
          masterPassword: masterPassword.value 
        })
      }
    }
  } catch (err) {
    error.value = authError.value || 'Error en la autenticación'
  }
}

const handleGoogleLogin = async () => {
  try {
    error.value = ''
    await loginWithGoogle()
    emit('google-login')
  } catch (err) {
    error.value = authError.value || 'Error al iniciar sesión con Google'
  }
}

const showError = (message) => {
  error.value = message
}

defineExpose({ showError })
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.toggle {
  text-align: center;
  margin-top: 16px;
}

.link-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
}

.link-btn:hover {
  color: #2563eb;
}

.error {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
}

.hint {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
  font-style: italic;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #374151;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  padding: 0 16px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.google-btn:hover:not(:disabled) {
  border-color: #d1d5db;
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.google-icon {
  flex-shrink: 0;
}
</style>