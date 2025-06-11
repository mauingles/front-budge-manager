<template>
  <div class="balance">
    <div class="header-section">
      <div class="month-info">
        <div class="period-info">
          <div class="month-row">
            <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <h2>{{ currentMonth }}</h2>
          </div>
          <div class="group-row" v-if="selectedGroup">
            <svg class="group-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span class="group-name">GRUPO {{ selectedGroup.name.toUpperCase() }}</span>
          </div>
          <div class="group-row" v-else>
            <svg class="group-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            <span class="group-name">TODAS LAS TRANSACCIONES</span>
          </div>
        </div>
      </div>
      
      <div class="balance-display">
        <span class="balance-label">Balance</span>
        <span :class="['balance-amount', balanceClass]">
          ${{ balance }}
        </span>
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
          <span class="progress-end">Egresos: {{ expensePercentage }}%</span>
        </div>
      </div>

      <!-- Métricas compactas -->
      <div class="metrics-grid">
        <div class="metric-card income-card">
          <div class="metric-header">
            <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
              <polyline points="17,6 23,6 23,12"/>
            </svg>
            <span class="metric-title">Ingresos</span>
          </div>
          <div class="metric-value">+${{ totalIncome }}</div>
        </div>
        
        <div class="metric-card expense-card">
          <div class="metric-header">
            <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
              <polyline points="17,18 23,18 23,12"/>
            </svg>
            <span class="metric-title">Egresos</span>
          </div>
          <div class="metric-value">-${{ totalExpenses }}</div>
        </div>
        
        <div class="metric-card balance-card">
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
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['totalIncome', 'totalExpenses', 'selectedMonth', 'selectedGroup'])

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
  balance.value >= 0 ? 'positive' : 'negative'
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
  // En todos los demás casos
  else {
    return 'normal' // Amarillo
  }
})
</script>

<style scoped>
.balance {
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  color: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
  position: relative;
  overflow: hidden;
}

.balance::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  pointer-events: none;
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
}

.period-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.month-row, .group-row {
  display: flex;
  align-items: center;
  gap: 8px;
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
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
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
  opacity: 0.8;
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
  color: #ef4444;
}

.visual-summary {
  position: relative;
  z-index: 1;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  margin-bottom: 8px;
}

.income-bar {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  border-radius: 4px;
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.6s ease;
}

.expense-bar {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  border-radius: 4px;
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
  opacity: 0.7;
  font-weight: 500;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.metric-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
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
  opacity: 0.8;
}

.metric-title {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  letter-spacing: 0.025em;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: -0.02em;
}

.income-card .metric-value {
  color: #22c55e;
}

.expense-card .metric-value {
  color: #ef4444; /* Rojo para egresos */
}

.balance-card .metric-value.excellent {
  color: #22c55e; /* Verde: saldo >= 100% del ingreso */
}

.balance-card .metric-value.critical {
  color: #ef4444; /* Rojo: saldo <= -100% del egreso */
}

.balance-card .metric-value.normal {
  color: #fbbf24; /* Amarillo: casos normales */
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
    gap: 10px;
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
  }
  
  .metric-value {
    font-size: 15px;
  }
}
</style>