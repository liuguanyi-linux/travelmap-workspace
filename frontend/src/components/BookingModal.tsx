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
    <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in'>
      <div className='bg-white dark:bg-gray-800 rounded-[2rem] max-w-md w-full p-8 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]'>
        
        <button onClick={onClose} className='absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full'>
          <X size={24} />
        </button>
        
        <h3 className='text-3xl font-bold mb-2 text-gray-900 dark:text-white'>{isDining ? '预订座位' : t?.booking?.title || 'Book Now'}</h3>
        <p className='text-blue-600 dark:text-blue-400 mb-8 font-bold text-base'>{poiName || poi?.name}</p>

        {success ? (
          <div className='text-center py-8'>
            <div className='w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm'>
                <Check size={48} className='text-green-500' />
            </div>
            <p className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>{t?.booking?.confirm || 'Confirm'} Success!</p>
            <p className='text-gray-500 dark:text-gray-400'>System has processed your request.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-6 relative z-10'>
            <div>
              <label className='block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1'>{checkInLabel}</label>
              <div className='relative group'>
                <Calendar className='absolute left-4 top-3.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors' size={20} />
                <input type={isDining ? 'datetime-local' : 'date'} className='w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all font-medium' required />
              </div>
            </div>
            
            <div>
              <label className='block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1'>{guestsLabel}</label>
              <div className='relative group'>
                <User className='absolute left-4 top-3.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors' size={20} />
                <select className='w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white appearance-none transition-all font-medium'>
                  <option>1 {t?.detail?.pricePerPerson || '人'}</option>
                  <option>2 {t?.detail?.pricePerPerson || '人'}</option>
                  <option>3+ {t?.detail?.pricePerPerson || '人'}</option>
                </select>
              </div>
            </div>

            <div className='bg-blue-50 dark:bg-gray-700 p-4 rounded-2xl text-xs font-medium text-blue-600 dark:text-blue-400 flex gap-3'>
              <CreditCard size={16} className='shrink-0 mt-0.5' />
              {t?.booking?.note || 'No payment required'}
            </div>

            <button 
              type='submit' 
              disabled={loading}
              className='w-full bg-black dark:bg-white text-white dark:text-black mt-2 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-all hover:bg-gray-900 dark:hover:bg-gray-100'
            >
              {loading ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
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
