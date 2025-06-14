<template>
  <div @click="toggleExpanded" ref="transactionRef" :class="['transaction', { 'expanded': isExpanded }]">
    <!-- Botón chevron siempre en esquina superior derecha (solo móvil) -->
    <button v-if="isMobile" @click="toggleExpanded" class="chevron-btn" :title="isExpanded ? 'Ocultar detalles' : 'Ver detalles'">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </button>
    
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
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps(['description', 'amount', 'type', 'user', 'date', 'canEdit', 'groupName', 'showGroup'])

const isExpanded = ref(false)
const windowWidth = ref(window.innerWidth)
const transactionRef = ref(null)
let scrollContainer = null

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


// Función para formatear la fecha correctamente
const formatDate = (dateValue) => {
  // Verificar si es null o undefined
  if (!dateValue) {
    return 'Sin fecha'
  }
  
  // Convertir a string si no lo es
  let dateString = dateValue
  if (typeof dateValue !== 'string') {
    // Si es un objeto Date o Timestamp de Firestore
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      dateString = dateValue.toDate().toLocaleDateString('es-ES')
    } else if (dateValue instanceof Date) {
      dateString = dateValue.toLocaleDateString('es-ES')
    } else {
      // Intentar convertir a string
      dateString = String(dateValue)
    }
  }
  
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
const formatCompactDate = (dateValue) => {
  // Usar la función formatDate para asegurar que tenemos un string
  const dateString = formatDate(dateValue)
  
  if (dateString && typeof dateString === 'string' && dateString.includes(',')) {
    // "DD/MM/YYYY, HH:MM" -> "DD/MM HH:MM"
    const parts = dateString.split(', ')
    if (parts.length === 2) {
      const datePart = parts[0] // "DD/MM/YYYY"
      const timePart = parts[1] // "HH:MM"
      const [day, month] = datePart.split('/')
      return `${day}/${month} ${timePart}`
    }
  }
  return dateString
}

// Función para toggle del estado expandido
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
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
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
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
  transform: scale(1.02);
}

/* Vista completa (desktop y móvil expandido) */
.full-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  animation: fadeInExpand 0.3s ease-out;
}

@keyframes fadeInExpand {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Vista compacta para móvil */
.mobile-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
}

.mobile-compact::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%);
  opacity: 0.4;
  animation: shimmer 2.5s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.4; transform: translateX(-15px); }
  50% { opacity: 0.7; transform: translateX(15px); }
}

/* Botón chevron elegante y consistente */
.chevron-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  backdrop-filter: blur(10px);
  border: 0px;
}

.chevron-btn svg {
  width: 14x;
  height: 14px;
  transition: transform 0.2s ease;
}

.transaction.expanded .chevron-btn svg {
  transform: rotate(180deg);
}

@keyframes subtlePulse {
  0%, 100% { 
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-color: transparent;
  }
  50% { 
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.1);
  }
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


@media (max-width: 768px) {
  .transaction {
    padding: 12px;
    cursor: pointer;
    position: relative;
    border: 2px solid transparent;
    background: linear-gradient(var(--bg-primary), var(--bg-primary)) padding-box,
                linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%) border-box;
  }
  
  .transaction:not(.expanded) {
    animation: subtlePulse 3s ease-in-out infinite;
  }
  
  .transaction:hover:not(.expanded) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
    animation: none;
  }
  
  .transaction:active:not(.expanded) {
    transform: translateY(-1px) scale(0.98);
    transition: all 0.1s ease;
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
    margin-top: 22px;
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