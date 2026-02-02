import { MapPin, Navigation, Loader2, AlertCircle } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
  isLocating: boolean;
  error?: string | null;
  t: any;
}

export default function LocationModal({ isOpen, onAllow, onDeny, isLocating, error, t }: LocationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="glass-panel rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] w-full max-w-sm overflow-hidden p-8 text-center relative">
        
        {/* Decorative ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-t from-cyan-500/5 to-transparent rounded-full pointer-events-none animate-pulse-slow"></div>

        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-colors duration-300 relative z-10 border-2 ${error ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'}`}>
          {error ? <AlertCircle size={36} /> : (isLocating ? <Loader2 size={36} className="animate-spin" /> : <MapPin size={36} />)}
        </div>
        
        <h2 className="text-2xl font-bold text-cyan-50 mb-3 relative z-10 tracking-wide drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
           {error ? (t.locationPrompt?.failed || 'Location failed') : (isLocating ? (t.locationPrompt?.locating || 'Locating...') : (t.locationPrompt?.title || 'Use your location'))}
        </h2>
        <p className="text-cyan-200/70 mb-8 text-sm leading-relaxed relative z-10">
          {error ? (t.locationPrompt?.failedMessage || 'Please check your browser permissions and try again.') : (t.locationPrompt?.message || 'Allow TravelMap to access your current location for better service?')}
        </p>
        
        <div className="flex flex-col gap-4 relative z-10">
          {!isLocating && !error && (
             <>
               <button 
                onClick={onAllow}
                className="w-full cyber-button flex items-center justify-center gap-2 group"
               >
                <Navigation size={18} className="group-hover:animate-bounce" />
                {t.locationPrompt?.allow || 'Allow'}
               </button>
               <button 
                onClick={onDeny}
                className="w-full bg-transparent text-slate-400 py-3 rounded-xl font-medium hover:text-cyan-400 transition-all hover:bg-slate-800/50 border border-transparent hover:border-slate-700"
               >
                {t.locationPrompt?.deny || 'Not Now'}
               </button>
             </>
          )}

          {error && (
             <button 
               onClick={onDeny} // Close on error
               className="w-full bg-slate-800 text-slate-300 py-3 rounded-xl font-medium hover:bg-slate-700 transition-all border border-slate-600 hover:border-slate-500"
             >
               {t.common?.close || 'Close'}
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
