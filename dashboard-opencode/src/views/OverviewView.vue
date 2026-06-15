<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useMetrics } from '@/composables/useMetrics'
import KpiCard from '@/components/KpiCard.vue'
import TokenChart from '@/components/TokenChart.vue'
import CostChart from '@/components/CostChart.vue'
import EnergyChart from '@/components/EnergyChart.vue'
import RunsTable from '@/components/RunsTable.vue'

const {
  runs,
  loading,
  error,
  totalRuns,
  totalCost,
  totalTokens,
  totalEnergy,
  groupByDay,
  fetchRuns,
} = useMetrics()

const tokensByDay = computed(() => groupByDay('total_tokens'))
const costByDay = computed(() => groupByDay('estimated_cost_usd'))
const energyByDay = computed(() => groupByDay('estimated_energy_kwh'))

onMounted(() => {
  fetchRuns()
})
</script>

<template>
  <div class="overview-view">
    <div v-if="loading && runs.length === 0" class="loading">
      Chargement des métriques...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <template v-else>
      <div class="kpi-grid">
        <KpiCard
          title="Runs"
          :value="totalRuns.toString()"
          subtitle="analyses de PR"
        />
        <KpiCard
          title="Coût total"
          :value="`$${totalCost.toFixed(4)}`"
          subtitle="runners GitHub Actions"
        />
        <KpiCard
          title="Tokens"
          :value="totalTokens.toLocaleString('fr-FR')"
          subtitle="tokens consommés"
        />
        <KpiCard
          title="Énergie"
          :value="`${totalEnergy.toFixed(6)} kWh`"
          subtitle="estimation"
        />
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <TokenChart :data="tokensByDay" />
        </div>
        <div class="chart-card">
          <CostChart :data="costByDay" />
        </div>
      </div>

      <div class="chart-card energy">
        <EnergyChart :data="energyByDay" />
      </div>

      <div class="table-section">
        <h2>Dernières analyses</h2>
        <RunsTable :runs="runs" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.overview-view {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}

.chart-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1rem;
}

.chart-card.energy {
  max-width: 50%;
}

.table-section h2 {
  margin: 0 0 0.75rem 0;
  font-size: 1.125rem;
}

@media (max-width: 768px) {
  .chart-card.energy {
    max-width: 100%;
  }
}
</style>
