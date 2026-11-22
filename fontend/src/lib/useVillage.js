import { useEffect, useState } from 'react'
import { village } from './garden.js'

// Re-renders whenever this patient waters or cheers a neighbour (any tab).
export function useVillage() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const bump = () => setTick((t) => t + 1)
    window.addEventListener('rehabai:village', bump)
    window.addEventListener('storage', bump)
    return () => {
      window.removeEventListener('rehabai:village', bump)
      window.removeEventListener('storage', bump)
    }
  }, [])
  return village
}
