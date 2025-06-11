<template>
  <header class="header">
    <div class="actions">
      <button @click="handleAddIncome" class="action-btn income-btn">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14"/>
          <path d="M5 12h14"/>
        </svg>
        Ingreso
      </button>
      <button @click="handleAddExpense" class="action-btn expense-btn">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14"/>
        </svg>
        Gasto
      </button>
    </div>
  </header>
</template>

<script setup>
const emit = defineEmits(['add'])

const handleAddIncome = () => {
  emit('add', 'income')
}

const handleAddExpense = () => {
  emit('add', 'expense')
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin-bottom: 0;
}

.actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.025em;
  min-width: 160px;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.income-btn {
  background: #10b981;
  color: white;
  border: 2px solid #10b981;
}

.income-btn:hover {
  background: #059669;
  border-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25);
}

.income-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.income-btn:active {
  transform: translateY(0);
}

.expense-btn {
  background: #ef4444;
  color: white;
  border: 2px solid #ef4444;
}

.expense-btn:hover {
  background: #dc2626;
  border-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.25);
}

.expense-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.expense-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
    padding: 16px 20px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .actions {
    gap: 10px;
  }
  
  .action-btn {
    padding: 14px 16px;
    font-size: 15px;
    min-width: auto;
  }
  
  .btn-icon {
    width: 16px;
    height: 16px;
  }
}
</style>