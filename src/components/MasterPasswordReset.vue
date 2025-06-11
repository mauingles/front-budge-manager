<template>
  <BaseModal :show="showModal" @close="$emit('close')">
    <h2>🔑 Resetear Contraseña Maestra</h2>
    
    <form @submit.prevent="handleReset" class="form">
      <div class="current-password">
        <strong>Contraseña actual:</strong> {{ currentPassword }}
      </div>
      
      <div class="field">
        <label>Nueva Contraseña Maestra</label>
        <BaseInput 
          v-model="newPassword" 
          type="password"
          placeholder="Ingresa la nueva contraseña maestra"
          required
        />
      </div>
      
      <div class="field">
        <label>Confirmar Nueva Contraseña</label>
        <BaseInput 
          v-model="confirmPassword" 
          type="password"
          placeholder="Confirma la nueva contraseña"
          required
        />
      </div>
      
      <div v-if="error" class="error">
        ❌ {{ error }}
      </div>
      
      <div class="actions">
        <BaseButton type="button" @click="$emit('close')" class="cancel">
          Cancelar
        </BaseButton>
        <BaseButton type="submit" :disabled="!isFormValid">
          Actualizar Contraseña
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps(['showModal', 'currentPassword'])
const emit = defineEmits(['close', 'update'])

const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')

const isFormValid = computed(() => {
  return newPassword.value && 
         confirmPassword.value && 
         newPassword.value === confirmPassword.value &&
         newPassword.value.length >= 6
})

const handleReset = () => {
  error.value = ''
  
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  
  if (newPassword.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  
  if (newPassword.value === props.currentPassword) {
    error.value = 'La nueva contraseña debe ser diferente a la actual'
    return
  }
  
  emit('update', newPassword.value)
  
  // Reset form
  newPassword.value = ''
  confirmPassword.value = ''
  error.value = ''
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.current-password {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  color: #374151;
  font-family: monospace;
}

.error {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel {
  background: #6b7280;
}

.cancel:hover {
  background: #4b5563;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #374151;
}
</style>