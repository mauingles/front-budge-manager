<template>
  <div class="date-picker">
    
    <div class="date-selector">
      <button @click="showPicker = !showPicker" class="date-button">
        <span>{{ formatSelectedDate }}</span>
        <svg class="chevron-icon" :class="{ 'rotate': showPicker }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>
      
      <div v-if="showPicker" class="date-picker-dropdown">
        <div class="picker-header">
          <button @click="prevYear" class="nav-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
          <span class="year-display">{{ selectedYear }}</span>
          <button @click="nextYear" class="nav-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>
        
        <div class="months-grid">
          <button 
            v-for="(month, index) in months" 
            :key="index"
            @click="selectMonth(index + 1)"
            :class="['month-btn', { 'selected': selectedMonth === index + 1 }]"
          >
            {{ month }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Overlay para cerrar al hacer click fuera -->
    <div v-if="showPicker" @click="showPicker = false" class="picker-overlay"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const showPicker = ref(false)
const selectedYear = ref(2025)
const selectedMonth = ref(1)

const months = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Inicializar desde modelValue
const initializeFromModelValue = () => {
  if (props.modelValue) {
    const [year, month] = props.modelValue.split('-')
    selectedYear.value = parseInt(year)
    selectedMonth.value = parseInt(month)
  }
}

onMounted(() => {
  initializeFromModelValue()
})

// Observar cambios en modelValue
watch(() => props.modelValue, () => {
  initializeFromModelValue()
})

const formatSelectedDate = computed(() => {
  return `${monthNames[selectedMonth.value - 1]} ${selectedYear.value}`
})

const currentValue = computed(() => {
  const month = selectedMonth.value.toString().padStart(2, '0')
  return `${selectedYear.value}-${month}`
})

const prevYear = () => {
  selectedYear.value--
  updateValue()
}

const nextYear = () => {
  selectedYear.value++
  updateValue()
}

const selectMonth = (month) => {
  selectedMonth.value = month
  updateValue()
  showPicker.value = false
}

const updateValue = () => {
  emit('update:modelValue', currentValue.value)
}

// Cerrar picker al presionar Escape
const handleEscape = (e) => {
  if (e.key === 'Escape') {
    showPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.date-picker {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-label {
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  letter-spacing: 0.025em;
}

.label-icon {
  width: 18px;
  height: 18px;
}

.date-selector {
  position: relative;
}

.date-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
  justify-content: space-between;
}

.date-button:hover {
  border-color: #cbd5e1;
}

.date-button:focus {
  outline: none;
  border-color: #1e293b;
  box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.1);
}

.chevron-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

.date-picker-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
  z-index: 1000;
  padding: 12px;
  animation: slideDown 0.2s ease;
  min-width: 260px;
  width: max-content;
  max-height: 300px;
  overflow-y: auto;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.nav-btn svg {
  width: 14px;
  height: 14px;
}

.year-display {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.month-btn {
  padding: 10px 6px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.month-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

.month-btn.selected {
  background: #1e293b;
  border-color: #1e293b;
  color: white;
}

.month-btn.selected:hover {
  background: #334155;
  border-color: #334155;
}

.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

@media (max-width: 768px) {
  .date-picker {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .date-button {
    width: 100%;
    min-width: auto;
  }
  
  .date-picker-dropdown {
    left: 0;
    right: 0;
  }
  
  .months-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .month-btn {
    padding: 14px 8px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .date-picker-dropdown {
    padding: 16px;
  }
  
  .months-grid {
    gap: 6px;
  }
  
  .month-btn {
    padding: 12px 6px;
    font-size: 14px;
  }
}
</style>