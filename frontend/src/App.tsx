import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { AppSettingsProvider } from './contexts/AppSettingsContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdDetail from './pages/AdDetail';
import EnterpriseDetail from './pages/EnterpriseDetail';
import GuideDetail from './pages/GuideDetail';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppSettingsProvider>
          <LanguageProvider>
            <ThemeProvider>
              <FavoritesProvider>
                <Toaster position="top-center" />
                <Routes>
                  <Route path="/" element={<MainLayout />} />
                  <Route path="/ad/:id" element={<AdDetail />} />
                  <Route path="/enterprise/:id" element={<EnterpriseDetail />} />
                  <Route path="/guide/:id" element={<GuideDetail />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                </Routes>
              </FavoritesProvider>
            </ThemeProvider>
          </LanguageProvider>
          </AppSettingsProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
