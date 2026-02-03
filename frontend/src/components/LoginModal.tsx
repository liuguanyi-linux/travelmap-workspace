import React, { useState } from 'react';
import { X, Mail, Key, ArrowRight, Check, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => void;
  t: (path: string) => any;
}

export default function LoginModal({ isOpen, onClose, onLogin, t }: LoginModalProps) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('code');
      // In a real app, we would send the code here
      console.log('Code sent to', email); 
    }, 1500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    // Simulate verify
    setTimeout(() => {
      setIsLoading(false);
      // Accept any 6 digit code for demo
      if (code.length === 6) { 
         onLogin(email);
         onClose();
      } else {
         setError('Invalid code');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden relative">
        
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <X size={24} />
        </button>
        
        <div className="p-8 pt-10">
          <div className="text-center mb-10 relative">
            <div className="inline-block p-4 rounded-[1.5rem] bg-blue-50 dark:bg-gray-700 mb-6 shadow-sm">
               <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('login.title')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              {step === 'email' ? t('login.subtitle') : (t('login.sent') + ' ')}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block ml-1">{t('login.email')}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('login.placeholderEmail')}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-all hover:bg-gray-900 dark:hover:bg-gray-100"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>{t('login.sendCode')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block ml-1">{t('login.code')}</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all tracking-widest text-lg font-bold"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-medium ml-1"><X size={12} /> {error}</p>}
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-all hover:bg-gray-900 dark:hover:bg-gray-100"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>{t('login.verify')} <Check size={18} /></>}
              </button>
              <button 
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors font-medium py-2"
              >
                {t('common.back')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
