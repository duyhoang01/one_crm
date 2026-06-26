import { createContext, useContext, useState, useCallback } from 'react'
import { initialCustomers } from '@/data/customers'

const CustomerContext = createContext(null)

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState(initialCustomers)

  const addCustomer = useCallback((data) => {
    const now = new Date()
    const newCustomer = {
      ...data,
      id: `cust-${Date.now()}`,
      deletedAt: null,
      createdAt: now.toLocaleDateString('vi-VN'),
      subs: [],
      contracts: [],
      timeline: [],
      audit: [],
    }
    setCustomers((prev) => [...prev, newCustomer])
    return newCustomer
  }, [])

  const updateCustomer = useCallback((id, data) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const deleteCustomer = useCallback((id) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c))
    )
  }, [])

  const getParentOptions = useCallback(
    (excludeId = null) =>
      customers.filter(
        (c) =>
          !c.deletedAt &&
          (c.type === 'B2B' || c.type === 'Reseller') &&
          c.id !== excludeId
      ),
    [customers]
  )

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, getParentOptions }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomers() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomers must be used inside CustomerProvider')
  return ctx
}
