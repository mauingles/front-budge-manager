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
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

// Observar cambios en modelValue
watch(() => props.modelValue, () => {
  initializeFromModelValue()
})

const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 480
}

const formatSelectedDate = computed(() => {
  // En móvil (480px o menos) mostrar mes y año
  if (isMobile.value) {
    return `${monthNames[selectedMonth.value - 1]} ${selectedYear.value}`
  }
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
  window.removeEventListener('resize', checkMobile)
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
  width: 100%;
}

.date-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 9px 30px 9px 12px; /* Mismo padding que select */
  border: 2px solid #e5e7eb; /* Mismo border que select */
  border-radius: 6px; /* Mismo border-radius que select */
  background: white;
  color: #1e293b;
  font-size: 16px; /* Mismo font-size que select */
  font-weight: 400; /* Peso normal como select */
  cursor: pointer;
  transition: all 0.2s ease;
  justify-content: space-between;
  font-family: inherit;
  position: relativa;
  /* Quitar estilos que lo diferenciaban */
  min-width: auto;
  box-shadow: none;
}

.date-button:focus {
  outline: none;
}

.chevron-icon {
  width: 16px; /* Mismo tamaño que la flecha del select */
  height: 16px;
  transition: transform 0.2s ease;
  color: #6b7280; /* Mismo color que la flecha del select */
  flex-shrink: 0;
  position: absolute;
  right: 10px;
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

/* Responsive ajustado para mantener consistencia */
@media (max-width: 480px) {
  .date-button {
    padding: 12px 40px 12px 16px; /* Mantener mismo padding en móvil */
    font-size: 16px; /* Mantener mismo tamaño de fuente */
    font-weight: 400;
    height: auto; /* Quitar altura fija */
    border: 2px solid #e5e7eb; /* Mantener mismo border */
    gap: 8px;
  }
  
  .chevron-icon {
    width: 16px !important; /* Mantener tamaño consistente */
    height: 16px !important;
  }
}

.date-picker-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
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
  
  .month-btn {
    padding: 14px 8px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .date-picker {
    width: 100%;
  }
  
  .date-button {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: 40px;
    box-sizing: border-box;
    font-size: 11px;
    font-weight: 600;
    padding: 10px 4px;
    gap: 4px;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  
  .date-button span {
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }
  
  .chevron-icon {
    width: 12px !important;
    height: 12px !important;
    flex-shrink: 0;
  }
  
  .date-picker-dropdown {
    padding: 16px;
    top: calc(100% + 2px);
    left: 0;
    right: 0;
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