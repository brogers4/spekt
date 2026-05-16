import { createContext, useContext, useEffect, useState } from 'react'
import { getWorkspaceHandle, listProjects, pickWorkspace } from '../lib/fs'

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {
  const [handle, setHandle] = useState(undefined) // undefined = loading, null = none
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWorkspaceHandle().then((h) => {
      setHandle(h ?? null)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!handle) {
      setProjects([])
      return
    }
    listProjects(handle).then(setProjects)
  }, [handle])

  async function chooseWorkspace() {
    const h = await pickWorkspace()
    setHandle(h)
  }

  async function refreshProjects() {
    if (!handle) return
    const updated = await listProjects(handle)
    setProjects(updated)
  }

  return (
    <WorkspaceContext.Provider value={{ handle, projects, loading, chooseWorkspace, refreshProjects }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
