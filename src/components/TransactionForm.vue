<template>
  <form class="transaction-form" @submit.prevent="handleSubmit">

    
    <div class="field">
      <label>Grupo</label>
      <select v-model="selectedGroup" class="select" @change="handleGroupChange">
        <option value="create-new">+ Crear grupo</option>
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
      <label>Categoría</label>
      <select v-model="category" class="select" :required="type === 'expense'">
        <option value="varios">Varios</option>
        <template v-if="type === 'expense'">
          <option value="alquiler">Alquiler</option>
          <option value="electricidad">Electricidad</option>
          <option value="agua">Agua</option>
          <option value="gas">Gas</option>
          <option value="internet">Internet</option>
          <option value="telefono">Teléfono</option>
          <option value="compra">Compra</option>
          <option value="expensa">Expensa</option>
          <option value="impuesto">Impuesto</option>
          <option value="seguro">Seguro</option>
        </template>
        <template v-if="type === 'income'">
          <option value="nomina">Nómina</option>
        </template>
        <option value="otros">Otros</option>
      </select>
    </div>
    
    <div class="field">
      <label>Monto ($)</label>
      <BaseInput 
        ref="amountInput"
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
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps(['initialType', 'selectedMonth', 'currentUser', 'editingTransaction', 'isEditing', 'availableGroups', 'preselectedGroup'])

const type = ref(props.initialType || 'income')
const category = ref('varios')
const selectedGroup = ref('')
const description = ref('')
const amount = ref('')
const user = ref(props.currentUser || '')
const amountInput = ref(null)

const emit = defineEmits(['submit', 'create-group'])

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
      category.value = 'varios'
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
    category.value = 'varios'
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

// Handle group change
const handleGroupChange = (event) => {
  if (event.target.value === 'create-new') {
    // Reset the select to empty
    selectedGroup.value = ''
    // Emit event to open group creation modal
    emit('create-group')
  }
}

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
    category: category.value || 'otros',
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
    category.value = 'varios'
    selectedGroup.value = ''
  }
}

// Enfocar el campo monto al montar el componente
onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      if (amountInput.value?.focus) {
        amountInput.value.focus()
      }
    }, 150)
  })
})
</script>

<style scoped>

.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: auto;
  min-width: 280px;
  max-width: 340px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

label {
  font-weight: 600;
  color: #1e293b;
  font-size: 12px;
  margin-bottom: 0;
}

.select {
  width: 100%;
  padding: 6px 30px 6px 10px;
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-md);
  font-family: var(--font-family-base);
  font-size: 13px;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: var(--transition-base);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
}

.select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
}

.select:hover {
  border-color: var(--border-hover);
  background-color: #f8fafc;
}

/* Estilos para inputs más compactos */
.transaction-form :deep(.input-base) {
  padding: 6px 10px;
  font-size: 13px;
}

.form-actions {
  margin-top: 2px;
  padding-top: 4px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .transaction-form {
    gap: 16px;
    min-width: 300px;
    max-width: 100%;
    margin: 0;
    width: 100%;
  }
  
  .field {
    gap: 8px;
  }
    
  label {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .transaction-form {
    min-width: 100%;
    max-width: 100%;
    padding: 0;
    gap: 18px;
  }
  
  .field {
    gap: 8px;
  }

  
  label {
    font-size: 15px;
    font-weight: 700;
  }
  
  .form-actions {
    margin-top: 16px;
    padding-top: 16px;
  }
}
</style>