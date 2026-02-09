import React, { createContext, useContext, useState, useEffect } from 'react';
import { Guide, Strategy, Spot, AdSlot, ContactInfo } from '../types/data';
import { initFirebase, subscribeToCloud, saveToCloud } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface DataContextType {
  guides: Guide[];
  strategies: Strategy[];
  spots: Spot[];
  ads: AdSlot[];
  contactInfo: ContactInfo;
  isAdmin: boolean;
  updateGuide: (guide: Guide) => void;
  addGuide: (guide: Guide) => void;
  deleteGuide: (id: number) => void;
  updateStrategy: (strategy: Strategy) => void;
  addStrategy: (strategy: Strategy) => void;
  deleteStrategy: (id: number) => void;
  updateSpot: (spot: Spot) => void;
  addSpot: (spot: Spot) => void;
  deleteSpot: (id: number) => void;
  updateAd: (ad: AdSlot) => void;
  addAd: (ad: AdSlot) => void;
  deleteAd: (id: number) => void;
  updateContactInfo: (info: ContactInfo) => void;
  isCloudSyncing: boolean;
  enableCloud: (config: any) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INITIAL_GUIDES: Guide[] = [
    {
      id: 1,
      name: '王金牌',
      gender: 'male',
      hasCar: true,
      title: '导游',
      avatar: 'https://picsum.photos/seed/guide1/200/200',
      intro: '从业8年，专注于青岛历史文化讲解，为您提供最深度的旅行体验。',
      cities: ['青岛'],
      rank: 1
    },
    {
      id: 2,
      name: '李小美',
      gender: 'female',
      hasCar: false,
      title: '导游',
      avatar: 'https://picsum.photos/seed/guide2/200/200',
      intro: '熟悉各大网红打卡点和地道美食，带你吃喝玩乐不踩雷！',
      cities: ['青岛', '上海'],
      rank: 2
    },
    {
      id: 3,
      name: '张老三',
      gender: 'male',
      hasCar: true,
      title: '金牌司机',
      avatar: 'https://picsum.photos/seed/guide3/200/200',
      intro: '北京胡同串子，带你领略最地道的京味儿文化。',
      cities: ['北京'],
      rank: 3
    },
    {
      id: 4,
      name: '赵小兰',
      gender: 'female',
      hasCar: true,
      title: '向导',
      avatar: 'https://picsum.photos/seed/guide4/200/200',
      intro: '青岛本地通，带车向导，舒适出行。',
      cities: ['青岛'],
      rank: 4
    }
];

const INITIAL_STRATEGIES: Strategy[] = [
    {
      id: 1,
      title: '青岛经典三日游',
      category: '亲子游',
      days: '3天',
      spots: ['栈桥', '八大关', '五四广场', '奥帆中心'],
      image: 'https://picsum.photos/seed/qingdao1/200/200',
      tags: ['经典路线', '海滨风光', '必打卡'],
      rank: 1
    },
    {
      id: 2,
      title: '老城建筑人文之旅',
      category: '一日游',
      days: '1天',
      spots: ['天主教堂', '信号山', '德国总督楼'],
      image: 'https://picsum.photos/seed/qingdao2/200/200',
      tags: ['历史建筑', '人文摄影', '文艺'],
      rank: 2
    },
    {
      id: 3,
      title: '崂山风景区深度游',
      category: '2日游',
      days: '2天',
      spots: ['太清宫', '仰口', '巨峰'],
      image: 'https://picsum.photos/seed/laoshan/200/200',
      tags: ['爬山', '自然风光', '道教文化'],
      rank: 3
    }
];

const INITIAL_SPOTS: Spot[] = [];
const INITIAL_ADS: AdSlot[] = [];
const INITIAL_CONTACT_INFO: ContactInfo = {
  phone: '13800138000',
  email: 'contact@example.com',
  wechat: 'TravelMapHelper',
  website: 'www.travelmap.com',
  address: '青岛市市南区'
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [guides, setGuides] = useState<Guide[]>(() => {
    const saved = localStorage.getItem('travelmap_guides');
    return saved ? JSON.parse(saved) : INITIAL_GUIDES;
  });

  const [strategies, setStrategies] = useState<Strategy[]>(() => {
    const saved = localStorage.getItem('travelmap_strategies');
    return saved ? JSON.parse(saved) : INITIAL_STRATEGIES;
  });

  const [spots, setSpots] = useState<Spot[]>(() => {
    const saved = localStorage.getItem('travelmap_spots');
    return saved ? JSON.parse(saved) : INITIAL_SPOTS;
  });

  const [ads, setAds] = useState<AdSlot[]>(() => {
    const saved = localStorage.getItem('travelmap_ads');
    return saved ? JSON.parse(saved) : INITIAL_ADS;
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>(() => {
    const saved = localStorage.getItem('travelmap_contact');
    return saved ? JSON.parse(saved) : INITIAL_CONTACT_INFO;
  });

  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Initialize Cloud
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

  // Subscribe to Cloud
  useEffect(() => {
    if (!isCloudSyncing) return;

    const unsubGuides = subscribeToCloud('guides', (data) => { if (data) setGuides(data); });
    const unsubStrategies = subscribeToCloud('strategies', (data) => { if (data) setStrategies(data); });
    const unsubSpots = subscribeToCloud('spots', (data) => { if (data) setSpots(data); });
    const unsubAds = subscribeToCloud('ads', (data) => { if (data) setAds(data); });
    const unsubContact = subscribeToCloud('contact', (data) => { if (data) setContactInfo(data); });

    return () => {
      unsubGuides();
      unsubStrategies();
      unsubSpots();
      unsubAds();
      unsubContact();
    };
  }, [isCloudSyncing]);

  const enableCloud = (config: any) => {
    if (initFirebase(config)) {
      localStorage.setItem('firebase_config', JSON.stringify(config));
      setIsCloudSyncing(true);
      // Force initial push if cloud is empty? Or just let it sync?
      // For safety, we might want to ask user to "Push Local to Cloud".
      // But for now, we just enable sync.
      return true;
    }
    return false;
  };

  // Persistence Effects (Local Backup)
  useEffect(() => { localStorage.setItem('travelmap_guides', JSON.stringify(guides)); }, [guides]);
  useEffect(() => { localStorage.setItem('travelmap_strategies', JSON.stringify(strategies)); }, [strategies]);
  useEffect(() => { localStorage.setItem('travelmap_spots', JSON.stringify(spots)); }, [spots]);
  useEffect(() => { localStorage.setItem('travelmap_ads', JSON.stringify(ads)); }, [ads]);
  useEffect(() => { localStorage.setItem('travelmap_contact', JSON.stringify(contactInfo)); }, [contactInfo]);

  // Methods with Cloud Sync
  const updateGuide = (guide: Guide) => {
    setGuides(prev => {
      const next = prev.map(g => g.id === guide.id ? guide : g);
      if (isCloudSyncing) saveToCloud('guides', next);
      return next;
    });
  };
  const addGuide = (guide: Guide) => {
    setGuides(prev => {
      const next = [...prev, guide];
      if (isCloudSyncing) saveToCloud('guides', next);
      return next;
    });
  };
  const deleteGuide = (id: number) => {
    setGuides(prev => {
      const next = prev.filter(g => g.id !== id);
      if (isCloudSyncing) saveToCloud('guides', next);
      return next;
    });
  };

  const updateStrategy = (strategy: Strategy) => {
    setStrategies(prev => {
      const next = prev.map(s => s.id === strategy.id ? strategy : s);
      if (isCloudSyncing) saveToCloud('strategies', next);
      return next;
    });
  };
  const addStrategy = (strategy: Strategy) => {
    setStrategies(prev => {
      const next = [...prev, strategy];
      if (isCloudSyncing) saveToCloud('strategies', next);
      return next;
    });
  };
  const deleteStrategy = (id: number) => {
    setStrategies(prev => {
      const next = prev.filter(s => s.id !== id);
      if (isCloudSyncing) saveToCloud('strategies', next);
      return next;
    });
  };

  const updateSpot = (spot: Spot) => {
    setSpots(prev => {
      const next = prev.map(s => s.id === spot.id ? spot : s);
      if (isCloudSyncing) saveToCloud('spots', next);
      return next;
    });
  };
  const addSpot = (spot: Spot) => {
    setSpots(prev => {
      const next = [...prev, spot];
      if (isCloudSyncing) saveToCloud('spots', next);
      return next;
    });
  };
  const deleteSpot = (id: number) => {
    setSpots(prev => {
      const next = prev.filter(s => s.id !== id);
      if (isCloudSyncing) saveToCloud('spots', next);
      return next;
    });
  };

  const updateAd = (ad: AdSlot) => {
    setAds(prev => {
      const next = prev.map(a => a.id === ad.id ? ad : a);
      if (isCloudSyncing) saveToCloud('ads', next);
      return next;
    });
  };
  const addAd = (ad: AdSlot) => {
    setAds(prev => {
      const next = [...prev, ad];
      if (isCloudSyncing) saveToCloud('ads', next);
      return next;
    });
  };
  const deleteAd = (id: number) => {
    setAds(prev => {
      const next = prev.filter(a => a.id !== id);
      if (isCloudSyncing) saveToCloud('ads', next);
      return next;
    });
  };

  const updateContactInfo = (info: ContactInfo) => {
    setContactInfo(info);
    if (isCloudSyncing) saveToCloud('contact', info);
  };

  return (
    <DataContext.Provider value={{
      guides, strategies, spots, ads, contactInfo, isAdmin,
      updateGuide, addGuide, deleteGuide,
      updateStrategy, addStrategy, deleteStrategy,
      updateSpot, addSpot, deleteSpot,
      updateAd, addAd, deleteAd,
      updateContactInfo,
      isCloudSyncing, enableCloud
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
