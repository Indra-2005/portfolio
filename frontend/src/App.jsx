import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RootLayout } from './layouts/RootLayout';
import { LoadingState } from './components/LoadingState';

// Route-level code splitting for enhanced performance
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function RouteLoadingFallback() {
  return (
    <div className="py-16 flex items-center justify-center">
      <LoadingState message="Loading page content..." />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<RootLayout />}>
                {/* Public Routes */}
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:slug" element={<ProjectDetailPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin Routes */}
                <Route path="admin" element={<ProtectedRoute />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="projects" element={<AdminProjectsPage />} />
                  <Route path="messages" element={<AdminMessagesPage />} />
                </Route>

                {/* Catch-all 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
