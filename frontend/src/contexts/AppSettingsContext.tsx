import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

type SettingsMap = Record<string, string>;

interface Ctx {
  settings: SettingsMap;
  get: (key: string, fallback?: string) => string;
  update: (patch: SettingsMap) => Promise<void>;
  reload: () => Promise<void>;
}

const AppSettingsContext = createContext<Ctx>({
  settings: {},
  get: (_, f = '') => f,
  update: async () => {},
  reload: async () => {},
});

export const useAppSettings = () => useContext(AppSettingsContext);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsMap>(() => {
    try {
      return JSON.parse(localStorage.getItem('app_settings') || '{}');
    } catch {
      return {};
    }
  });

  const reload = useCallback(async () => {
    try {
      const { data } = await api.get<SettingsMap>('/app-settings');
      setSettings(data || {});
      localStorage.setItem('app_settings', JSON.stringify(data || {}));
    } catch {}
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const update = useCallback(async (patch: SettingsMap) => {
    const { data } = await api.put<SettingsMap>('/app-settings', patch);
    setSettings(data || {});
    localStorage.setItem('app_settings', JSON.stringify(data || {}));
  }, []);

  const get = useCallback((key: string, fallback = '') => settings[key] ?? fallback, [settings]);

  return (
    <AppSettingsContext.Provider value={{ settings, get, update, reload }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
