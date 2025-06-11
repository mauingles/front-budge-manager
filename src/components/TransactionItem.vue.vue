<template>
  <div class="transaction">
    <div class="transaction-info">
      <div class="main-info">
        <h3>{{ description }}</h3>
        <span v-if="category && category !== 'general'" class="category">
          {{ getCategoryIcon(category) }} {{ getCategoryName(category) }}
        </span>
      </div>
      <div class="meta">
        <span class="user">👤 {{ user }}</span>
        <span class="date">📅 {{ createdAt }}</span>
      </div>
    </div>
    <div :class="['amount', type]">
      {{ type === 'income' ? '+' : '-' }}${{ amount }}
    </div>
  </div>
</template>

<script setup>
defineProps(['description', 'amount', 'type', 'user', 'createdAt', 'category'])

const getCategoryIcon = (category) => {
  const icons = {
    alquiler: '🏠',
    electricidad: '⚡',
    agua: '💧',
    gas: '🔥',
    internet: '🌐',
    seguro: '🛡️',
    otros: '📝'
  }
  return icons[category] || '📝'
}

const getCategoryName = (category) => {
  const names = {
    alquiler: 'Alquiler',
    electricidad: 'Electricidad',
    agua: 'Agua',
    gas: 'Gas',
    internet: 'Internet',
    seguro: 'Seguro',
    otros: 'Otros'
  }
  return names[category] || 'General'
}
</script>

<style scoped>
.transaction {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.main-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-info h3 {
  margin: 0;
  font-size: 16px;
  color: #374151;
}

.category {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
  width: fit-content;
}

.meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
}

.amount {
  font-size: 18px;
  font-weight: 600;
}

.amount.income {
  color: #059669;
}

.amount.expense {
  color: #dc2626;
}
</style>