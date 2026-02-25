import React, { createContext, useContext, useState, useEffect } from 'react';
import { Guide, Strategy, StrategyCategory, Spot, AdSlot, ContactInfo, City, SpotCategory } from '../types/data';
import { initFirebase, subscribeToCloud, saveToCloud } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { guideService, strategyService, strategyCategoryService, spotService, adService, contactService, cityService, spotCategoryService } from '../services/api';

interface DataContextType {
  guides: Guide[];
  strategies: Strategy[];
  strategyCategories: StrategyCategory[];
  spotCategories: SpotCategory[];
  spots: Spot[];
  ads: AdSlot[];
  contactInfo: ContactInfo;
  cities: City[];
  isAdmin: boolean;
  updateGuide: (guide: Guide) => void;
  addGuide: (guide: Guide) => void;
  deleteGuide: (id: number) => void;
  updateStrategy: (strategy: Strategy) => void;
  addStrategy: (strategy: Strategy) => void;
  deleteStrategy: (id: number) => void;
  addStrategyCategory: (name: string) => void;
  deleteStrategyCategory: (id: number) => void;
  addSpotCategory: (data: any) => void;
  updateSpotCategory: (id: number, data: any) => void;
  deleteSpotCategory: (id: number) => void;
  updateSpot: (spot: Spot) => void;
  addSpot: (spot: Spot) => void;
  deleteSpot: (id: number) => void;
  updateAd: (ad: AdSlot) => void;
  addAd: (ad: AdSlot) => void;
  deleteAd: (id: number) => void;
  updateContactInfo: (info: ContactInfo) => void;
  addCity: (city: City) => void;
  updateCity: (id: number, city: Partial<City>) => void;
  deleteCity: (id: number) => void;
  isCloudSyncing: boolean;
  enableCloud: (config: any) => boolean;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INITIAL_CONTACT_INFO: ContactInfo = {
  phone: '',
  email: '',
  wechat: '',
  website: '',
  address: ''
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [strategyCategories, setStrategyCategories] = useState<StrategyCategory[]>([]);
  const [spotCategories, setSpotCategories] = useState<SpotCategory[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(INITIAL_CONTACT_INFO);

  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Function to fetch all data from backend
  const refreshData = async () => {
    try {
      const params = isAdmin ? { includeExpired: true } : {};
      
      // Use allSettled to prevent one failure from blocking others
      const results = await Promise.allSettled([
        guideService.getAll(params),
        strategyService.getAll(params),
        strategyCategoryService.getAll(),
        spotService.getAll(params),
        adService.getAll(params),
        contactService.get(),
        cityService.getAll(),
        spotCategoryService.getAll()
      ]);

      // Helper to get value or fallback
      const getVal = (res: PromiseSettledResult<any>, fallback: any) => 
        res.status === 'fulfilled' ? res.value : fallback;

      // Log errors if any
      results.forEach((res, index) => {
        if (res.status === 'rejected') {
          console.error(`API Call ${index} failed:`, res.reason);
        }
      });

      const g = getVal(results[0], []);
      const s = getVal(results[1], []);
      const sc = getVal(results[2], []);
      const sp = getVal(results[3], []);
      const a = getVal(results[4], []);
      const c = getVal(results[5], INITIAL_CONTACT_INFO);
      const ci = getVal(results[6], []);
      const spc = getVal(results[7], []);

      // Only update state if data is valid (non-empty or at least array)
      if (results[0].status === 'fulfilled') setGuides(g);
      if (results[1].status === 'fulfilled') setStrategies(s);
      if (results[2].status === 'fulfilled') setStrategyCategories(sc);
      if (results[3].status === 'fulfilled') {
          setSpots(sp);
          localStorage.setItem('cached_spots', JSON.stringify(sp));
      }
      if (results[4].status === 'fulfilled') setAds(a);
      if (results[5].status === 'fulfilled') setContactInfo(c);
      if (results[6].status === 'fulfilled') {
          setCities(ci);
          localStorage.setItem('cached_cities', JSON.stringify(ci));
      }
      if (results[7].status === 'fulfilled') {
          setSpotCategories(spc);
          localStorage.setItem('cached_spotCategories', JSON.stringify(spc));
      }

    } catch (error) {
      console.error("Failed to fetch data from API (Critical):", error);
    }
  };

  // Initial Load
  useEffect(() => {
    // Load from cache first for immediate UI feedback
    try {
        const cachedCities = localStorage.getItem('cached_cities');
        if (cachedCities) setCities(JSON.parse(cachedCities));
        
        const cachedSpotCats = localStorage.getItem('cached_spotCategories');
        if (cachedSpotCats) setSpotCategories(JSON.parse(cachedSpotCats));
        
        const cachedSpots = localStorage.getItem('cached_spots');
        if (cachedSpots) setSpots(JSON.parse(cachedSpots));
    } catch (e) {
        console.error('Failed to load cached data', e);
    }

    refreshData();
  }, [isAdmin]);

  // Initialize Cloud (Keep existing logic if needed, but primarily use API now)
  useEffect(() => {
    const configStr = localStorage.getItem('firebase_config');
    if (configStr) {
      try {
        const config = JSON.parse(configStr);
        if (initFirebase(config)) {
          setIsCloudSyncing(true);
        }
      } catch (e) {
        console.error("Failed to parse firebase config", e);
      }
    }
  }, []);

  // Cloud subscriptions (Optional: if we want to keep Firebase as a secondary sync, but likely we want to move away from it. 
  // For now, I'll keep the logic but it might conflict if we are not careful. 
  // Given the user wants "Backend Sync", the API is the source of truth.)
  // I will comment out cloud subscriptions for data to avoid conflicts with API.
  /*
  useEffect(() => {
    if (!isCloudSyncing) return;
    const unsubGuides = subscribeToCloud('guides', (data) => { if (data) setGuides(data); });
    // ...
    return () => { unsubGuides(); ... };
  }, [isCloudSyncing]);
  */

  const enableCloud = (config: any) => {
    if (initFirebase(config)) {
      localStorage.setItem('firebase_config', JSON.stringify(config));
      setIsCloudSyncing(true);
      return true;
    }
    return false;
  };

  // --- CRUD Operations Wrapper ---

  const addGuide = async (guide: Guide) => {
    try {
      // API call
      const { id, ...rest } = guide; // Backend generates ID
      const newGuide = await guideService.create(rest);
      setGuides(prev => [...prev, newGuide]);
    } catch (error) {
      console.error("Failed to add guide", error);
      throw error;
    }
  };

  const updateGuide = async (guide: Guide) => {
    try {
      const updated = await guideService.update(guide.id, guide);
      setGuides(prev => prev.map(item => item.id === guide.id ? updated : item));
    } catch (error) {
      console.error("Failed to update guide", error);
      throw error;
    }
  };

  const deleteGuide = async (id: number) => {
    try {
      await guideService.delete(id);
      setGuides(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete guide", error);
      throw error;
    }
  };

  const addStrategy = async (strategy: Strategy) => {
    try {
        const { id, ...rest } = strategy;
        const newStrategy = await strategyService.create(rest);
        setStrategies(prev => [...prev, newStrategy]);
    } catch (error) {
        console.error("Failed to add strategy", error);
        throw error;
    }
  };

  const updateStrategy = async (strategy: Strategy) => {
      try {
          const updated = await strategyService.update(strategy.id, strategy);
          setStrategies(prev => prev.map(item => item.id === strategy.id ? updated : item));
      } catch (error) {
          console.error("Failed to update strategy", error);
          throw error;
      }
  };

  const deleteStrategy = async (id: number) => {
      try {
          await strategyService.delete(id);
          setStrategies(prev => prev.filter(item => item.id !== id));
      } catch (error) {
          console.error("Failed to delete strategy", error);
          throw error;
      }
  };

  const addSpot = async (spot: Spot) => {
      try {
          const { id, ...rest } = spot;
          console.log('Adding spot:', rest);
          const newSpot = await spotService.create(rest);
          setSpots(prev => [...prev, newSpot]);
          console.log('Spot added successfully:', newSpot);
      } catch (error) {
          console.error("Failed to add spot", error);
          throw error;
      }
  };

  const updateSpot = async (spot: Spot) => {
      try {
          const updated = await spotService.update(spot.id, spot);
          setSpots(prev => prev.map(item => item.id === spot.id ? updated : item));
      } catch (error) {
          console.error("Failed to update spot", error);
          throw error;
      }
  };

  const deleteSpot = async (id: number) => {
      try {
          await spotService.delete(id);
          setSpots(prev => prev.filter(item => item.id !== id));
      } catch (error) {
          console.error("Failed to delete spot", error);
          throw error;
      }
  };

  const addAd = async (ad: AdSlot) => {
    try {
      const newAd = await adService.create(ad);
      setAds(prev => [...prev, newAd]);
    } catch (error) {
      console.error("Failed to add ad:", error);
    }
  };

  const updateAd = async (ad: AdSlot) => {
    try {
      const updated = await adService.update(ad.id, ad);
      setAds(prev => prev.map(item => item.id === ad.id ? updated : item));
    } catch (error) {
      console.error("Failed to update ad:", error);
    }
  };

  const deleteAd = async (id: number) => {
    try {
      await adService.delete(id);
      setAds(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Failed to delete ad:", error);
    }
  };

  const updateContactInfo = async (info: ContactInfo) => {
    try {
      // Assuming ID 1 for singleton contact info, or use what's returned from get()
      const updated = await contactService.update(info);
      setContactInfo(updated);
    } catch (error) {
      console.error("Failed to update contact info:", error);
    }
  };

  const addCity = async (city: City) => {
    try {
      const newCity = await cityService.create(city);
      setCities(prev => [...prev, newCity]);
    } catch (error) {
      console.error("Failed to add city:", error);
    }
  };

  const updateCity = async (id: number, city: Partial<City>) => {
    try {
      const updatedCity = await cityService.update(id, city);
      setCities(prev => prev.map(c => c.id === id ? updatedCity : c));
    } catch (error) {
      console.error("Failed to update city:", error);
    }
  };

  const deleteCity = async (id: number) => {
    try {
      await cityService.delete(id);
      setCities(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Failed to delete city:", error);
    }
  };

  const addStrategyCategory = async (name: string) => {
    try {
      const newCategory = await strategyCategoryService.create(name);
      setStrategyCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error("Failed to add strategy category:", error);
    }
  };

  const deleteStrategyCategory = async (id: number) => {
    try {
      await strategyCategoryService.delete(id);
      setStrategyCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Failed to delete strategy category:", error);
    }
  };

  const addSpotCategory = async (data: any) => {
    try {
      const newCategory = await spotCategoryService.create(data);
      setSpotCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error("Failed to add spot category:", error);
    }
  };

  const updateSpotCategory = async (id: number, data: any) => {
    try {
      const updated = await spotCategoryService.update(id, data);
      setSpotCategories(prev => prev.map(c => c.id === id ? updated : c));
    } catch (error) {
      console.error("Failed to update spot category:", error);
    }
  };

  const deleteSpotCategory = async (id: number) => {
    try {
      await spotCategoryService.delete(id);
      setSpotCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Failed to delete spot category:", error);
    }
  };

  return (
    <DataContext.Provider value={{
      guides,
      strategies,
      strategyCategories,
      spotCategories,
      spots,
      ads,
      contactInfo,
      cities,
      isAdmin,
      updateGuide,
      addGuide,
      deleteGuide,
      updateStrategy,
      addStrategy,
      deleteStrategy,
      addStrategyCategory,
    deleteStrategyCategory,
    addSpotCategory,
    updateSpotCategory,
    deleteSpotCategory,
    updateSpot,
      addSpot,
      deleteSpot,
      updateAd,
      addAd,
      deleteAd,
      updateContactInfo,
      addCity,
      updateCity,
      deleteCity,
      isCloudSyncing,
      enableCloud: () => false, // Disabled cloud sync in favor of API
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
