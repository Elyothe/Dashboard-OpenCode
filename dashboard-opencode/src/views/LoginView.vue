<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')

async function handleSubmit() {
  const success = await auth.login(email.value, password.value)
  if (success) {
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  }
}
</script>

<template>
  <div class="login-view">
    <form class="login-card" @submit.prevent="handleSubmit">
      <h2>Connexion</h2>
      <p class="subtitle">OpenCode Metrics Dashboard</p>

      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          placeholder="votre@email.com"
        />
      </div>

      <div class="field">
        <label for="password">Mot de passe</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          placeholder="••••••••"
        />
      </div>

      <p v-if="auth.error" class="error">{{ auth.error }}</p>

      <button type="submit" :disabled="auth.loading" class="submit-btn">
        {{ auth.loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 360px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

h2 {
  margin: 0;
  font-size: 1.5rem;
}

.subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
}

input {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.9375rem;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.error {
  color: rgb(239, 68, 68);
  font-size: 0.875rem;
  margin: 0;
}

.submit-btn {
  padding: 0.65rem;
  border: none;
  border-radius: 0.375rem;
  background: var(--color-primary);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
