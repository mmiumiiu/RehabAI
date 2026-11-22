import { useEffect, useState } from 'react'
import { garden } from './garden.js'

// Live garden stats for the signed-in patient. Re-reads when a tree is planted
// (this tab), from another tab, or on focus.
export function useGarden() {
  const [stats, setStats] = useState(() => garden.stats())
  useEffect(() => {
    const refresh = () => setStats(garden.stats())
    window.addEventListener('rehabai:garden', refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('rehabai:garden', refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])
  return stats
}
