import { createContext, useContext, useEffect, useState } from 'react'
import { listProjects } from '../lib/fs'

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProjects().then((p) => {
      setProjects(p)
      setLoading(false)
    })
  }, [])

  async function refreshProjects() {
    const updated = await listProjects()
    setProjects(updated)
  }

  return (
    <WorkspaceContext.Provider value={{ projects, loading, refreshProjects }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
