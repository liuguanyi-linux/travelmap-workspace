import React, { useState } from 'react';
import { X, Calendar, User, Check, CreditCard } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  poi?: any;
  poiName?: string;
  t?: any;
}

export default function BookingModal({ isOpen, onClose, poi, poiName, t = { booking: {}, detail: {} } }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  const isDining = poi?.type?.includes('餐饮') || poi?.type?.includes('美食') || poi?.type?.includes('餐厅');
  const checkInLabel = isDining ? '用餐时间' : (t?.booking?.checkIn || 'Check In');
  const guestsLabel = isDining ? '用餐人数' : (t?.booking?.guests || 'Guests');

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in'>
      <div className='glass-panel rounded-2xl max-w-md w-full p-6 relative overflow-hidden'>
        {/* Decorative elements */}
        <div className='absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full -mr-10 -mt-10'></div>
        <div className='absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-tr-full -ml-10 -mb-10'></div>

        <button onClick={onClose} className='absolute right-4 top-4 text-cyan-600 hover:text-cyan-300 transition-colors z-10'>
          <X size={20} />
        </button>
        
        <h3 className='text-xl font-bold mb-1 text-cyan-50 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]'>{isDining ? '预订座位' : t?.booking?.title || 'Book Now'}</h3>
        <p className='text-cyan-400 mb-6 font-medium text-sm border-b border-cyan-500/20 pb-2'>{poiName || poi?.name}</p>

        {success ? (
          <div className='text-center py-8 text-cyan-400'>
            <div className='w-20 h-20 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-500/50'>
                <Check size={40} className='text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]' />
            </div>
            <p className='text-lg font-bold tracking-wide text-cyan-50'>{t?.booking?.confirm || 'Confirm'} Success!</p>
            <p className='text-sm text-cyan-500/80 mt-2'>System has processed your request.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-5 relative z-10'>
            <div>
              <label className='block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2'>{checkInLabel}</label>
              <div className='relative group'>
                <Calendar className='absolute left-3 top-2.5 text-cyan-600 group-focus-within:text-cyan-400 transition-colors' size={20} />
                <input type={isDining ? 'datetime-local' : 'date'} className='w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] outline-none text-cyan-100 placeholder-slate-600 transition-all' required />
              </div>
            </div>
            
            <div>
              <label className='block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2'>{guestsLabel}</label>
              <div className='relative group'>
                <User className='absolute left-3 top-2.5 text-cyan-600 group-focus-within:text-cyan-400 transition-colors' size={20} />
                <select className='w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] outline-none text-cyan-100 appearance-none transition-all'>
                  <option>1 {t?.detail?.pricePerPerson || '人'}</option>
                  <option>2 {t?.detail?.pricePerPerson || '人'}</option>
                  <option>3+ {t?.detail?.pricePerPerson || '人'}</option>
                </select>
              </div>
            </div>

            <div className='bg-cyan-900/20 p-4 rounded-lg text-xs text-cyan-300 border-l-4 border-cyan-500/50 flex gap-3'>
              <CreditCard size={16} className='shrink-0 mt-0.5' />
              {t?.booking?.note || 'No payment required'}
            </div>

            <button 
              type='submit' 
              disabled={loading}
              className='w-full cyber-button mt-4 flex items-center justify-center gap-2'
            >
              {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    {t?.booking?.submitting || 'Submitting...'}
                  </>
              ) : (t?.booking?.confirm || 'Confirm')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
