import { useEffect, useState } from 'react'
import { loudResults } from './services.js'

// Live view of the patient's stored LSVT LOUD results (loudness % + word/hold %
// per session). Re-reads when a new result is saved, cross-tab, or on focus.
export function useLoudResults() {
  const [rows, setRows] = useState(() => loudResults.getAll())
  useEffect(() => {
    const refresh = () => setRows(loudResults.getAll())
    window.addEventListener('rehabai:loud-results', refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('rehabai:loud-results', refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])
  return rows
}
