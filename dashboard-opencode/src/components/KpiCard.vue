<script setup lang="ts">
defineProps<{
  title: string
  value: string
  subtitle?: string
}>()
</script>

<template>
  <div class="kpi-card">
    <div class="title">{{ title }}</div>
    <div class="value">{{ value }}</div>
    <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
  </div>
</template>

<style scoped>
.kpi-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.value {
  font-size: 1.75rem;
  font-weight: 700;
}

.subtitle {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
