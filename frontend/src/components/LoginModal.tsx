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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="glass-panel rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] w-full max-w-md overflow-hidden relative border border-cyan-500/30">
        
        {/* Decorative header line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500"></div>

        <button onClick={onClose} className="absolute right-4 top-4 text-cyan-600 hover:text-cyan-300 transition-colors z-10">
          <X size={20} />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-8 relative">
            <div className="inline-block p-3 rounded-full bg-cyan-900/20 mb-4 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
               <Mail className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-cyan-50 mb-2 tracking-wide drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{t('login.title')}</h2>
            <p className="text-cyan-200/60 text-sm">
              {step === 'email' ? t('login.subtitle') : (t('login.sent') + ' ')}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">{t('login.email')}</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 text-cyan-600 group-focus-within:text-cyan-400 transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('login.placeholderEmail')}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-xl focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] outline-none text-cyan-100 placeholder-cyan-800 transition-all"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full cyber-button flex items-center justify-center gap-2 group py-3 rounded-xl"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>{t('login.sendCode')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">{t('login.code')}</label>
                <div className="relative group">
                  <Key className="absolute left-3 top-3 text-cyan-600 group-focus-within:text-cyan-400 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-xl focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] outline-none text-cyan-100 placeholder-cyan-800 transition-all tracking-widest text-lg"
                    required
                  />
                </div>
                {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><X size={12} /> {error}</p>}
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full cyber-button flex items-center justify-center gap-2 group py-3 rounded-xl"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>{t('login.verify')} <Check size={18} /></>}
              </button>
              <button 
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-cyan-600 hover:text-cyan-400 text-sm transition-colors hover:underline"
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
