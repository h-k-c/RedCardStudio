import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { CardStyle } from '@/types/styles'

export const usePreferencesStore = defineStore('preferences', () => {
  const lastUsedStyle = ref<CardStyle>(
    (localStorage.getItem('pref_style') as CardStyle) || 'magazine'
  )
  const lastAuthor = ref(localStorage.getItem('pref_author') || '你的账号名')

  watch(lastUsedStyle, (v) => localStorage.setItem('pref_style', v))
  watch(lastAuthor, (v) => localStorage.setItem('pref_author', v))

  return { lastUsedStyle, lastAuthor }
})
