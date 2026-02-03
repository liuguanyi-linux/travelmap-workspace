import MainLayout from './components/MainLayout';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <MainLayout />
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
