import { useEffect, useState } from 'react'

// Reads the current route from the URL hash.
// "#/app" -> "/app", "#/" or no hash -> "/".
// Plain "#section" anchors are not routes, so they count as the landing page.
function readRoute() {
  const raw = window.location.hash.replace(/^#/, '')
  return raw.startsWith('/') ? raw : '/'
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}