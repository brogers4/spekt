import { Routes, Route } from 'react-router-dom'
import { LayoutProvider } from './context/LayoutContext'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Landing from './pages/Landing'
import AllProjects from './pages/AllProjects'
import NewProject from './pages/NewProject'
import Project from './pages/Project'
import ProjectSettings from './pages/ProjectSettings'
import ProjectContext from './pages/ProjectContext'
import ContextNote from './pages/ContextNote'
import Settings from './pages/Settings'
import ArtifactView from './pages/ArtifactView'

export default function App() {
  return (
    <LayoutProvider>
      <div className="flex h-screen bg-canvas text-fg-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/projects" element={<AllProjects />} />
              <Route path="/new-project" element={<NewProject />} />
              <Route path="/project/:slug" element={<Project />} />
              <Route path="/project/:slug/settings" element={<ProjectSettings />} />
              <Route path="/project/:slug/context" element={<ProjectContext />} />
              <Route path="/project/:slug/context/:filename" element={<ContextNote />} />
              <Route path="/project/:slug/artifact/:key" element={<ArtifactView />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </LayoutProvider>
  )
}
