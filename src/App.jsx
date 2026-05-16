import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import NewProject from './pages/NewProject'
import Project from './pages/Project'
import ProjectSettings from './pages/ProjectSettings'
import ProjectContext from './pages/ProjectContext'
import ContextNote from './pages/ContextNote'
import Settings from './pages/Settings'
import ArtifactView from './pages/ArtifactView'

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
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
  )
}
