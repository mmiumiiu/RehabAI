import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, demoData } from '../lib/services.js'
import { BIG_EXERCISES } from '../lib/mockData.js'

// Demo seeding lives here because this is the one place that can see both the
// service layer and mockData without creating an import cycle.
const bigIds = () => BIG_EXERCISES.map((e) => e.id)

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.current())

  // Already signed in as the demo account (page reload) — make sure the
  // presentation data is there. No-op when it already has history.
  useEffect(() => {
    if (user?.email) demoData.seed({ bigIds: bigIds() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email])

  const value = useMemo(
    () => ({
      user,
      async signIn(args) {
        const u = await auth.signIn(args)
        setUser(u)
        await demoData.seed({ bigIds: bigIds() })
        return u
      },
      async register(args) {
        const u = await auth.register(args)
        setUser(u)
        return u
      },
      async signOut() {
        await auth.signOut()
        setUser(null)
      },
      updateUser(patch) {
        setUser(auth.update(patch))
      },
      // Profile → "รีเซ็ตข้อมูลตัวอย่าง"
      resetDemoData() {
        return demoData.reset({ bigIds: bigIds() })
      },
      isDemoAccount: () => demoData.isDemoAccount(),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
