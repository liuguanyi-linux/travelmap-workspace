import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import MapContainer from './MapContainer';
import LoginModal from './LoginModal';
import LocationModal from './LocationModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import BottomTabBar from './mobile/BottomTabBar';
import CityDrawer from './mobile/CityDrawer';
import UserDrawer from './mobile/UserDrawer';
import EnterpriseView from './mobile/EnterpriseView';
import GuideView from './mobile/GuideView';
import FloatingSearchBar from './mobile/FloatingSearchBar';
import AdsWidget from './mobile/AdsWidget';
import AtmWidget from './mobile/AtmWidget';
import PoiDetailBottomSheet from './mobile/PoiDetailBottomSheet';
import MapToggle from './mobile/MapToggle';
import SearchResultsDrawer, { SearchResultItem } from './mobile/SearchResultsDrawer';
import GlobalViewButton from './mobile/GlobalViewButton';
// import TopNavBar from './mobile/TopNavBar'; // Deprecated
// import FilterBar from './mobile/FilterBar'; // Deprecated
// import BottomSpotList from './mobile/BottomSpotList'; // Deprecated
import { DEFAULT_CITY } from '../config/cityConfig';
import { toast } from 'sonner';

export default function MainLayout() {
  // Map State
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [aMap, setAMap] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  // Base map markers (unfiltered by category, but filtered by city/search)
  const [baseMapMarkers, setBaseMapMarkers] = useState<any[]>([]);
  // ATM markers (temporary overlay)
  const [atmMarkers, setAtmMarkers] = useState<any[]>([]);
  
  const [selectedPoi, setSelectedPoi] = useState<any>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState(''); // 'strategy', 'guide', 'me', '' (for home/map view)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isSearchListOpen, setIsSearchListOpen] = useState(false);
  const [activeCity, setActiveCity] = useState(DEFAULT_CITY.name); 
  const [activeCategory, setActiveCategory] = useState(''); // 'spot', 'dining', etc.
  const [searchKeyword, setSearchKeyword] = useState('');
  const [unifiedSearchResults, setUnifiedSearchResults] = useState<SearchResultItem[]>([]);
  const [isAtmActive, setIsAtmActive] = useState(false);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [focusedSpotId, setFocusedSpotId] = useState<string | number | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { spots = [], spotCategories = [], cities = [], guides = [], strategies = [] } = useData();
  const { favorites } = useFavorites();
  
  // Close bottom sheet when tab changes to avoid conflicts
  useEffect(() => {
    if (isBottomSheetOpen) {
        setIsBottomSheetOpen(false);
    }
  }, [activeTab]);

  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const hasPromptedRef = useRef(false);
  const hasInitializedViewMode = useRef(false);

  // Initial View Mode Logic
  // useEffect(() => {
  //     if (!hasInitializedViewMode.current && favorites.length > 0) {
  //         setViewMode('favorites');
  //         hasInitializedViewMode.current = true;
  //     }
  // }, [favorites]);

  // Handle View Mode Toggle
  const handleViewModeChange = (mode: 'all' | 'favorites') => {
      // If switching to favorites and no favorites exist, warn and revert
      if (mode === 'favorites' && favorites.length === 0) {
          toast.error(t('mapToggle.noFavorites'));
          setViewMode('all');
          return;
      }
      setViewMode(mode);
  };

  // Sync viewMode when favorites change
  useEffect(() => {
    // If we are in favorites mode but favorites become empty (e.g., user removed the last one),
    // revert to 'all' mode automatically.
    if (viewMode === 'favorites' && favorites.length === 0) {
        // toast.info(t('mapToggle.noFavorites')); // Optional: notify user
        setViewMode('all');
    }
  }, [favorites, viewMode]);

  // Refs
  const routePluginRef = useRef<any>(null);
  const searchRequestId = useRef(0);

  // State for deep linking into drawers
  const [guideInitialCategory, setGuideInitialCategory] = useState<string | undefined>(undefined);
  const [enterpriseInitialId, setEnterpriseInitialId] = useState<string | undefined>(undefined);

  const [spotInitialId, setSpotInitialId] = useState<string | undefined>(undefined);
  const [guideInitialId, setGuideInitialId] = useState<string | undefined>(undefined);

  // URL parameter deep linking (e.g. ?open=enterprise&id=123, ?open=spot&id=456)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openTab = params.get('open');
    const openId = params.get('id');
    if (!openTab || !openId) return;
    // Clean URL without reload
    window.history.replaceState({}, '', window.location.pathname);

    if (openTab === 'enterprise') {
      setActiveTab('enterprise');
      setEnterpriseInitialId(openId);
    } else if (openTab === 'spot') {
      setSpotInitialId(openId);
    } else if (openTab === 'guide') {
      setActiveTab('guide');
      setGuideInitialId(openId);
    } else if (openTab === 'strategy') {
      setActiveTab('strategy');
    } else if (openTab === 'ad') {
      setActiveTab('guide');
      setGuideInitialCategory('ad');
      setGuideInitialId(openId);
    }
  }, []);

  useEffect(() => {
    const handleNavigate = (e: any) => {
      const { tab, category } = e.detail;
      if (tab) {
          setActiveTab(tab);
          if (tab === 'guide' && category) {
              setGuideInitialCategory(category);
              // Reset after a short delay so it doesn't stick
              setTimeout(() => setGuideInitialCategory(undefined), 500);
          }
      }
    };
    window.addEventListener('navigate-to-tab', handleNavigate);
    return () => window.removeEventListener('navigate-to-tab', handleNavigate);
  }, []);

  // --- Core Logic: Filtering Spots ---
  // Filter spots based on Active City AND Active Category
  // This result drives both the Map Markers and the Bottom Carousel
  useEffect(() => {
    if (!spots) return;

    // 0. Filter by active status (Global Filter)
    let filtered = spots.filter(item => item.isActive !== false);

    // 0.5 Filter by View Mode (Global Filter)
    if (viewMode === 'favorites') {
        const favoriteIds = new Set(favorites.map(f => String(f.id)));
        filtered = filtered.filter(s => favoriteIds.has(String(s.id)));
    } else {
        // 1. Filter by City (only in 'all' mode)
        if (activeCity) {
          filtered = filtered.filter(s => !s.city || s.city.includes(activeCity));
        }
    }

    // 2. Filter by Category
    if (activeCategory) {
       // Only filter for Search Results (List View), NOT for Map Markers
       // The user wants map to always show all spots in the city
       
       // Calculate filtered list for drawer
       const listFiltered = filtered.filter(s => {
          if (!s.tags || !Array.isArray(s.tags)) return false;
          
          if (activeCategory === 'transport') {
              return s.tags.includes('rail') || s.tags.includes('airport') || s.tags.includes('transport');
          }
          
          if (activeCategory === 'spot') {
              // Exclude other major categories to define 'spot'
              const otherCategories = ['dining', 'accommodation', 'shopping', 'transport', 'rail', 'airport'];
              const hasOtherTag = s.tags.some((tag: string) => otherCategories.includes(tag));
              return s.tags.includes('spot') || !hasOtherTag;
          }
          
          return s.tags.includes(activeCategory);
       });
       
       // Apply Keyword Filter to List
       let finalSearchResults = listFiltered;
       if (searchKeyword) {
            const lowerKw = searchKeyword.toLowerCase();
            finalSearchResults = listFiltered.filter(s => 
                (s.name && s.name.toLowerCase().includes(lowerKw)) || 
                (s.intro && s.intro.toLowerCase().includes(lowerKw)) || 
                (s.address && s.address.toLowerCase().includes(lowerKw)) ||
                (s.tags && Array.isArray(s.tags) && s.tags.some((t: string) => t.toLowerCase().includes(lowerKw)))
            );
       }

       // Map spots to display format for List
       const mappedListSpots = finalSearchResults.map(s => ({
            ...s,
            type: s.tags ? s.tags.join(';') : 'spot',
            address: s.address || '',
            biz_ext: { rating: 5.0 },
            photos: (s.photos || []).map(url => ({ url }))
       }));
       setSearchResults(mappedListSpots);

       // For Map Markers: Use 'filtered' (City filtered only) 
       // AND apply Search Keyword if present (usually search should filter map too, but category should not)
       
       let mapFiltered = filtered;
       if (searchKeyword) {
            const lowerKw = searchKeyword.toLowerCase();
            mapFiltered = filtered.filter(s => 
                (s.name && s.name.toLowerCase().includes(lowerKw)) || 
                (s.intro && s.intro.toLowerCase().includes(lowerKw)) || 
                (s.address && s.address.toLowerCase().includes(lowerKw)) ||
                (s.tags && Array.isArray(s.tags) && s.tags.some((t: string) => t.toLowerCase().includes(lowerKw)))
            );
       }

       const mappedMapSpots = mapFiltered.map(s => ({
            ...s,
            type: s.tags ? s.tags.join(';') : 'spot',
            address: s.address || '',
            biz_ext: { rating: 5.0 },
            photos: (s.photos || []).map(url => ({ url }))
       }));
       // Store base markers (without ATMs)
       setBaseMapMarkers(mappedMapSpots);

    } else {
        // No category selected (e.g. initial load or cleared)
        // Apply Search Keyword
        let finalFiltered = filtered;
        if (searchKeyword) {
            const lowerKw = searchKeyword.toLowerCase();
            finalFiltered = filtered.filter(s => 
                (s.name && s.name.toLowerCase().includes(lowerKw)) || 
                (s.intro && s.intro.toLowerCase().includes(lowerKw)) || 
                (s.address && s.address.toLowerCase().includes(lowerKw)) ||
                (s.tags && Array.isArray(s.tags) && s.tags.some((t: string) => t.toLowerCase().includes(lowerKw)))
            );
        }

        const mappedSpots = finalFiltered.map(s => ({
            ...s,
            type: s.tags ? s.tags.join(';') : 'spot',
            address: s.address || '',
            biz_ext: { rating: 5.0 },
            photos: (s.photos || []).map(url => ({ url }))
        }));

        setSearchResults(mappedSpots);
        setBaseMapMarkers(mappedSpots);
    }
    
    // Auto-fit logic ...
  }, [spots, activeCity, activeCategory, searchKeyword, mapInstance, aMap, viewMode, favorites]); // Added viewMode and favorites

  // --- Combine Base Markers and ATM Markers ---
  useEffect(() => {
      setMapMarkers([...baseMapMarkers, ...atmMarkers]);
  }, [baseMapMarkers, atmMarkers]);

  // --- Unified Search Results (spots + guides + strategies) ---
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setUnifiedSearchResults([]);
      return;
    }
    const kw = searchKeyword.toLowerCase();

    // 城市中文名 → 韩文名映射（从后台 cities 数据）
    const cityKoMap: Record<string, string> = {};
    cities.forEach((c: any) => { if (c.name && c.nameKo) cityKoMap[c.name] = c.nameKo; });
    const getCityKo = (name: string) => cityKoMap[name] || name;

    const spotResults: SearchResultItem[] = spots
      .filter(s => s.isActive !== false)
      .filter(s =>
        (s.name && s.name.toLowerCase().includes(kw)) ||
        (s.intro && s.intro.toLowerCase().includes(kw)) ||
        (s.address && s.address.toLowerCase().includes(kw)) ||
        (s.tags && s.tags.some((t: string) => t.toLowerCase().includes(kw)))
      )
      .map(s => ({
        id: s.id,
        type: 'spot' as const,
        name: s.name,
        description: s.intro || s.content || '',
        imageUrl: s.photos?.[0] || '',
        city: s.city ? getCityKo(s.city) : '',
      }));

    const guideResults: SearchResultItem[] = guides
      .filter(g =>
        (g.name && g.name.toLowerCase().includes(kw)) ||
        (g.intro && g.intro.toLowerCase().includes(kw)) ||
        (g.title && g.title.toLowerCase().includes(kw)) ||
        (g.cities && g.cities.some((c: string) => c.toLowerCase().includes(kw)))
      )
      .map(g => ({
        id: g.id,
        type: 'guide' as const,
        name: g.name,
        description: g.intro || g.title || '',
        imageUrl: g.avatar || '',
        city: (g.cities || []).map((c: string) => getCityKo(c)).join('·'),
      }));

    const strategyResults: SearchResultItem[] = strategies
      .filter(s =>
        (s.title && s.title.toLowerCase().includes(kw)) ||
        (s.category && s.category.toLowerCase().includes(kw)) ||
        (s.tags && s.tags.some((t: string) => t.toLowerCase().includes(kw))) ||
        (s.spots && s.spots.some((sp: string) => sp.toLowerCase().includes(kw)))
      )
      .map(s => ({
        id: s.id,
        type: 'strategy' as const,
        name: s.title,
        description: s.category || (s.tags || []).join('·'),
        imageUrl: s.image || '',
        city: s.city ? getCityKo(s.city) : '',
      }));

    setUnifiedSearchResults([...spotResults, ...guideResults, ...strategyResults]);
  }, [searchKeyword, spots, guides, strategies]);

  // --- ATM Search Logic ---
  useEffect(() => {
      if (!mapInstance || !aMap) return;

      if (isAtmActive) {
          // Trigger AMap PlaceSearch for ATMs near center
          const center = mapInstance.getCenter();
          
          aMap.plugin(["AMap.PlaceSearch"], function() {
              const placeSearch = new aMap.PlaceSearch({
                  type: 'ATM|银行|自动提款机',
                  pageSize: 20,
                  pageIndex: 1,
                  extensions: 'base',
                  city: activeCity || '全国', // Restrict to city if possible
                  map: null // Don't auto-add to map, we want to control markers
              });
              
              placeSearch.searchNearBy('', center, 2000, (status: any, result: any) => {
                  if (status === 'complete' && result.info === 'OK') {
                      const pois = result.poiList.pois;
                      const newAtmMarkers = pois.map((p: any) => ({
                          id: p.id,
                          name: p.name,
                          location: { lng: p.location.lng, lat: p.location.lat },
                          address: p.address,
                          type: 'atm;bank', // Tag it so map renderer uses ATM icon
                          tags: ['atm', 'bank'],
                          photos: [],
                          biz_ext: { rating: 4.5 }
                      }));
                      
                      setAtmMarkers(newAtmMarkers);
                  } else {
                      console.log('ATM Search failed or no results:', status, result);
                      setAtmMarkers([]);
                  }
              });
          });
      } else {
          // Clear ATM markers
          setAtmMarkers([]);
      }
  }, [isAtmActive, mapInstance, aMap, activeCity]); // Removed searchResults dependency


  // Initialize with all spots when data is loaded
  useEffect(() => {
    // Check if activeCity is valid (exists in available cities)
    if (cities && cities.length > 0) {
        const isCityValid = cities.some(c => c.name === activeCity);
        if (!isCityValid) {
            console.log(`[MainLayout] Active city "${activeCity}" not found in available cities. Switching to "${cities[0].name}".`);
            setActiveCity(cities[0].name);
        }
    }
  }, [cities, activeCity]);

  const handleMapReady = (map: any, AMap: any) => {
    setMapInstance(map);
    setAMap(AMap);
  };

  const handleLocationAllow = () => {
      // ... (Existing location logic kept if needed, though user removed search bar which had location button)
      // Keeping implementation for modal callback compatibility
      setIsLocationPromptOpen(false);
  };

  const handleLocationDeny = () => {
      setIsLocationPromptOpen(false);
  };

  // Handle when a spot is focused in the Bottom Carousel
  const handleSpotFocus = (spot: any) => {
    setFocusedSpotId(spot.id);
    
    if (mapInstance && spot.location) {
        // Pan to spot
        mapInstance.panTo([spot.location.lng, spot.location.lat]);
        setSelectedPoi(spot);
    }
  };

  const handleMarkerClick = (poi: any) => {
    setSelectedPoi(poi);
    setFocusedSpotId(poi.id); // Sync carousel to marker
    setIsBottomSheetOpen(true); // Open full details
  };

  // Deep link: auto-open spot by URL param
  useEffect(() => {
    if (spotInitialId && spots && spots.length > 0) {
      const spot = spots.find(s => String(s.id) === String(spotInitialId));
      if (spot) {
        handleMarkerClick({ ...spot, photos: (spot.photos || []).map((url: string) => ({ url })) });
      }
      setSpotInitialId(undefined);
    }
  }, [spotInitialId, spots]);

  const handleCitySelect = (city: any) => {
    setActiveCity(city.name);
    // Map will update via useEffect
    if (mapInstance) {
        mapInstance.setZoomAndCenter(city.zoom || 12, city.center || [120.38, 36.06]);
    }
  };

  const handleMapClick = () => {
    setSelectedPoi(null);
    setFocusedSpotId(null);
    setIsBottomSheetOpen(false);
  };

  const handleGlobalView = () => {
    if (mapInstance) {
      mapInstance.setZoomAndCenter(DEFAULT_CITY.zoom, DEFAULT_CITY.center);
      setActiveTab(''); 
      setIsBottomSheetOpen(false);
      setActiveCity(DEFAULT_CITY.name);
      setActiveCategory(''); // Clear category
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          onMapReady={handleMapReady}
          markers={mapMarkers}
          selectedPoi={selectedPoi} // Highlights the marker
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          disableFitView={false}
        />
      </div>

      {/* Floating Search Bar (Top) */}
      <FloatingSearchBar 
        onSearch={(kw) => {
            console.log('Search:', kw);
            setSearchKeyword(kw);
        }}
        onCategorySelect={setActiveCategory}
        // MapToggle moved to UserDrawer -> Favorites
        // rightAction removed
      />

      {/* Widgets Layer - Highest Z-Index (except Portals/Overlays) */}
      {!isBottomSheetOpen && (
        <>
          <div className={`fixed top-[90px] right-4 z-[10002] transition-all duration-300 ${activeTab !== '' ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible pointer-events-auto'}`}>
             <AdsWidget isOpen={isAdOpen} onOpenChange={setIsAdOpen} />
          </div>
          
          <div className={`fixed top-[205px] right-4 z-[10002] transition-all duration-300 ${activeTab !== '' ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible pointer-events-auto'}`}>
             <AtmWidget onSelect={() => setIsAtmActive(!isAtmActive)} isActive={isAtmActive} />
          </div>
        </>
      )}

      {/* Map View Toggle - Moved to FloatingSearchBar */}
      
      {/* Global View Button - Repositioned */}
      <div className="absolute top-[265px] right-4 z-30">
        <GlobalViewButton onClick={handleGlobalView} />
      </div>
      {/* Unified Search Results Drawer */}
      <SearchResultsDrawer
        isVisible={!!searchKeyword.trim() && unifiedSearchResults.length >= 0}
        results={unifiedSearchResults}
        keyword={searchKeyword}
        onClose={() => setSearchKeyword('')}
        onItemClick={(item) => {
          if (item.type === 'guide') {
            setActiveTab('guide');
          } else if (item.type === 'strategy') {
            setActiveTab('strategy');
          } else {
            const spot = spots.find(s => String(s.id) === String(item.id));
            if (spot) handleMarkerClick({ ...spot, photos: (spot.photos || []).map(url => ({ url })) });
          }
          setSearchKeyword('');
        }}
      />

      <CityDrawer
        isVisible={activeTab === 'city'}
        onSelectCategory={setActiveCategory}
        onSelectCity={handleCitySelect}
        searchResults={searchResults}
        onPoiClick={handleMarkerClick}
        activeCityName={activeCity}
        onClose={() => setActiveTab('')}
      />

      <EnterpriseView
        isVisible={activeTab === 'enterprise'}
        onClose={() => setActiveTab('')}
        activeCity={activeCity}
        initialId={enterpriseInitialId}
        onInitialIdConsumed={() => setEnterpriseInitialId(undefined)}
        onOpenGuide={(id) => {
          setActiveTab('guide');
          setGuideInitialId(id);
        }}
      />

      <GuideView
        isVisible={activeTab === 'guide'}
        onClose={() => setActiveTab('')}
        activeCity={activeCity}
        initialCategory={guideInitialCategory}
        initialId={guideInitialId}
        onInitialIdConsumed={() => setGuideInitialId(undefined)}
        onLightboxChange={setIsLightboxOpen}
        searchKeyword={searchKeyword}
      />

      <UserDrawer 
        isVisible={activeTab === 'me'}
        onClose={() => setActiveTab('')}
        onPoiClick={handleMarkerClick}
      />

      {/* POI Detail Bottom Sheet (Full View) */}
      <PoiDetailBottomSheet 
        poi={selectedPoi}
        isOpen={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setSelectedPoi(null);
          setFocusedSpotId(null);
        }}
        onLightboxChange={setIsLightboxOpen}
      />
      

      {/* Bottom Navigation */}
      {!isLightboxOpen && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={async (email) => {
          try {
            await login(email);
            if (email === 'admin@travelmap.com') {
              navigate('/admin/dashboard');
            }
          } catch (error) {
            console.error('Login failed', error);
          }
          setIsLoginModalOpen(false);
        }}
        t={t}
      />

      <LocationModal
        isOpen={isLocationPromptOpen}
        onAllow={handleLocationAllow}
        onDeny={handleLocationDeny}
        isLocating={isLocating}
        error={locationError}
        t={t}
      />
    </div>
  );
}
