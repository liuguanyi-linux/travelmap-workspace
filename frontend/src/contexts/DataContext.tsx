import React, { createContext, useContext, useState, useEffect } from 'react';
import { Guide, Strategy, Spot, AdSlot } from '../types/data';

interface DataContextType {
  guides: Guide[];
  strategies: Strategy[];
  spots: Spot[];
  ads: AdSlot[];
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
      days: '3天',
      spots: ['栈桥', '八大关', '五四广场', '奥帆中心'],
      image: 'https://picsum.photos/seed/qingdao1/200/200',
      tags: ['经典路线', '海滨风光', '必打卡'],
      rank: 1
    },
    {
      id: 2,
      title: '老城建筑人文之旅',
      days: '1天',
      spots: ['天主教堂', '信号山', '德国总督楼'],
      image: 'https://picsum.photos/seed/qingdao2/200/200',
      tags: ['历史建筑', '人文摄影', '文艺'],
      rank: 2
    },
    {
      id: 3,
      title: '崂山风景区深度游',
      days: '2天',
      spots: ['太清宫', '仰口', '巨峰'],
      image: 'https://picsum.photos/seed/laoshan/200/200',
      tags: ['爬山', '自然风光', '道教文化'],
      rank: 3
    }
];

const INITIAL_SPOTS: Spot[] = [];
const INITIAL_ADS: AdSlot[] = [];

export function DataProvider({ children }: { children: React.ReactNode }) {
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

  // Persistence Effects
  useEffect(() => { localStorage.setItem('travelmap_guides', JSON.stringify(guides)); }, [guides]);
  useEffect(() => { localStorage.setItem('travelmap_strategies', JSON.stringify(strategies)); }, [strategies]);
  useEffect(() => { localStorage.setItem('travelmap_spots', JSON.stringify(spots)); }, [spots]);
  useEffect(() => { localStorage.setItem('travelmap_ads', JSON.stringify(ads)); }, [ads]);

  // Methods
  const updateGuide = (guide: Guide) => {
    setGuides(prev => prev.map(g => g.id === guide.id ? guide : g));
  };
  const addGuide = (guide: Guide) => {
    setGuides(prev => [...prev, guide]);
  };
  const deleteGuide = (id: number) => {
    setGuides(prev => prev.filter(g => g.id !== id));
  };

  const updateStrategy = (strategy: Strategy) => {
    setStrategies(prev => prev.map(s => s.id === strategy.id ? strategy : s));
  };
  const addStrategy = (strategy: Strategy) => {
    setStrategies(prev => [...prev, strategy]);
  };
  const deleteStrategy = (id: number) => {
    setStrategies(prev => prev.filter(s => s.id !== id));
  };

  const updateSpot = (spot: Spot) => {
    setSpots(prev => prev.map(s => s.id === spot.id ? spot : s));
  };
  const addSpot = (spot: Spot) => {
    setSpots(prev => [...prev, spot]);
  };
  const deleteSpot = (id: number) => {
    setSpots(prev => prev.filter(s => s.id !== id));
  };

  const updateAd = (ad: AdSlot) => {
    setAds(prev => prev.map(a => a.id === ad.id ? ad : a));
  };
  const addAd = (ad: AdSlot) => {
    setAds(prev => [...prev, ad]);
  };
  const deleteAd = (id: number) => {
    setAds(prev => prev.filter(a => a.id !== id));
  };

  return (
    <DataContext.Provider value={{
      guides, strategies, spots, ads,
      updateGuide, addGuide, deleteGuide,
      updateStrategy, addStrategy, deleteStrategy,
      updateSpot, addSpot, deleteSpot,
      updateAd, addAd, deleteAd
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
