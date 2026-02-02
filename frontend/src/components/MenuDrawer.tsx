import { useState } from 'react';
import { getTranslation } from '../utils/translations';
import { 
  X, Bookmark, Clock, Users, Activity, Shield, Link, Printer, 
  Store, Edit, Lightbulb, HelpCircle, Info, Globe, Settings, History, ChevronRight,
  Languages
} from 'lucide-react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  currentLang: string;
}

const LANGUAGES = [
  { code: 'zh-CN', name: '简体中文 (Simplified Chinese)', country: 'China' },
  { code: 'en-US', name: 'English (United States)', country: 'United States' },
  { code: 'ja-JP', name: '日本語 (Japanese)', country: 'Japan' },
  { code: 'ko-KR', name: '한국어 (Korean)', country: 'South Korea' },
  { code: 'fr-FR', name: 'Français (French)', country: 'France' },
  { code: 'de-DE', name: 'Deutsch (German)', country: 'Germany' },
  { code: 'es-ES', name: 'Español (Spanish)', country: 'Spain' },
  { code: 'pt-BR', name: 'Português (Portuguese)', country: 'Brazil' },
  { code: 'ru-RU', name: 'Русский (Russian)', country: 'Russia' },
  { code: 'it-IT', name: 'Italiano (Italian)', country: 'Italy' },
  { code: 'ar-SA', name: 'العربية (Arabic)', country: 'Saudi Arabia' },
  { code: 'hi-IN', name: 'हनद (Hindi)', country: 'India' },
  { code: 'th-TH', name: 'ไทย (Thai)', country: 'Thailand' },
  { code: 'vi-VN', name: 'Tiếng Việt (Vietnamese)', country: 'Vietnam' },
  { code: 'id-ID', name: 'Bahasa Indonesia', country: 'Indonesia' },
  { code: 'ms-MY', name: 'Bahasa Melayu', country: 'Malaysia' },
  { code: 'tr-TR', name: 'Türkçe (Turkish)', country: 'Turkey' },
  { code: 'nl-NL', name: 'Nederlands (Dutch)', country: 'Netherlands' },
  { code: 'pl-PL', name: 'Polski (Polish)', country: 'Poland' },
  { code: 'sv-SE', name: 'Svenska (Swedish)', country: 'Sweden' },
];

export default function MenuDrawer({ isOpen, onClose, onAction, currentLang }: MenuDrawerProps) {
  const [showLanguages, setShowLanguages] = useState(false);
  const t = getTranslation(currentLang).menu;

  if (!isOpen) return null;

  const handleAction = (action: string) => {
    onAction(action);
    if (action !== 'language') {
       onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className='fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Drawer */}
      <div className='fixed top-0 left-0 h-full w-80 bg-slate-950/95 backdrop-blur-xl z-50 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-y-auto transform transition-transform duration-300 ease-in-out animate-slide-in border-r border-cyan-500/30'>
        
        {/* Header */}
        <div className='p-6 border-b border-cyan-900/30 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950 relative overflow-hidden'>
          {/* Decorative glow */}
          <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500'></div>
          
          <div className='flex items-center gap-3 relative z-10'>
            <div className='w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-500/50'>
              <span className='bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent'>T</span>
            </div>
            <span className='text-xl font-bold text-cyan-50 tracking-wide cyber-glitch'>TravelMap</span>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-slate-800 rounded-full text-cyan-600 hover:text-cyan-400 transition-colors relative z-10'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Menu Items */}
        <div className='py-4'>
          
          <div className='px-6 py-2 text-xs font-bold text-cyan-600 uppercase tracking-widest flex items-center gap-2'>
            <span className='w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]'></span>
            {t.footprint}
          </div>
          
          <MenuItem icon={Bookmark} label={t.saved} onClick={() => handleAction('saved')} />
          <MenuItem icon={Clock} label={t.recent} onClick={() => handleAction('recent')} />
          <MenuItem icon={Activity} label={t.contributions} onClick={() => handleAction('contributions')} />
          <MenuItem icon={Users} label={t.locationSharing} onClick={() => handleAction('location_sharing')} />
          <MenuItem icon={History} label={t.timeline} onClick={() => handleAction('timeline')} />
          <MenuItem icon={Shield} label={t.yourData} onClick={() => handleAction('your_data')} />

          <div className='my-4 border-t border-cyan-900/20 mx-6' />

          <MenuItem icon={Link} label={t.share} onClick={() => handleAction('share_embed')} />
          <MenuItem icon={Printer} label={t.print} onClick={() => handleAction('print')} />
          
          <div className='my-4 border-t border-cyan-900/20 mx-6' />

          <MenuItem icon={Store} label={t.addBusiness} onClick={() => handleAction('add_business')} />
          <MenuItem icon={Edit} label={t.editMap} onClick={() => handleAction('edit_map')} />
          
          <div className='my-4 border-t border-cyan-900/20 mx-6' />
          
          <MenuItem icon={Lightbulb} label={t.tips} onClick={() => handleAction('tips')} />
          <MenuItem icon={HelpCircle} label={t.help} onClick={() => handleAction('help')} />
          <MenuItem icon={Info} label={t.consumerInfo} onClick={() => handleAction('consumer_info')} />
          
          <div className='my-4 border-t border-cyan-900/20 mx-6' />

          <button 
            onClick={() => setShowLanguages(true)}
            className='w-full px-6 py-3 flex items-center hover:bg-gradient-to-r hover:from-cyan-900/20 hover:to-transparent text-cyan-100 transition-all text-left group border-l-2 border-transparent hover:border-cyan-400'
          >
            <Globe className='w-5 h-5 mr-4 text-cyan-700 group-hover:text-cyan-400 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' />
            <div className='flex-1'>
              <span className='text-sm font-medium group-hover:text-cyan-300 transition-colors'>{t.language}</span>
              <div className='text-xs text-cyan-600/70 mt-0.5 group-hover:text-cyan-500'>
                {LANGUAGES.find(l => l.code === currentLang)?.name}
              </div>
            </div>
            <ChevronRight className='w-4 h-4 text-cyan-800 group-hover:text-cyan-500 transition-colors group-hover:translate-x-1' />
          </button>

          <MenuItem icon={Settings} label={t.searchSettings} onClick={() => handleAction('search_settings')} />
          <MenuItem icon={History} label={t.mapHistory} onClick={() => handleAction('map_history')} />

        </div>
        
        <div className='p-6 text-xs text-center text-slate-500 bg-slate-950/50 mt-4 border-t border-cyan-900/20'>
          <p className='text-cyan-800'>{t.footer}</p>
          <div className='flex justify-center gap-4 mt-3'>
            <span className='hover:text-cyan-400 cursor-pointer transition-colors hover:underline decoration-cyan-500/30'>{t.privacy}</span>
            <span className='hover:text-cyan-400 cursor-pointer transition-colors hover:underline decoration-cyan-500/30'>{t.terms}</span>
          </div>
        </div>

      </div>

      {/* Language Modal */}
      {showLanguages && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in'>
          <div 
            className='absolute inset-0 bg-black/80 backdrop-blur-md'
            onClick={() => setShowLanguages(false)}
          />
          <div className='glass-panel rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden relative z-10 flex flex-col'>
            <div className='p-5 border-b border-cyan-900/30 flex items-center justify-between bg-slate-900/50'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-cyan-900/20 rounded-lg border border-cyan-500/20'>
                   <Languages className='w-5 h-5 text-cyan-400' />
                </div>
                <h2 className='text-lg font-bold text-cyan-50 tracking-wide'>{t.language}</h2>
              </div>
              <button 
                onClick={() => setShowLanguages(false)}
                className='p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-cyan-400'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            
            <div className='overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-3 custom-scrollbar'>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setShowLanguages(false);
                    handleAction('language:' + lang.code);
                  }}
                  className={`flex items-center p-4 rounded-xl border transition-all duration-300 group ${currentLang === lang.code ? 'border-cyan-500 bg-cyan-900/10' : 'border-slate-800 hover:border-cyan-700 hover:bg-slate-800/50'}`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 shrink-0 transition-colors ${currentLang === lang.code ? 'border-cyan-400' : 'border-slate-600 group-hover:border-cyan-600'}`}>
                    {currentLang === lang.code && <div className='w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]' />}
                  </div>
                  <div className='text-left min-w-0'>
                    <div className={`font-medium text-sm truncate transition-colors ${currentLang === lang.code ? 'text-cyan-100' : 'text-slate-300 group-hover:text-cyan-200'}`}>{lang.name}</div>
                    <div className='text-xs text-slate-500 group-hover:text-slate-400 truncate'>{lang.country}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className='w-full px-6 py-3 flex items-center hover:bg-gradient-to-r hover:from-cyan-900/20 hover:to-transparent text-cyan-100 transition-all text-left group border-l-2 border-transparent hover:border-cyan-400'
    >
      <Icon className='w-5 h-5 mr-4 text-cyan-700 group-hover:text-cyan-400 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' />
      <span className='text-sm font-medium group-hover:text-cyan-300 transition-colors'>{label}</span>
    </button>
  );
}
