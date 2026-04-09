import { X, Cpu, AlertTriangle, Terminal } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string | null;
  t: any;
}

export default function ActionModal({ isOpen, onClose, action, t }: ActionModalProps) {
  if (!isOpen) return null;

  let title = t.modal.demo;
  let content = t.modal.demoText;
  let icon = <Cpu className='w-8 h-8 text-cyan-400 mb-2' />;

  if (action === 'recent') {
      title = t.modal.recentSearch;
      content = t.modal.noHistory;
      icon = <Terminal className='w-8 h-8 text-purple-400 mb-2' />;
  } else if (action === 'contributions') {
      title = t.modal.yourContributions;
      content = t.modal.noContributions;
      icon = <AlertTriangle className='w-8 h-8 text-pink-400 mb-2' />;
  } else if (action === 'more_categories') {
      title = t.modal.moreCategories;
      content = t.modal.demoText;
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] max-w-sm w-full p-8 relative shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center text-center mb-6 mt-2">
          <div className="p-5 bg-blue-50 dark:bg-gray-700 rounded-[1.5rem] shadow-sm mb-4">
            {action === 'recent' ? <Terminal className='w-8 h-8 text-blue-600 dark:text-blue-400' /> : 
             action === 'contributions' ? <AlertTriangle className='w-8 h-8 text-orange-500' /> :
             <Cpu className='w-8 h-8 text-blue-600 dark:text-blue-400' />}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center leading-relaxed px-4">{content}</p>
        
        <button onClick={onClose} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-all hover:bg-gray-900 dark:hover:bg-gray-100">
          <span className="relative z-10">ACKNOWLEDGE</span>
        </button>
      </div>
    </div>
  );
}
