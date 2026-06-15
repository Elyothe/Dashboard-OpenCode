<script setup lang="ts">
import { computed } from 'vue'
import type { ReviewRun } from '@/composables/useMetrics'

const props = defineProps<{
  runs: ReviewRun[]
}>()

const sortedRuns = computed(() =>
  [...props.runs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR')
}

function formatTokens(run: ReviewRun) {
  const total = run.token_usage?.[0]?.total_tokens
  return total ? total.toLocaleString('fr-FR') : '-'
}
</script>

<template>
  <div class="runs-table-wrapper">
    <table class="runs-table">
      <thead>
        <tr>
          <th>PR</th>
          <th>Titre</th>
          <th>Statut</th>
          <th>Durée</th>
          <th>Coût</th>
          <th>Tokens</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="run in sortedRuns"
          :key="run.id"
          @click="$router.push(`/pr/${run.pr_number}`)"
          class="clickable"
        >
          <td>#{{ run.pr_number }}</td>
          <td>{{ run.pr_title || 'Sans titre' }}</td>
          <td>
            <span :class="['badge', run.status === 'success' ? 'success' : 'failure']">
              {{ run.status }}
            </span>
          </td>
          <td>{{ run.duration_seconds }}s</td>
          <td>${{ run.estimated_cost_usd.toFixed(4) }}</td>
          <td>{{ formatTokens(run) }}</td>
          <td>{{ formatDate(run.created_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.runs-table-wrapper {
  overflow-x: auto;
}

.runs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

th {
  color: var(--color-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.025em;
}

tr.clickable {
  cursor: pointer;
  transition: background 0.15s;
}

tr.clickable:hover {
  background: var(--color-bg-hover);
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge.success {
  background: rgba(16, 185, 129, 0.15);
  color: rgb(16, 185, 129);
}

.badge.failure {
  background: rgba(239, 68, 68, 0.15);
  color: rgb(239, 68, 68);
}
</style>
