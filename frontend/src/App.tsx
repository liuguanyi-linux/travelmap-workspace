import MainLayout from './components/MainLayout';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <FavoritesProvider>
        <MainLayout />
      </FavoritesProvider>
    </LanguageProvider>
  );
}

export default App;
