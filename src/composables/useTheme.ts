import { useSettingsStore } from '@/stores/settings.store'

export function useTheme() {
  const settingsStore = useSettingsStore()

  return {
    theme: settingsStore.theme,
    toggleTheme: settingsStore.toggleTheme,
  }
}
