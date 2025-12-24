'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode, createContext, useContext, useState, useEffect } from 'react';

// Accent color options
export const ACCENT_COLORS = [
  { name: 'Blue', value: '#3b82f6', class: 'accent-blue' },
  { name: 'Purple', value: '#8b5cf6', class: 'accent-purple' },
  { name: 'Green', value: '#22c55e', class: 'accent-green' },
  { name: 'Orange', value: '#f97316', class: 'accent-orange' },
  { name: 'Pink', value: '#ec4899', class: 'accent-pink' },
  { name: 'Red', value: '#ef4444', class: 'accent-red' },
  { name: 'Teal', value: '#14b8a6', class: 'accent-teal' },
  { name: 'Yellow', value: '#eab308', class: 'accent-yellow' },
] as const;

type AccentColor = (typeof ACCENT_COLORS)[number]['value'];

interface ThemeContextValue {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useAccentColor() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAccentColor must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultAccentColor?: AccentColor;
}

export function ThemeProvider({
  children,
  defaultAccentColor = '#3b82f6',
}: ThemeProviderProps) {
  const [accentColor, setAccentColorState] = useState<AccentColor>(defaultAccentColor);
  const [mounted, setMounted] = useState(false);

  // Load accent color from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('accentColor') as AccentColor | null;
    if (saved && ACCENT_COLORS.some((c) => c.value === saved)) {
      setAccentColorState(saved);
    }
  }, []);

  // Apply accent color CSS variables
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Set the accent color as CSS variable
    root.style.setProperty('--accent-color', accentColor);
    
    // Calculate lighter/darker variants
    const hex = accentColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Lighter variant (for hover states)
    root.style.setProperty(
      '--accent-color-light',
      `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`
    );
    
    // Darker variant (for active states)
    root.style.setProperty(
      '--accent-color-dark',
      `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`
    );
    
    // RGB values for opacity usage
    root.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
  }, [accentColor, mounted]);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem('accentColor', color);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    );
  }

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
}
