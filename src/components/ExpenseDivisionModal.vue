<template>
  <div class="expense-division-modal">
    <button @click="showModal = true" class="btn btn-division">
      <svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M388.9 597.4c-135.2 0-245.3-110-245.3-245.3s110-245.3 245.3-245.3 245.3 110 245.3 245.3-110.1 245.3-245.3 245.3z m0-405.3c-88.2 0-160 71.8-160 160s71.8 160 160 160 160-71.8 160-160-71.8-160-160-160z" fill="#3688FF"></path><path d="M591.3 981.3H186.5c-76.6 0-138.8-62.3-138.8-138.8V749c0-130.6 106.2-236.9 236.9-236.9h208.8c130.6 0 236.9 106.3 236.9 236.9v93.5c-0.2 76.5-62.4 138.8-139 138.8zM284.5 597.4c-83.6 0-151.5 68-151.5 151.5v93.5c0 29.5 24 53.5 53.5 53.5h404.8c29.5 0 53.5-24 53.5-53.5v-93.5c0-83.6-68-151.5-151.6-151.5H284.5z" fill="#3688FF"></path><path d="M847.2 938.6c-23.6 0-42.7-19.1-42.7-42.7s19.1-42.7 42.7-42.7c29.5 0 53.5-24 53.5-53.5v-93.5c0-83.6-68-151.5-151.6-151.5h-14.3c-19.8 0-37-13.6-41.5-32.9-4.5-19.3 4.8-39.1 22.5-48 54.8-27.3 88.9-82.1 88.9-143.1 0-88.2-71.8-160-160-160-23.6 0-42.7-19.1-42.7-42.7s19.1-42.7 42.7-42.7c135.2 0 245.3 110 245.3 245.3 0 57.8-19.9 111.9-54.9 154.8 88.3 34.6 151 120.6 151 220.9v93.5c0 76.6-62.3 138.8-138.9 138.8z" fill="#5F6379"></path></g></svg>
      Dividir gastos
    </button>
    
    <!-- Modal compacto usando BaseModal -->
    <BaseModal :show="showModal" @close="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-subtitle" >Selecciona cómo dividir los gastos entre los miembros del grupo activo</span>
        </div>
        
        <div class="division-list">
          <div 
            @click="selectDivision('equal')" 
            :class="['division-item', { 'selected': selectedDivision === 'equal' }]"
          >
            <div class="division-icon-container equal-division">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="division-info">
              <span class="division-name">Todos por igual</span>
              <span class="division-desc">Dividir el gasto equitativamente</span>
            </div>
            <div v-if="selectedDivision === 'equal'" class="check-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
    
    <!-- Modal de resultados de división -->
    <BaseModal :show="showResultsModal" @close="showResultsModal = false">
      <div class="results-modal">
        <div v-if="divisionResults.transfers && divisionResults.transfers.length > 0" class="results-content">
          <div class="summary">
            <div class="summary-item">
              <span class="summary-label">Total gastado:</span>
              <span class="summary-value">${{ divisionResults.totalExpenses?.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Por persona:</span>
              <span class="summary-value">${{ divisionResults.expensePerPerson?.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="transfers">
            <h4>Transferencias necesarias:</h4>
            <div v-for="transfer in divisionResults.transfers" :key="`${transfer.from}-${transfer.to}`" class="transfer-item">
              <div class="transfer-info">
                <span class="transfer-from">{{ transfer.from }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transfer-arrow">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12,5 19,12 12,19"/>
                </svg>
                <span class="transfer-to">{{ transfer.to }}</span>
              </div>
              <span class="transfer-amount">${{ transfer.amount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="no-transfers">
          <div class="no-transfers-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </div>
          <h4>¡Todo está equilibrado!</h4>
          <p>No hay transferencias necesarias. Los gastos ya están balanceados entre todos los miembros.</p>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps(['selectedGroup', 'transactions', 'selectedMonth'])
const emit = defineEmits(['division-change'])

const showModal = ref(false)
const showResultsModal = ref(false)
const selectedDivision = ref('equal') // Opción por defecto
const divisionResults = ref([])

const selectDivision = (divisionType) => {
  selectedDivision.value = divisionType
  
  if (divisionType === 'equal' && props.selectedGroup) {
    calculateEqualDivision()
    showResultsModal.value = true
  } else {
    emit('division-change', divisionType)
  }
  closeModal()
}

const calculateEqualDivision = () => {
  if (!props.selectedGroup || !props.transactions) return
  
  // Filtrar transacciones del grupo y mes seleccionado
  const groupTransactions = props.transactions.filter(t => 
    t.groupId === props.selectedGroup.id && 
    t.date === props.selectedMonth
  )
  
  // Calcular gastos por usuario
  const userExpenses = {}
  const userIncomes = {}
  
  // Inicializar todos los miembros del grupo
  props.selectedGroup.members.forEach(member => {
    userExpenses[member.username] = 0
    userIncomes[member.username] = 0
  })
  
  // Sumar gastos e ingresos por usuario
  groupTransactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      userExpenses[transaction.user] = (userExpenses[transaction.user] || 0) + transaction.amount
    } else if (transaction.type === 'income') {
      userIncomes[transaction.user] = (userIncomes[transaction.user] || 0) + transaction.amount
    }
  })
  
  // Calcular total de gastos del grupo
  const totalExpenses = Object.values(userExpenses).reduce((sum, amount) => sum + amount, 0)
  const memberCount = props.selectedGroup.members.length
  const expensePerPerson = totalExpenses / memberCount
  
  // Calcular quién debe cuánto a quién
  const balances = {}
  props.selectedGroup.members.forEach(member => {
    const userExpense = userExpenses[member.username] || 0
    balances[member.username] = userExpense - expensePerPerson
  })
  
  // Crear lista de deudas
  const results = []
  const debtors = []
  const creditors = []
  
  // Separar deudores y acreedores
  Object.entries(balances).forEach(([user, balance]) => {
    if (balance < 0) {
      debtors.push({ user, amount: Math.abs(balance) })
    } else if (balance > 0) {
      creditors.push({ user, amount: balance })
    }
  })
  
  // Calcular transferencias necesarias
  let debtorIndex = 0
  let creditorIndex = 0
  
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]
    
    const transferAmount = Math.min(debtor.amount, creditor.amount)
    
    if (transferAmount > 0.01) { // Evitar centavos
      results.push({
        from: debtor.user,
        to: creditor.user,
        amount: Math.round(transferAmount * 100) / 100
      })
    }
    
    debtor.amount -= transferAmount
    creditor.amount -= transferAmount
    
    if (debtor.amount <= 0.01) debtorIndex++
    if (creditor.amount <= 0.01) creditorIndex++
  }
  
  divisionResults.value = {
    totalExpenses,
    expensePerPerson: Math.round(expensePerPerson * 100) / 100,
    userExpenses,
    transfers: results
  }
}

const closeModal = () => {
  showModal.value = false
}

const closeResultsModal = () => {
  showResultsModal.value = false
}
</script>

<style scoped>
.expense-division-modal {
  position: relative;
}

.btn-division {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
  width: 100%;
}

.btn-division svg {
  width: 16px;
}

.btn-division:hover {
  border-color: #2563eb;
  background: #dbeafe;
}

.modal-content {
  max-width: 200px;
  width: auto;
  min-width: 180px;
}

.modal-header {
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.modal-subtitle {
  margin: 0;
  font-size: 12x;
  color: #000;
  font-weight: 600;
  line-height: 1.4;
}

.division-list {
  max-height: 240px;
  overflow-y: auto;
  padding: 0;
}

.division-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin-bottom: 3px;
  border: 1px solid transparent;
  position: relative;
}

.division-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.division-item.selected {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.3);
}

.division-icon-container {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
  color: #64748b;
}

.division-icon-container.equal-division {
  background: #f0f9ff;
  color: #0ea5e9;
}

.division-icon-container.none-division {
  background: #fef7ed;
  color: #ea580c;
}

.division-icon-container svg {
  width: 12px;
  height: 12px;
}

.division-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.division-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.division-desc {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.1;
}

.check-icon {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 6px;
}

.check-icon svg {
  width: 8px;
  height: 8px;
}

@media (max-width: 480px) {
  .modal-content {
    max-width: 100%;
  }
  
  .modal-header h3 {
    font-size: 18px;
  }
  
  .modal-subtitle {
    font-size: 13px;
  }
  
  .division-item {
    padding: 16px 12px;
  }
  
  .division-icon-container {
    width: 32px;
    height: 32px;
  }
  
  .division-icon-container svg {
    width: 16px;
    height: 16px;
  }
  
  .division-name {
    font-size: 14px;
  }
  
  .division-desc {
    font-size: 12px;
  }
  
  .check-icon {
    width: 18px;
    height: 18px;
  }
  
  .check-icon svg {
    width: 10px;
    height: 10px;
  }
}

/* Estilos para el modal de resultados */
.results-modal {
  max-width: 400px;
  width: auto;
  min-width: 320px;
}

.results-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.results-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.results-subtitle {
  margin: 0;
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
}

.results-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-item:last-child {
  margin-bottom: 0;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  font-weight: 600;
}

.summary-label {
  font-size: 14px;
  color: #64748b;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.transfers h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.transfer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  margin-bottom: 8px;
}

.transfer-item:last-child {
  margin-bottom: 0;
}

.transfer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.transfer-from, .transfer-to {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
}

.transfer-arrow {
  width: 16px;
  height: 16px;
  color: #f59e0b;
}

.transfer-amount {
  font-size: 14px;
  font-weight: 700;
  color: #92400e;
}

.no-transfers {
  text-align: center;
  padding: 32px 16px;
}

.no-transfers-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
}

.no-transfers-icon svg {
  width: 32px;
  height: 32px;
}

.no-transfers h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #16a34a;
}

.no-transfers p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .results-modal {
    max-width: 100%;
    min-width: 100%;
  }
  
  .transfer-info {
    gap: 8px;
  }
  
  .transfer-from, .transfer-to {
    font-size: 13px;
  }
  
  .transfer-amount {
    font-size: 13px;
  }

  .btn-division svg {
    width: 14px !important;
  }
}
</style>