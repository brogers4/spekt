import { createContext, useContext, useState } from 'react'

const LayoutContext = createContext(null)

export function LayoutProvider({ children }) {
  const [title, setTitle] = useState('')
  const [crumbs, setCrumbs] = useState([])
  const [back, setBack] = useState(null)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v
      localStorage.setItem('sidebar-collapsed', next)
      return next
    })
  }

  return (
    <LayoutContext.Provider value={{ title, setTitle, crumbs, setCrumbs, back, setBack, collapsed, toggleCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  return useContext(LayoutContext)
}
