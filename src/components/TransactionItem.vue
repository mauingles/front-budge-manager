<template>
  <div :class="['transaction', { 'expanded': isExpanded }]" @click="toggleExpand">
    <!-- Vista compacta para móvil -->
    <div class="mobile-compact" v-if="isMobile && !isExpanded">
      <div class="compact-info">
        <span class="compact-user">{{ user }}</span>
        <span class="compact-date">{{ formatDate(date) }}</span>
      </div>
      <div :class="['compact-amount', type]">
        {{ type === 'income' ? '+' : '-' }}${{ amount }}
      </div>
    </div>
    
    <!-- Vista completa (desktop y móvil expandido) -->
    <div class="full-content" v-if="!isMobile || isExpanded">
      <div class="transaction-info">
        <h3>{{ description }}</h3>
        <div class="meta">
          <span class="user">{{ user }}</span>
          <span class="date">{{ formatDate(date) }}</span>
          <span v-if="showGroup" class="group">{{ groupName || 'Sin grupo' }}</span>
        </div>
      </div>
      <div class="transaction-actions">
        <div :class="['amount', type]">
          {{ type === 'income' ? '+' : '-' }}${{ amount }}
        </div>
        <div v-if="canEdit" class="admin-buttons">
          <button @click.stop="$emit('edit')" class="edit-btn" title="Editar">
            ✎
          </button>
          <button @click.stop="$emit('delete')" class="delete-btn" title="Eliminar">
            ✕
          </button>
        </div>
      </div>
    </div>
    
    <!-- Indicador de expansión en móvil -->
    <div v-if="isMobile" class="expand-indicator" @click.stop="toggleExpand">
      <svg :class="{ 'rotated': isExpanded }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6,9 12,15 18,9"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps(['description', 'amount', 'type', 'user', 'date', 'canEdit', 'groupName', 'showGroup'])

const isExpanded = ref(false)
const windowWidth = ref(window.innerWidth)

// Detectar si está en móvil
const isMobile = computed(() => windowWidth.value <= 768)

// Función para actualizar el ancho de ventana
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
  // Reset expansion when switching to desktop
  if (!isMobile.value) {
    isExpanded.value = false
  }
}

// Función para alternar expansión
const toggleExpand = () => {
  if (isMobile.value) {
    isExpanded.value = !isExpanded.value
  }
}

// Función para formatear la fecha correctamente
const formatDate = (dateString) => {
  // Si la fecha incluye coma y hora, devolverla tal como está
  if (dateString && dateString.includes(',')) {
    return dateString.replace(',', '\xa0')
  }
  // Si es solo año-mes, devolver formato más legible
  if (dateString && dateString.includes('-')) {
    const [year, month] = dateString.split('-')
    return `${month}/${year}`
  }
  // Fallback
  return dateString || 'Sin fecha'
}

// Función para formatear fecha compacta (solo día/mes y hora)
const formatCompactDate = (dateString) => {
  if (dateString && dateString.includes(',')) {
    // "DD/MM/YYYY, HH:MM" -> "DD/MM HH:MM"
    const parts = dateString.split(', ')
    if (parts.length === 2) {
      const datePart = parts[0] // "DD/MM/YYYY"
      const timePart = parts[1] // "HH:MM"
      const [day, month] = datePart.split('/')
      return `${day}/${month} ${timePart}`
    }
  }
  return formatDate(dateString)
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

defineEmits(['delete', 'edit'])
</script>

<style scoped>
.transaction {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  transition: var(--transition-base);
  position: relative;
}

/* Desktop - no cursor pointer por defecto */
@media (min-width: 769px) {
  .transaction {
    cursor: default;
  }
  
  .transaction:hover {
    cursor: default;
  }
}

.transaction:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

.transaction:last-child {
  margin-bottom: 0;
}

.transaction.expanded {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

/* Vista completa (desktop y móvil expandido) */
.full-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

/* Vista compacta para móvil */
.mobile-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 30px; /* Espacio para el indicador */
}

.compact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.compact-user {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.compact-date {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.compact-amount {
  font-size: 16px;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.compact-amount.income {
  color: var(--color-success);
}

.compact-amount.expense {
  color: var(--color-danger);
}

/* Indicador de expansión */
.expand-indicator {
  position: absolute;
  right: 12px;
  top: 25px;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-base);
}

.expand-indicator:hover {
  color: var(--text-primary);
}

.expand-indicator svg {
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease;
}

.expand-indicator svg.rotated {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .transaction {
    padding: 12px;
    cursor: pointer;
  }
  
  .mobile-compact {
    padding-right: 30px;
  }
  
  .compact-user {
    font-size: 13px;
  }
  
  .compact-date {
    font-size: 11px;
  }
  
  .compact-amount {
    font-size: 15px;
  }
  
  /* Estilos para vista expandida en móvil */
  .full-content .transaction-info h3 {
    font-size: 14px;
  }
  
  .full-content .amount {
    font-size: 15px;
  }
  
  .full-content .meta {
    gap: 10px;
    font-size: 10px;
  }
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-info h3 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.user, .date {
  display: inline-block;
}

.group {
  background: rgba(241, 245, 249, 0.8);
  color: #475569;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  display: inline-block;
}



.transaction-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.amount {
  font-size: 16px;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  line-height: 1;
}

.amount.income {
  color: var(--color-success);
}

.amount.expense {
  color: var(--color-danger);
}



@media (max-width: 480px) {
  .transaction {
    padding: 10px;
  }
  
  .compact-user {
    font-size: 12px;
  }
  
  .compact-date {
    font-size: 10px;
  }
  
  .compact-amount {
    font-size: 14px;
  }
  
  /* Vista expandida en móvil muy pequeño */
  .full-content {
    flex-direction: column;
    gap: 10px;
  }
  
  .full-content .transaction-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .admin-buttons {
    gap: 6px;
  }
  
  .edit-btn, .delete-btn {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
}

.admin-buttons {
  display: flex;
  gap: 4px;
}

.edit-btn, .delete-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f8f9fa;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  color: #64748b;
}

.edit-btn:hover {
  background: #0070f3;
  color: #ffffff;
}

.delete-btn:hover {
  background: #ee0000;
  color: #ffffff;
}

</style>