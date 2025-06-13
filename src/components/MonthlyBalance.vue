<template>
  <div class="balance">
    <div class="header-section">
      <div class="month-info">
        <div class="period-info">
          <div class="group-row">
            <GroupSelectorModal 
              v-model="internalSelectedGroup" 
              :available-groups="availableGroups"
              :current-user="currentUser"
              @update:modelValue="handleGroupChange"
            />
          </div>
        </div>
      </div>
      
    </div>

    <div class="visual-summary">
      <!-- Barra de progreso visual -->
      <div class="progress-section">
        <div class="progress-bar">
          <div 
            class="income-bar" 
            :style="{ width: incomePercentage + '%' }"
          ></div>
          <div 
            class="expense-bar" 
            :style="{ width: expensePercentage + '%' }"
          ></div>
        </div>
        <div class="progress-labels">
          <span class="progress-start">Ingresos: {{ incomePercentage }}%</span>
          <span class="progress-end">Gastos: {{ expensePercentage }}%</span>
        </div>
      </div>

      <!-- Métricas compactas -->
      <div class="metrics-grid">
        <div class="metric-card income-card">
          <div class="metric-content">
            <div class="metric-header">
              <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                <polyline points="17,6 23,6 23,12"/>
              </svg>
              <span class="metric-title">Ingresos</span>
            </div>
            <div class="metric-value">+${{ totalIncome }}</div>
          </div>
        </div>
        
        <div class="metric-card expense-card">
          <div class="metric-content">
            <div class="metric-header">
              <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
                <polyline points="17,18 23,18 23,12"/>
              </svg>
              <span class="metric-title">Gastos</span>
            </div>
            <div class="metric-value">-${{ totalExpenses }}</div>
          </div>
        </div>
        
        <div class="metric-card balance-card">
          <div class="metric-content">
            <div class="metric-header">
              <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1v22"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                <circle cx="12" cy="12" r="1"/>
              </svg>
              <span class="metric-title">Saldo</span>
            </div>
            <div :class="['metric-value', saldoClass]">{{ balanceDisplay }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import GroupSelectorModal from './GroupSelectorModal.vue'

const props = defineProps(['totalIncome', 'totalExpenses', 'selectedMonth', 'selectedGroup', 'availableGroups', 'currentUser'])
const emit = defineEmits(['update:selectedGroup'])

// Estado interno para el grupo seleccionado
const internalSelectedGroup = ref(props.selectedGroup)

// Manejar cambio de grupo
const handleGroupChange = (newGroup) => {
  internalSelectedGroup.value = newGroup
  emit('update:selectedGroup', newGroup)
}

// Sincronizar con props cuando cambien externamente
watch(() => props.selectedGroup, (newGroup) => {
  internalSelectedGroup.value = newGroup
})

const currentMonth = computed(() => {
  if (!props.selectedMonth) return ''
  const [year, month] = props.selectedMonth.split('-')
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  })
})

const balance = computed(() => props.totalIncome - props.totalExpenses)

const balanceClass = computed(() => 
  balance.value < 0 ? 'negative' : ''
)

// Para la barra de progreso visual - proporcional al total
const totalAmount = computed(() => props.totalIncome + props.totalExpenses || 1)

const incomePercentage = computed(() => 
  Math.round((props.totalIncome / totalAmount.value) * 100)
)

const expensePercentage = computed(() => 
  Math.round((props.totalExpenses / totalAmount.value) * 100)
)

// Para mostrar el saldo/diferencia
const balanceDisplay = computed(() => {
  if (balance.value >= 0) {
    return `+$${balance.value}`
  } else {
    return `$${balance.value}`
  }
})

// Lógica para el color del saldo
const saldoClass = computed(() => {
  // Si el saldo es >= 100% del ingreso (prácticamente no gastaste)
  if (balance.value >= props.totalIncome && props.totalIncome > 0) {
    return 'excellent' // Verde
  }
  // Si el saldo es <= -100% del egreso (gastaste el doble o más)
  else if (balance.value <= -props.totalExpenses && props.totalExpenses > 0) {
    return 'critical' // Rojo
  }
  // En todos los demás casos: normal positivo (verde) o normal negativo (rojo)
  else {
    return balance.value >= 0 ? 'normal-positive' : 'normal-negative'
  }
})
</script>

<style scoped>
.balance {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
  box-shadow: var(--shadow-sm);
  position: relative;
}

.balance::before {
  display: none;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.month-info {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.period-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width:100%;
}

.month-row, .group-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.month-info h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: -0.025em;
}

.group-name {
  font-size: 14px;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.calendar-icon, .group-icon {
  width: 18px;
  height: 18px;
  opacity: 0.8;
  flex-shrink: 0;
}

.balance-display {
  text-align: right;
}

.balance-label {
  display: block;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 4px;
  letter-spacing: 0.025em;
}

.balance-amount {
  font-size: 28px;
  font-weight: 800;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: -0.02em;
}

.balance-amount.positive {
  color: #22c55e;
}

.balance-amount.negative {
  color: var(--color-danger);
}

.visual-summary {
  position: relative;
  z-index: 1;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-bar {
  height: 6px;
  background: #e1e5e9;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  margin-bottom: 8px;
}

.income-bar {
  height: 100%;
  background: var(--color-success);
  border-radius: 3px;
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.6s ease;
}

.expense-bar {
  height: 100%;
  background: #ee0000;
  border-radius: 3px;
  position: absolute;
  right: 0;
  top: 0;
  transition: width 0.6s ease;
  transform-origin: right;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  min-width: 0;
}

.metric-card {
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid;
  transition: var(--transition-base);
  min-width: 0;
  overflow: hidden;
}

.metric-card:hover {
  box-shadow: var(--shadow-md);
}

.income-card {
  background: #f9fefb;
  border-color: #86efac;
}

.income-card:hover {
  background: #f0fdf4;
  border-color: #22c55e;
}

.expense-card {
  background: #fefbfb;
  border-color: #fca5a5;
}

.expense-card:hover {
  background: #fef2f2;
  border-color: #ee0000;
}

.balance-card {
  background: #fbfcff;
  border-color: #93c5fd;
}

.balance-card:hover {
  background: #eff6ff;
  border-color: #3b82f6;
}

.metric-content {
  display: flex;
  flex-direction: column;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.metric-icon {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.metric-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.025em;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: -0.02em;
  word-break: break-word;
  overflow-wrap: break-word;
}

.income-card .metric-value {
  color: var(--color-success);
}

.expense-card .metric-value {
  color: var(--color-danger);
}

.balance-card .metric-value.excellent {
  color: var(--color-success);
}

.balance-card .metric-value.critical {
  color: var(--color-danger);
}

.balance-card .metric-value.normal-positive {
  color: var(--color-success);
}

.balance-card .metric-value.normal-negative {
  color: var(--color-danger);
}

@media (max-width: 768px) {
  .balance {
    padding: 20px;
  }
  
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .balance-display {
    text-align: left;
    width: 100%;
  }
  
  .month-info h2 {
    font-size: 18px;
  }
  
  .balance-amount {
    font-size: 24px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    width: 100%;
  }
  
  .metric-card {
    padding: 14px;
  }
  
  .metric-value {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .balance {
    padding: 16px;
  }
  
  .month-info {
    gap: 10px;
  }
  
  .month-info h2 {
    font-size: 16px;
  }
  
  .balance-amount {
    font-size: 22px;
  }
  
  .metric-card {
    padding: 12px;
    min-height: auto;
  }
  
  .metric-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .metric-header {
    margin-bottom: 0;
    flex: 1;
  }
  
  .metric-value {
    font-size: 16px;
    line-height: 1.2;
    margin-left: 8px;
  }
}

/* Personalización del GroupSelectorModal dentro del balance */
.group-row :deep(.btn-group) {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.5px;
  padding: 8px 12px;
  height: auto;
  min-height: auto;
}

.group-row :deep(.btn-group):hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

.group-row :deep(.btn-group svg) {
  width: 16px;
  height: 16px;
  opacity: 0.8;
}
</style>