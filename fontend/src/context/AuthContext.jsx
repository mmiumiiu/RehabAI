import { createContext, useContext, useMemo, useState } from 'react'
import { auth } from '../lib/services.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.current())

  const value = useMemo(
    () => ({
      user,
      async signIn(args) {
        const u = await auth.signIn(args)
        setUser(u)
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
