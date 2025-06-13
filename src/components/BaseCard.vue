<template>
  <div class="card-base card-hover">
    <slot></slot>
  </div>
</template>

<style scoped>
/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .card-base {
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
  }
}

@media (max-width: 480px) {
  .card-base {
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }
}
</style>