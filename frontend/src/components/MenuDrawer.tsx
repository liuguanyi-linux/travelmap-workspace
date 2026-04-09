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
      <div className='fixed top-0 left-0 h-full w-80 bg-[#f8f9fa] z-50 shadow-[0_0_50px_rgba(0,0,0,0.15)] overflow-y-auto transform transition-transform duration-300 ease-in-out animate-slide-in border-r border-gray-200'>
        
        {/* Header */}
        <div className='p-6 border-b border-gray-200 flex items-center justify-between bg-[#f8f9fa] relative overflow-hidden'>
          
          <div className='flex items-center gap-3 relative z-10'>
            <div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-800 font-bold shadow-sm border border-gray-200'>
              <span className='bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent'>A</span>
            </div>
            <span className='text-xl font-bold text-gray-800 tracking-wide'>안전넷</span>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-800 transition-colors relative z-10'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Menu Items */}
        <div className='py-4'>
          
          <div className='px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2'>
            <span className='w-2 h-2 rounded-full bg-blue-500'></span>
            {t.footprint}
          </div>
          
          <MenuItem icon={Bookmark} label={t.saved} onClick={() => handleAction('saved')} />
          <MenuItem icon={Clock} label={t.recent} onClick={() => handleAction('recent')} />
          <MenuItem icon={Activity} label={t.contributions} onClick={() => handleAction('contributions')} />
          <MenuItem icon={Users} label={t.locationSharing} onClick={() => handleAction('location_sharing')} />
          <MenuItem icon={History} label={t.timeline} onClick={() => handleAction('timeline')} />
          <MenuItem icon={Shield} label={t.yourData} onClick={() => handleAction('your_data')} />

          <div className='my-4 border-t border-gray-200 mx-6' />

          <MenuItem icon={Link} label={t.share} onClick={() => handleAction('share_embed')} />
          <MenuItem icon={Printer} label={t.print} onClick={() => handleAction('print')} />
          
          <div className='my-4 border-t border-gray-200 mx-6' />

          <MenuItem icon={Store} label={t.addBusiness} onClick={() => handleAction('add_business')} />
          <MenuItem icon={Edit} label={t.editMap} onClick={() => handleAction('edit_map')} />
          
          <div className='my-4 border-t border-gray-200 mx-6' />
          
          <MenuItem icon={Lightbulb} label={t.tips} onClick={() => handleAction('tips')} />
          <MenuItem icon={HelpCircle} label={t.help} onClick={() => handleAction('help')} />
          <MenuItem icon={Info} label={t.consumerInfo} onClick={() => handleAction('consumer_info')} />
          
          <div className='my-4 border-t border-gray-200 mx-6' />

          <MenuItem icon={Globe} label={t.language} onClick={() => setShowLanguages(!showLanguages)} rightIcon={<ChevronRight className={`w-4 h-4 transition-transform ${showLanguages ? 'rotate-90' : ''}`} />} />
          
          {showLanguages && (
            <div className='bg-white py-2 shadow-inner border-y border-gray-100'>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    handleAction('language:' + lang.code);
                    setShowLanguages(false);
                  }}
                  className={`w-full text-left px-12 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    currentLang === lang.code ? 'text-blue-600 bg-blue-50/50 font-medium' : 'text-gray-600'
                  }`}
                >
                  <span className="text-sm">{lang.name}</span>
                  {currentLang === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                </button>
              ))}
            </div>
          )}

          <MenuItem icon={Settings} label={t.searchSettings} onClick={() => handleAction('search_settings')} />
          <MenuItem icon={History} label={t.mapHistory} onClick={() => handleAction('map_history')} />

        </div>
        
        <div className='p-6 text-xs text-center text-gray-500'>
          <p>{t.footer}</p>
          <div className='flex justify-center gap-4 mt-2'>
            <span className='hover:text-gray-800 cursor-pointer'>{t.privacy}</span>
            <span className='hover:text-gray-800 cursor-pointer'>{t.terms}</span>
          </div>
        </div>

      </div>
    </>
  );
}

function MenuItem({ icon: Icon, label, onClick, rightIcon }: { icon: any, label: string, onClick?: () => void, rightIcon?: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className='w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-gray-100 transition-all group'
    >
      <div className='flex items-center gap-4'>
        <Icon className='w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
        <span className='font-medium text-sm'>{label}</span>
      </div>
      {rightIcon && <div className="text-gray-400">{rightIcon}</div>}
    </button>
  );
}
