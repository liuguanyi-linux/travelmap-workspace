import React, { useRef, useEffect, useState } from 'react';
import { Star, MapPin, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '../../hooks/useFavorites';

interface Spot {
  id: string | number;
  name: string;
  image?: string;
  photos?: { url: string }[];
  location: { lng: number; lat: number };
  rating?: number;
  type?: string;
  address?: string;
  reviews?: any[];
}

interface BottomSpotListProps {
  spots: Spot[];
  activeSpotId: string | number | null;
  onSpotFocus: (spot: Spot) => void;
  onSpotClick?: (spot: Spot) => void;
}

export default function BottomSpotList({ spots, activeSpotId, onSpotFocus, onSpotClick }: BottomSpotListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lastFocusTime, setLastFocusTime] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Handle scroll to sync with map
  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    // Simple debounce
    const now = Date.now();
    if (now - lastFocusTime < 100) return;

    const container = scrollRef.current;
    const center = container.scrollLeft + container.clientWidth / 2;
    
    let closestSpot: Spot | null = null;
    let minDistance = Infinity;

    // Find the card closest to the center
    const cards = container.children;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSpot = spots[i];
      }
    }

    if (closestSpot && closestSpot.id !== activeSpotId) {
      setLastFocusTime(now);
      onSpotFocus(closestSpot);
    }
  };

  // Scroll to active spot if changed externally (e.g. map click)
  useEffect(() => {
    if (!activeSpotId || !scrollRef.current) return;
    
    const index = spots.findIndex(s => s.id === activeSpotId);
    if (index !== -1) {
      const card = scrollRef.current.children[index] as HTMLElement;
      if (card) {
        const container = scrollRef.current;
        const scrollLeft = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeSpotId, spots]);

  if (spots.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 px-[5vw] scrollbar-hide pointer-events-auto"
        style={{ scrollPaddingLeft: '5vw', scrollPaddingRight: '5vw' }}
      >
        {spots.map((spot) => {
          const targetIdForFav = String(spot.id || spot.amapId);
          return (
          <motion.div
            key={spot.id}
            layoutId={`spot-${spot.id}`}
            className={`shrink-0 w-[85vw] max-w-sm bg-white rounded-2xl p-3 shadow-lg snap-center flex gap-3 transition-all border relative ${
              activeSpotId === spot.id ? 'border-blue-500 ring-2 ring-blue-100 scale-[1.02]' : 'border-gray-100 scale-100'
            }`}
            onClick={() => {
                if (onSpotClick) {
                    onSpotClick(spot);
                } else {
                    onSpotFocus(spot);
                }
            }}
          >
            {/* Heart Button */}
            <button 
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm shadow-sm z-10 hover:scale-110 active:scale-95 transition-all border ${
                  isFavorite(targetIdForFav, 'poi') 
                    ? 'bg-white border-red-100' 
                    : 'bg-white/80 border-gray-100'
                }`}
                onClick={async (e) => { 
                    e.stopPropagation(); 
                    try {
                      const payload = {
                        id: targetIdForFav,
                        name: spot.name,
                        type: 'poi', // Force 'poi' to prevent type pollution
                        address: spot.address,
                        location: `${spot.location.lng},${spot.location.lat}`,
                        imageUrl: spot.photos?.[0]?.url || spot.image
                      };
                      console.log("👉 1. Clicked (BottomSpotList)! Ready to send Payload:", payload);
                      await toggleFavorite(payload);
                    } catch (err) {
                      // error handled in context
                    }
                }}
            >
                <Heart 
                  size={16} 
                  className={isFavorite(targetIdForFav, 'poi') ? 'fill-red-500 text-red-500' : 'text-gray-400'} 
                />
            </button>

            {/* Image */}
            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
              {spot.photos?.[0] ? (
                <img src={spot.photos[0].url} alt={spot.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <MapPin size={24} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
              <div>
                <h3 className="font-bold text-gray-900 text-lg truncate">{spot.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{spot.address || '暂无地址信息'}</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                  <Star size={14} fill="currentColor" />
                  <span>{spot.rating || '4.8'}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {spot.reviews && spot.reviews.length > 0 ? `评论${spot.reviews.length}` : '评论0'}
                </span>
              </div>
            </div>
          </motion.div>
        )})}
      </div>
    </div>
  );
}
