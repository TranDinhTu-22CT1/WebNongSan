import React, { Suspense } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import routes from '../routes'

const AppContent = () => {
  const location = useLocation()
  const normalizedPath = location.pathname.replace(/\/$/, '') || '/'
  const matchedRoute = routes.find((route) => route.element && route.path === normalizedPath)
  const MatchedComponent = matchedRoute?.element

  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        {MatchedComponent ? (
          <MatchedComponent />
        ) : (
          <Navigate to="/admin/panel" replace />
        )}
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
