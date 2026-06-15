import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

export interface ReviewRun {
  id: string
  repo_name: string
  pr_number: number
  pr_title: string | null
  pr_author: string | null
  github_run_id: number
  status: string
  duration_seconds: number
  runner_os: string
  estimated_cost_usd: number
  estimated_energy_kwh: number
  commit_sha: string | null
  created_at: string
  token_usage?: TokenUsage[]
  
}

export interface TokenUsage {
  id: string
  run_id: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  estimated_remaining: number
  created_at: string
}

export function useMetrics() {
  const runs = ref<ReviewRun[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalRuns = computed(() => runs.value.length)
  const totalCost = computed(() =>
    runs.value.reduce((sum, run) => sum + (run.estimated_cost_usd || 0), 0)
  )
  const totalTokens = computed(() =>
    runs.value.reduce(
      (sum, run) => sum + (run.token_usage?.[0]?.total_tokens || 0),
      0
    )
  )
  const totalEnergy = computed(() =>
    runs.value.reduce((sum, run) => sum + (run.estimated_energy_kwh || 0), 0)
  )

  async function fetchRuns(limit: number = 100) {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('review_runs')
        .select('*, token_usage(*)')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (supabaseError) throw supabaseError

      runs.value = data || []
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch metrics'
    } finally {
      loading.value = false
    }
  }

  async function fetchRunByPR(prNumber: number): Promise<ReviewRun | null> {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('review_runs')
        .select('*, token_usage(*)')
        .eq('pr_number', prNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (supabaseError) throw supabaseError

      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch PR metrics'
      return null
    } finally {
      loading.value = false
    }
  }

  function groupByDay(
    key: 'total_tokens' | 'estimated_cost_usd' | 'estimated_energy_kwh'
  ) {
    const map = new Map<string, number>()

    for (const run of runs.value) {
      const date = new Date(run.created_at).toLocaleDateString('fr-FR')
      const value =
        key === 'total_tokens'
          ? run.token_usage?.[0]?.total_tokens || 0
          : (run as any)[key] || 0
      map.set(date, (map.get(date) || 0) + value)
    }

    return Array.from(map.entries()).map(([date, value]) => ({ date, value }))
  }

  return {
    runs,
    loading,
    error,
    totalRuns,
    totalCost,
    totalTokens,
    totalEnergy,
    fetchRuns,
    fetchRunByPR,
    groupByDay,
  }
}
