import { lazy, Suspense } from 'react'
import LandingPage from '@/pages/LandingPage'
import { useHashRoute } from '@/hooks/useHashRoute'
import { BG } from '@/constants/theme'

// The web app is loaded only when someone opens "#/app",
// so the landing page bundle stays small.
const WebApp = lazy(() => import('@/web/WebApp'))

export default function App() {
  const route = useHashRoute()

  if (route === '/app') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: BG }} />}>
        <WebApp />
      </Suspense>
    )
  }

  return <LandingPage />
}
