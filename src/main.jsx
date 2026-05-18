import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WorkspaceProvider } from './context/WorkspaceContext'

// Self-hosted fonts via Fontsource (no Google Fonts network dependency)
import '@fontsource-variable/bricolage-grotesque/opsz.css'   // display — opsz+wght variable
import '@fontsource/geist/400.css'
import '@fontsource/geist/500.css'
import '@fontsource/geist/600.css'
import '@fontsource/geist/700.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'
import '@fontsource/geist-mono/600.css'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <WorkspaceProvider>
        <App />
      </WorkspaceProvider>
    </BrowserRouter>
  </StrictMode>,
)
