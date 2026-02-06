import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <FavoritesProvider>
                <Routes>
                  <Route path="/" element={<MainLayout />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Routes>
              </FavoritesProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
