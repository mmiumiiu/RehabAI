import { useEffect, useState } from 'react'
import { displayPrefs, FONT_SCALES } from './services.js'

// Current text-size choice ('normal' | 'large' | 'xlarge') + its zoom factor.
// Re-reads on change (any tab) and when the signed-in account changes.
export function useFontScale(accountKey) {
  const [value, setValue] = useState(() => displayPrefs.fontScale())
  useEffect(() => {
    const refresh = () => setValue(displayPrefs.fontScale())
    refresh()
    window.addEventListener('rehabai:font-scale', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('rehabai:font-scale', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [accountKey])
  const scale = FONT_SCALES.find((s) => s.value === value) || FONT_SCALES[0]
  return { value, factor: scale.factor, set: displayPrefs.setFontScale }
}
