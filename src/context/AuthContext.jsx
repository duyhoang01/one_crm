import { createContext, useContext, useState } from 'react'

const DEMO_USERS = [
  { email: 'sales.a@cmc.vn', password: 'demo123', name: 'Sales A', role: 'Sales', initials: 'SA', avatarBg: '#0268C5' },
  { email: 'sales.b@cmc.vn', password: 'demo123', name: 'Sales B', role: 'Sales', initials: 'SB', avatarBg: '#0268C5' },
  { email: 'manager@cmc.vn', password: 'demo123', name: 'Nguyễn Manager', role: 'Manager', initials: 'MG', avatarBg: '#7C3AED' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  function login(email, password) {
    const found = DEMO_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    )
    if (!found) return false
    setUser(found)
    return true
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
