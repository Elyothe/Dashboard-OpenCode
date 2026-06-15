<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMetrics, type ReviewRun } from '@/composables/useMetrics'

const route = useRoute()
const router = useRouter()
const metrics = useMetrics()

const run = ref<ReviewRun | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const prNumber = computed(() => Number(route.params.number))
const tokens = computed(() => run.value?.token_usage?.[0])
const githubLink = computed(() => {
  if (!run.value) return '#'
  return `https://github.com/${run.value.repo_name}/pull/${run.value.pr_number}`
})

onMounted(async () => {
  loading.value = true
  run.value = await metrics.fetchRunByPR(prNumber.value)
  loading.value = false
  if (!run.value) {
    error.value = 'Aucune analyse trouvée pour cette PR'
  }
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR')
}
</script>

<template>
  <div class="pr-detail-view">
    <button class="back-btn" @click="router.push('/')">← Retour au dashboard</button>

    <div v-if="loading" class="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <template v-else-if="run">
      <header class="pr-header">
        <h2>PR #{{ run.pr_number }} — {{ run.pr_title || 'Sans titre' }}</h2>
        <a :href="githubLink" target="_blank" rel="noopener" class="github-link">
          Voir sur GitHub →
        </a>
      </header>

      <div class="detail-grid">
        <div class="detail-card">
          <span class="label">Statut</span>
          <span :class="['value', run.status]">{{ run.status }}</span>
        </div>
        <div class="detail-card">
          <span class="label">Durée</span>
          <span class="value">{{ run.duration_seconds }}s</span>
        </div>
        <div class="detail-card">
          <span class="label">Coût runner</span>
          <span class="value">${{ run.estimated_cost_usd.toFixed(4) }}</span>
        </div>
        <div class="detail-card">
          <span class="label">Énergie</span>
          <span class="value">{{ run.estimated_energy_kwh.toFixed(6) }} kWh</span>
        </div>
      </div>

      <div v-if="tokens" class="token-section">
        <h3>Utilisation des tokens</h3>
        <div class="token-grid">
          <div class="token-card">
            <span class="label">Prompt</span>
            <span class="value">{{ tokens.prompt_tokens.toLocaleString('fr-FR') }}</span>
          </div>
          <div class="token-card">
            <span class="label">Completion</span>
            <span class="value">{{ tokens.completion_tokens.toLocaleString('fr-FR') }}</span>
          </div>
          <div class="token-card">
            <span class="label">Total</span>
            <span class="value">{{ tokens.total_tokens.toLocaleString('fr-FR') }}</span>
          </div>
          <div class="token-card">
            <span class="label">Restant estimé</span>
            <span class="value">{{ tokens.estimated_remaining.toLocaleString('fr-FR') }}</span>
          </div>
        </div>
      </div>

      <div class="meta">
        <p><strong>Repo :</strong> {{ run.repo_name }}</p>
        <p><strong>Auteur :</strong> {{ run.pr_author || 'inconnu' }}</p>
        <p><strong>Run GitHub :</strong> {{ run.github_run_id }}</p>
        <p><strong>Commit :</strong> {{ run.commit_sha || 'inconnu' }}</p>
        <p><strong>Date :</strong> {{ formatDate(run.created_at) }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pr-detail-view {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.back-btn {
  align-self: flex-start;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
}

.back-btn:hover {
  background: var(--color-bg-hover);
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
}

.error {
  color: rgb(239, 68, 68);
}

.pr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

h2 {
  margin: 0;
  font-size: 1.375rem;
}

.github-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.875rem;
}

.github-link:hover {
  text-decoration: underline;
}

.detail-grid,
.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.detail-card,
.token-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.value {
  font-size: 1.125rem;
  font-weight: 600;
  text-transform: capitalize;
}

.value.success {
  color: rgb(16, 185, 129);
}

.value.failure {
  color: rgb(239, 68, 68);
}

.token-section h3 {
  margin: 0;
  font-size: 1rem;
}

.meta {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.meta p {
  margin: 0.35rem 0;
}
</style>
