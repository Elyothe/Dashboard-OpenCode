<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <header class="app-header">
    <div class="brand">
      <span class="logo">⚡</span>
      <h1>OpenCode Metrics</h1>
    </div>

    <div v-if="auth.isAuthenticated" class="user">
      <span class="email">{{ auth.user?.email }}</span>
      <button class="logout-btn" @click="auth.logout">Logout</button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  font-size: 1.5rem;
}

h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.email {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.logout-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: var(--color-bg-hover);
}
</style>
