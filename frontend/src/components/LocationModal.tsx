import { MapPin, Navigation, Loader2, AlertCircle } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
  isLocating: boolean;
  error?: string | null;
  t: (path: string) => any;
}

export default function LocationModal({ isOpen, onAllow, onDeny, isLocating, error, t }: LocationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-sm overflow-hidden p-8 text-center relative">
        
        <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 transition-colors duration-300 relative z-10 ${error ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
          {error ? <AlertCircle size={36} /> : (isLocating ? <Loader2 size={36} className="animate-spin" /> : <MapPin size={36} />)}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 relative z-10">
           {error ? t('locationPrompt.failed') : (isLocating ? t('locationPrompt.locating') : t('locationPrompt.title'))}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed relative z-10">
          {error ? t('locationPrompt.failedMessage') : t('locationPrompt.message')}
        </p>
        
        <div className="flex flex-col gap-3 relative z-10">
          {!isLocating && !error && (
             <>
               <button 
                onClick={onAllow}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 group shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-all"
               >
                <Navigation size={18} className="group-hover:animate-bounce" />
                {t('locationPrompt.allow')}
               </button>
               <button 
                onClick={onDeny}
                className="w-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3.5 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all active:scale-95"
               >
                {t('locationPrompt.deny')}
               </button>
             </>
          )}

          {error && (
             <button 
               onClick={onDeny} // Close on error
               className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3.5 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
             >
               {t('common.close')}
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
