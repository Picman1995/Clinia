import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { Colors, ThemeName } from '@/constants/Colors';

const STORAGE_KEY = 'clinia.themePreference';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  preference: ThemePreference;
  colorScheme: ThemeName;
  colors: (typeof Colors)[ThemeName];
  setPreference: (value: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && (value === 'light' || value === 'dark' || value === 'system')) {
          setPreferenceState(value);
        }
      } catch {
        // Expo Go / web sin módulo nativo: seguir con system
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback(async (value: ThemePreference) => {
    setPreferenceState(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Preferencia en memoria si el storage no está disponible
    }
  }, []);

  const colorScheme: ThemeName =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo(
    () => ({
      preference,
      colorScheme,
      colors: Colors[colorScheme],
      setPreference,
    }),
    [preference, colorScheme, setPreference]
  );

  if (!ready) {
    return (
      <ThemeContext.Provider
        value={{
          preference: 'system',
          colorScheme: 'light',
          colors: Colors.light,
          setPreference,
        }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  }
  return context;
}
