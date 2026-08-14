import { useEffect, useState } from 'react'
import { loudPhrases } from './services.js'
import { getLoudSteps } from './mockData.js'

// Live LSVT LOUD steps for the patient. Pulls the therapist-curated phrases from
// the backend on mount and polls periodically, so phrases the therapist adds
// appear on the patient side within a few seconds — no reload, works across
// devices. Also re-reads on the local change event / cross-tab / focus.
export function useLoudSteps() {
  const [steps, setSteps] = useState(() => getLoudSteps())

  useEffect(() => {
    let alive = true
    const refresh = () => { if (alive) setSteps(getLoudSteps()) }

    loudPhrases.pull().then(refresh)              // initial fetch
    const poll = setInterval(() => loudPhrases.pull().then(refresh), 8000)

    window.addEventListener('rehabai:loud-phrases', refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      alive = false
      clearInterval(poll)
      window.removeEventListener('rehabai:loud-phrases', refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  return steps
}
