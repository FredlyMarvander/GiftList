import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, use, useEffect, useMemo, type ReactNode } from 'react';
import { Appearance, Platform, useColorScheme } from 'react-native';

import { themes, type ColorScheme, type ThemeColors } from '@/constants/theme';
import { useGifts } from '@/providers/gifts-provider';

type Theme = { colors: ThemeColors; scheme: ColorScheme };

const ThemeContext = createContext<Theme>({ colors: themes.light, scheme: 'light' });

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const { settings } = useGifts();
  const scheme: ColorScheme = settings.theme === 'system' ? (systemScheme ?? 'light') : settings.theme;
  const colors = themes[scheme];

  // Native parts (keyboard, share sheet, switches) follow the same choice.
  useEffect(() => {
    if (Platform.OS !== 'web') Appearance.setColorScheme(settings.theme === 'system' ? 'auto' : settings.theme);
  }, [settings.theme]);

  const theme = useMemo(() => ({ colors, scheme }), [colors, scheme]);

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.borderSoft,
      },
    };
  }, [colors, scheme]);

  return (
    <ThemeContext value={theme}>
      <NavigationThemeProvider value={navigationTheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        {children}
      </NavigationThemeProvider>
    </ThemeContext>
  );
}

export function useTheme(): Theme {
  return use(ThemeContext);
}
