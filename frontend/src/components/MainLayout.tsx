import { useState, useRef, useEffect } from 'react';
import MapContainer from './MapContainer';
import LoginModal from './LoginModal';
import LocationModal from './LocationModal';
import { getTranslation } from '../utils/translations';
import BottomTabBar from './mobile/BottomTabBar';
import CityDrawer from './mobile/CityDrawer';
import FloatingSearchBar from './mobile/FloatingSearchBar';
import PoiDetailBottomSheet from './mobile/PoiDetailBottomSheet';

export default function MainLayout() {
  // Map State
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [aMap, setAMap] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<any>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState('city');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  
  // Close bottom sheet when tab changes to avoid conflicts
  useEffect(() => {
    if (isBottomSheetOpen) {
        setIsBottomSheetOpen(false);
    }
  }, [activeTab]);

  const [currentLang, setCurrentLang] = useState(localStorage.getItem('travelmap_lang') || 'zh-CN');
  
  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const hasPromptedRef = useRef(false);

  // Refs
  const routePluginRef = useRef<any>(null);

  const t = getTranslation(currentLang);

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
      } else {
        console.warn('High accuracy location failed, trying CitySearch fallback...', result);
        const citySearch = new aMap.CitySearch();
        citySearch.getLocalCity((status: string, result: any) => {
            setIsLocating(false);
            if (status === 'complete' && result.info === 'OK') {
                setIsLocationPromptOpen(false);
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

  const handleSearch = (keyword: string, isNearby: boolean = false) => {
    if (!aMap || !keyword) return;

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
        }
      });
    } else {
      placeSearch.search(keyword, (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
          setSearchResults(result.poiList.pois);
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
    handleSearch(category, true); // Search nearby for categories
  };

  const handleCitySelect = (city: { name: string, center: [number, number], zoom: number }) => {
    if (mapInstance) {
        mapInstance.setZoomAndCenter(city.zoom, city.center);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
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

      {/* City Drawer (Replaces CityCategoryPanel) */}
      <CityDrawer 
        isVisible={activeTab === 'city' && !isBottomSheetOpen}
        onSelectCategory={handleCategorySelect}
        onSelectCity={handleCitySelect}
        searchResults={searchResults}
        onPoiClick={handleMarkerClick}
      />

      {/* Bottom Tab Bar */}
      <BottomTabBar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* POI Detail Bottom Sheet */}
      <PoiDetailBottomSheet 
        poi={selectedPoi}
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
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
