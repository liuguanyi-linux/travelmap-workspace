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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-panel rounded-2xl max-w-sm w-full p-6 relative">
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 rounded-tl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500 rounded-br-lg"></div>
        
        <button onClick={onClose} className="absolute right-4 top-4 text-cyan-600 hover:text-cyan-300 transition-colors">
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center text-center mb-6 mt-2">
          <div className="p-3 bg-slate-800/50 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            {icon}
          </div>
          <h3 className="text-xl font-bold mt-4 text-cyan-50 tracking-wide drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">{title}</h3>
        </div>
        
        <p className="text-cyan-200/80 mb-8 text-center leading-relaxed border-l-2 border-cyan-500/20 pl-4">{content}</p>
        
        <button onClick={onClose} className="w-full cyber-button text-center flex items-center justify-center">
          <span className="relative z-10">ACKNOWLEDGE</span>
        </button>
      </div>
    </div>
  );
}
