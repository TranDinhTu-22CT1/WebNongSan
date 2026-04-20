/* src/App.js */
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import Layout
import Header from './components/Layout/Header.js'; 
import Footer from './components/Layout/Footer.js';
import Chatbox from './components/UI/Chatbox.js';
import ScrollToTop from './components/UI/ScrollToTop.js';
import userRoutes from './routes.js';
import ProtectedAdminRoute from './components/ProtectedAdminRoute.js';
import { hasValidAuthSession } from './utils/authStorage.js';
import AdminLayout from '../admin/layout/layout.js';
import VendorLayout from '../vendor/layout/DefaultLayout.js';
import adminCoreStyles from '../admin/scss/style.scss?inline';
import adminExampleStyles from '../admin/scss/examples.scss?inline';
import vendorCoreStyles from '../vendor/scss/style.scss?inline';
import vendorExampleStyles from '../vendor/scss/examples.scss?inline';

const ADMIN_PATHS = [
  '/admin/panel',
  '/admin/vendor',
  '/admin/customer',
  '/admin/product',
  '/admin/payment',
  '/admin/support',
  '/admin/category',
  '/admin/sale',
  '/admin/plugin',
  '/admin/order-management',
  '/admin/shipping-management',
  '/admin/admin-profile',
  '/admin/reports-management',
  '/admin/role-management',
  '/admin/review-management',
  '/admin/notification-management',
  '/admin/logs-management',
  '/admin/change-banner',
];

const VENDOR_BASE_PATH = '/vendor';
const AUTH_REQUIRED_USER_PATHS = new Set(['/cart', '/checkout', '/messages']);


function App() {
  const location = useLocation();
  const shouldShowFloatingChatbox = location.pathname !== '/messages';

  React.useEffect(() => {
    const isAdminPath = location.pathname === '/admin' || location.pathname.startsWith('/admin/') || ADMIN_PATHS.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));
    const isVendorPath = location.pathname === VENDOR_BASE_PATH || location.pathname.startsWith(`${VENDOR_BASE_PATH}/`);
    const adminStyleId = 'admin-dynamic-style';
    const vendorStyleId = 'vendor-dynamic-style';
    const combinedAdminStyles = `${adminCoreStyles}\n${adminExampleStyles}`;
    const combinedVendorStyles = `${vendorCoreStyles}\n${vendorExampleStyles}`;

    let styleEl = document.getElementById(adminStyleId);
    let vendorStyleEl = document.getElementById(vendorStyleId);

    if (isAdminPath) {
      document.body.classList.add('admin-mode');
      document.body.classList.remove('vendor-mode');

      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = adminStyleId;
        styleEl.type = 'text/css';
        styleEl.appendChild(document.createTextNode(combinedAdminStyles));
        document.head.appendChild(styleEl);
      }

      if (vendorStyleEl) {
        vendorStyleEl.remove();
      }

      return;
    }

    if (isVendorPath) {
      document.body.classList.add('vendor-mode');
      document.body.classList.remove('admin-mode');

      if (!vendorStyleEl) {
        vendorStyleEl = document.createElement('style');
        vendorStyleEl.id = vendorStyleId;
        vendorStyleEl.type = 'text/css';
        vendorStyleEl.appendChild(document.createTextNode(combinedVendorStyles));
        document.head.appendChild(vendorStyleEl);
      }

      if (styleEl) {
        styleEl.remove();
      }

      return;
    }

    document.body.classList.remove('admin-mode');
    document.body.classList.remove('vendor-mode');

    if (styleEl) {
      styleEl.remove();
    }

    if (vendorStyleEl) {
      vendorStyleEl.remove();
    }
  }, [location.pathname]);

  return (
    <div className="App">
      <ScrollToTop />
      
      <Routes>
        <Route
          path="/admin"
          element={<ProtectedAdminRoute allowedRoles={['admin']} element={<Navigate to="/admin/panel" replace />} />}
        />

        <Route
          path="/vendor"
          element={<ProtectedAdminRoute allowedRoles={['vendor']} element={<Navigate to="/vendor/dashboard" replace />} />}
        />

        {ADMIN_PATHS.map((path) => (
          <Route
            key={path}
            path={`${path}/*`}
            element={<ProtectedAdminRoute allowedRoles={['admin']} element={<AdminLayout />} />}
          />
        ))}

        <Route
          path="/vendor/*"
          element={<ProtectedAdminRoute allowedRoles={['vendor']} element={<VendorLayout />} />}
        />

        {/* 👇 USER ROUTES - Regular Layout with Header/Footer 👇 */}
        <Route path="*" element={
          <>
            <Header />
            <div style={{ minHeight: '80vh', backgroundColor: '#f5f5f5', paddingBottom: '20px' }}>
              <Routes>
                {userRoutes.map((route) => {
                  const Component = route.element;
                  const requiresAuth = AUTH_REQUIRED_USER_PATHS.has(route.path);

                  if (!requiresAuth) {
                    return <Route key={route.path} path={route.path} element={<Component />} />;
                  }

                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        hasValidAuthSession()
                          ? <Component />
                          : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
                      }
                    />
                  );
                })}
              </Routes>
            </div>
            <Footer />
            {shouldShowFloatingChatbox ? <Chatbox /> : null}
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
