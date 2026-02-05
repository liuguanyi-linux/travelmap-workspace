import { useState, useRef, useEffect } from 'react';
import MapContainer from './MapContainer';
import LoginModal from './LoginModal';
import LocationModal from './LocationModal';
import { useLanguage } from '../contexts/LanguageContext';
import BottomTabBar from './mobile/BottomTabBar';
import CityDrawer from './mobile/CityDrawer';
import UserDrawer from './mobile/UserDrawer';
import StrategyView from './mobile/StrategyView';
import GuideView from './mobile/GuideView';
import FloatingSearchBar from './mobile/FloatingSearchBar';
import AdsWidget from './mobile/AdsWidget';
import AtmWidget from './mobile/AtmWidget';
import PoiDetailBottomSheet from './mobile/PoiDetailBottomSheet';
import SearchResultsDrawer from './mobile/SearchResultsDrawer';

export default function MainLayout() {
  // Map State
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [aMap, setAMap] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<any>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState(''); // Default to empty (closed)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isSearchListOpen, setIsSearchListOpen] = useState(false);
  const [activeCity, setActiveCity] = useState('青岛'); // Default active city for custom POIs
  
  // Close bottom sheet when tab changes to avoid conflicts
  useEffect(() => {
    if (isBottomSheetOpen) {
        setIsBottomSheetOpen(false);
    }
  }, [activeTab]);

  const { t } = useLanguage();
  
  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const hasPromptedRef = useRef(false);

  // Refs
  const routePluginRef = useRef<any>(null);

  const handleMapReady = (map: any, AMap: any) => {
    setMapInstance(map);
    setAMap(AMap);

    // Prompt for location on first load
    if (!hasPromptedRef.current) {
        setTimeout(() => {
            setIsLocationPromptOpen(true);
        }, 800);
        hasPromptedRef.current = true;
    }
  };

  const handleLocationAllow = () => {
    if (!mapInstance || !aMap) return;

    setIsLocating(true);
    setLocationError(null);

    const geolocation = new aMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      zoomToAccuracy: true,
    });

    geolocation.getCurrentPosition((status: string, result: any) => {
      if (status === 'complete') {
        setIsLocating(false);
        setIsLocationPromptOpen(false);
        mapInstance.setZoomAndCenter(15, result.position);
        
        // Try to get city name from addressComponent if available
        if (result.addressComponent && result.addressComponent.city) {
             const cityName = result.addressComponent.city.replace('市', '');
             setActiveCity(cityName);
        }
      } else {
        console.warn('High accuracy location failed, trying CitySearch fallback...', result);
        const citySearch = new aMap.CitySearch();
        citySearch.getLocalCity((status: string, result: any) => {
            setIsLocating(false);
            if (status === 'complete' && result.info === 'OK') {
                setIsLocationPromptOpen(false);
                
                // Update active city
                if (result.city) {
                    setActiveCity(result.city.replace('市', ''));
                }

                if (result.bounds) {
                    mapInstance.setBounds(result.bounds);
                } else {
                    mapInstance.setZoomAndCenter(10, mapInstance.getCenter());
                }
            } else {
                setLocationError('failed');
            }
        });
      }
    });
  };

  const handleLocationDeny = () => {
      setIsLocationPromptOpen(false);
      setLocationError(null);
  };

  const handleSearch = (keyword: string, isNearby: boolean = false, shouldOpenDrawer: boolean = true) => {
    if (!aMap || !keyword) return;

    // Reset selection when searching
    setSelectedPoi(null);
    setIsBottomSheetOpen(false);

    // Clear existing routes
    if (routePluginRef.current) {
      routePluginRef.current.clear();
      routePluginRef.current = null;
    }

    const placeSearch = new aMap.PlaceSearch({
      pageSize: 20,
      pageIndex: 1,
      map: mapInstance,
      autoFitView: true,
    });

    if (isNearby) {
      const center = mapInstance.getCenter();
      placeSearch.searchNearBy(keyword, center, 5000, (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
          setSearchResults(result.poiList.pois);
          if (result.poiList.pois.length > 1 && shouldOpenDrawer) {
            setIsSearchListOpen(true);
          }
        }
      });
    } else {
      placeSearch.search(keyword, (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
          setSearchResults(result.poiList.pois);
          if (result.poiList.pois.length > 1 && shouldOpenDrawer) {
             setIsSearchListOpen(true);
          }
        }
      });
    }
  };

  const handleMarkerClick = (poi: any) => {
    setSelectedPoi(poi);
    setIsBottomSheetOpen(true);
    
    // Center map on marker with offset to show above bottom sheet (peek mode covers bottom ~35%)
    if (mapInstance && poi.location) {
        // 1. Zoom and center first
        mapInstance.setZoomAndCenter(16, [poi.location.lng, poi.location.lat]);
        
        // 2. Pan map up slightly (move content up) so marker appears higher in viewport
        // We want marker at ~35% from top (center of visible area), so we pan map UP.
        setTimeout(() => {
             mapInstance.panBy(0, -120); 
        }, 300);
    }
  };

  const handleCategorySelect = (category: string) => {
    handleSearch(category, true, false); // Search nearby for categories, do not open drawer
  };

  const handleCityScopedSearch = (keyword: string) => {
    if (!aMap || !keyword) return;

    const placeSearch = new aMap.PlaceSearch({
      pageSize: 20,
      pageIndex: 1,
      map: mapInstance,
      city: activeCity,
      citylimit: true,
      autoFitView: true,
    });

    placeSearch.search(keyword, (status: string, result: any) => {
      if (status === 'complete' && result.info === 'OK') {
        setSearchResults(result.poiList.pois);
      } else {
        setSearchResults([]);
      }
    });
  };

  const handleCitySelect = (city: { name: string, center: [number, number], zoom: number }) => {
    setActiveCity(city.name); // Update active city context
    if (mapInstance) {
        mapInstance.setZoomAndCenter(city.zoom, city.center);
    }
  };

  const handleTabChange = (tabId: string) => {
    if (activeTab === tabId) {
        setActiveTab('');
    } else {
        setActiveTab(tabId);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          onMapReady={handleMapReady}
          markers={searchResults}
          selectedPoi={selectedPoi}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* Top Floating Search */}
      <FloatingSearchBar 
        onSearch={(keyword) => handleSearch(keyword)}
        onCategorySelect={handleCategorySelect}
      />

      {/* Right Side Widgets */}
      {activeTab === '' && (
        <div className="fixed top-28 right-4 z-50 flex flex-col gap-3 pointer-events-none">
          <div className="pointer-events-auto">
            <AdsWidget />
          </div>
          <div className="pointer-events-auto">
            <AtmWidget onSelect={() => handleCategorySelect('ATM')} />
          </div>
        </div>
      )}

      {/* City Drawer (Replaces CityCategoryPanel) */}
      <CityDrawer 
        isVisible={activeTab === 'city' && !isBottomSheetOpen}
        onSelectCategory={handleCategorySelect}
        onSelectCity={handleCitySelect}
        searchResults={searchResults}
        onPoiClick={handleMarkerClick}
        onClose={() => setActiveTab('')}
        onSearch={handleCityScopedSearch}
      />

      {/* Strategy View */}
      <StrategyView 
        isVisible={activeTab === 'strategy' && !isBottomSheetOpen}
        onClose={() => setActiveTab('')}
      />

      {/* Guide View */}
      <GuideView 
        isVisible={activeTab === 'guide' && !isBottomSheetOpen}
        onClose={() => setActiveTab('')}
        activeCity={activeCity}
      />

      {/* User Drawer */}
      <UserDrawer 
        isVisible={activeTab === 'me' && !isBottomSheetOpen}
        onClose={() => setActiveTab('')}
        onPoiClick={handleMarkerClick}
      />

      {/* Bottom Tab Bar */}
      <BottomTabBar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* POI Detail Bottom Sheet */}
      <PoiDetailBottomSheet 
        poi={selectedPoi}
        isOpen={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setSelectedPoi(null);
        }}
      />
      
      {/* Search Results Drawer */}
      <SearchResultsDrawer
        isVisible={isSearchListOpen && !isBottomSheetOpen}
        results={searchResults}
        onPoiClick={(poi) => {
            handleMarkerClick(poi);
            setIsSearchListOpen(false);
        }}
        onClose={() => setIsSearchListOpen(false)}
      />

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={(user) => {
          localStorage.setItem('travelmap_user', JSON.stringify(user));
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
