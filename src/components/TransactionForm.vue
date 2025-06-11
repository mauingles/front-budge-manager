<template>
  <form class="transaction-form" @submit.prevent="handleSubmit">
    
    <div v-if="type === 'expense'" class="field">
      <select v-model="category" class="select" required>
        <option value="">Seleccionar categoría...</option>
        <option value="alquiler">🏠 Alquiler</option>
        <option value="electricidad">⚡ Electricidad</option>
        <option value="agua">💧 Agua</option>
        <option value="gas">🔥 Gas</option>
        <option value="internet">🌐 Internet</option>
        <option value="seguro">🛡️ Seguro</option>
        <option value="otros">📝 Otros</option>
      </select>
    </div>
    
    <div class="field">
      <label>Grupo</label>
      <select v-model="selectedGroup" class="select">
        <option value="">Sin grupo</option>
        <option v-for="group in availableGroups" :key="group.id" :value="group.id">
          {{ group.name }}
        </option>
      </select>
    </div>
    
    <div class="field">
      <label>Descripción (opcional)</label>
      <BaseInput 
        v-model="description" 
        :placeholder="type === 'income' ? 'Ej: Salario, Freelance... (opcional)' : 'Ej: Factura de luz, Renta... (opcional)'"
        :required="false"
      />
    </div>
    
    <div class="field">
      <label>Monto ($)</label>
      <BaseInput 
        v-model="amount" 
        type="number" 
        step="0.01" 
        placeholder="0.00"
        required
      />
    </div>
    
    <div class="form-actions">
      <BaseButton type="submit" :disabled="!isFormValid">
        Guardar {{ type === 'income' ? 'Ingreso' : 'Gasto' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps(['initialType', 'selectedMonth', 'currentUser', 'editingTransaction', 'isEditing', 'availableGroups', 'preselectedGroup'])

const type = ref(props.initialType || 'income')
const category = ref('')
const selectedGroup = ref('')
const description = ref('')
const amount = ref('')
const user = ref(props.currentUser || '')

const emit = defineEmits(['submit'])

// Validation
const isFormValid = computed(() => {
  const amountValid = amount.value
  if (type.value === 'expense') {
    // Para gastos: solo monto y categoría son requeridos, descripción es opcional
    return amountValid && category.value
  } else {
    // Para ingresos: solo monto es requerido, descripción es opcional
    return amountValid
  }
})

// Reset category when changing type
watch(() => props.initialType, (newType) => {
  if (newType) {
    type.value = newType
    if (!props.isEditing) {
      category.value = ''
    }
  }
})

// Load data when editing
watch(() => props.editingTransaction, (transaction) => {
  if (transaction && props.isEditing) {
    type.value = transaction.type
    category.value = transaction.category || ''
    selectedGroup.value = transaction.groupId || ''
    description.value = transaction.description
    amount.value = transaction.amount.toString()
    user.value = transaction.user
  }
}, { immediate: true })

// Reset form when not editing
watch(() => props.isEditing, (isEditing) => {
  if (!isEditing) {
    category.value = ''
    selectedGroup.value = props.preselectedGroup?.id || ''
    description.value = ''
    amount.value = ''
  }
})

// Watch for changes in preselected group when not editing
watch(() => props.preselectedGroup, (newGroup) => {
  if (!props.isEditing) {
    selectedGroup.value = newGroup?.id || ''
  }
}, { immediate: true })

// Clear description when category changes for expenses
watch(category, (newCategory, oldCategory) => {
  if (type.value === 'expense' && newCategory !== oldCategory && !props.isEditing) {
    description.value = ''
  }
})

const handleSubmit = () => {
  if (!isFormValid.value) return
  
  const transaction = {
    type: type.value,
    category: category.value || 'general',
    groupId: selectedGroup.value || null,
    description: description.value || (type.value === 'income' ? 'Ingreso' : (category.value ? category.value.charAt(0).toUpperCase() + category.value.slice(1) : 'Gasto')),
    amount: parseFloat(amount.value),
    user: user.value,
    date: props.selectedMonth, // Use selected month from parent
    createdAt: new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  emit('submit', transaction)
  
  // Reset form only if not editing
  if (!props.isEditing) {
    description.value = ''
    amount.value = ''
    category.value = ''
    selectedGroup.value = ''
  }
}
</script>

<style scoped>

.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: auto;
  min-width: 320px;
  max-width: 400px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-weight: 600;
  color: #1e293b;
  font-size: 13px;
  margin-bottom: 2px;
}

.select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  transition: all 0.2s ease;
  font-family: inherit;
  color: #1e293b;
}

.select:focus {
  outline: none;
  border-color: #1e293b;
  box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.1);
  transform: translateY(-1px);
}

.select:hover {
  border-color: #cbd5e1;
}

.select:disabled {
  background: #f8fafc;
  border-color: #e2e8f0;
  cursor: not-allowed;
  color: #94a3b8;
}

.form-actions {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .transaction-form {
    gap: 12px;
    min-width: 280px;
  }
  
  .field {
    gap: 4px;
  }
  
  .select {
    padding: 6px 10px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .transaction-form {
    min-width: 260px;
  }
}
</style>