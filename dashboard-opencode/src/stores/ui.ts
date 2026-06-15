import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', () => {
  const selectedRepo = ref<string | null>(null)

  const hasSelection = computed(() => !!selectedRepo.value)

  function selectRepo(repo: string | null) {
    selectedRepo.value = repo
  }

  return {
    selectedRepo,
    hasSelection,
    selectRepo,
  }
})
