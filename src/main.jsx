import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const MinecraftPortfolio = lazy(() => import('./MinecraftPortfolio.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={
        <div style={{ background: '#87CEEB', height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'monospace', fontSize: '24px' }}>
            Downloading the 3D Web...
        </div>
    }>
        <MinecraftPortfolio />
    </Suspense>
  </StrictMode>,
)