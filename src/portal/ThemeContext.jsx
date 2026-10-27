import React, { createContext, useContext, useState } from 'react';

export const dark = {
  // Surfaces
  pageBg:       '#0d0d0d',
  sidebarBg:    '#111111',
  cardBg:       'rgba(255,255,255,0.04)',
  inputBg:      'rgba(255,255,255,0.06)',
  modalBg:      '#1a1a1a',
  topbarBg:     '#111111',
  welcomeBg:    (accent) => `${accent}14`,
  welcomeBorder:(accent) => `${accent}26`,

  // Borders
  border:       'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.12)',
  borderInput:  'rgba(255,255,255,0.10)',

  // Text
  textPrimary:  '#ffffff',
  textSecondary:'rgba(255,255,255,0.55)',
  textMuted:    'rgba(255,255,255,0.35)',
  textFaint:    'rgba(255,255,255,0.20)',

  // Misc
  roleBadgeBg:  (c) => `${c}22`,
  tagBg:        'rgba(255,255,255,0.08)',
  tagText:      'rgba(255,255,255,0.5)',
  hoverBg:      'rgba(255,255,255,0.05)',
  deleteHover:  'rgba(239,68,68,0.10)',
  logoutBg:     'rgba(198,75,71,0.10)',
  logoutBorder: 'rgba(198,75,71,0.20)',
  scrollbarThumb: 'rgba(255,255,255,0.12)',
};

export const light = {
  // Surfaces
  pageBg:       '#f0f2f5',
  sidebarBg:    '#ffffff',
  cardBg:       '#ffffff',
  inputBg:      '#f8f9fb',
  modalBg:      '#ffffff',
  topbarBg:     '#ffffff',
  welcomeBg:    (accent) => `${accent}12`,
  welcomeBorder:(accent) => `${accent}30`,

  // Borders
  border:       'rgba(0,0,0,0.07)',
  borderStrong: 'rgba(0,0,0,0.14)',
  borderInput:  'rgba(0,0,0,0.12)',

  // Text
  textPrimary:  '#111111',
  textSecondary:'rgba(0,0,0,0.60)',
  textMuted:    'rgba(0,0,0,0.40)',
  textFaint:    'rgba(0,0,0,0.22)',

  // Misc
  roleBadgeBg:  (c) => `${c}18`,
  tagBg:        'rgba(0,0,0,0.06)',
  tagText:      'rgba(0,0,0,0.45)',
  hoverBg:      'rgba(0,0,0,0.03)',
  deleteHover:  'rgba(239,68,68,0.07)',
  logoutBg:     'rgba(198,75,71,0.08)',
  logoutBorder: 'rgba(198,75,71,0.18)',
  scrollbarThumb: 'rgba(0,0,0,0.14)',
};

const ThemeContext = createContext({ theme: dark, isDark: true, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? dark : light;
  const toggle = () => setIsDark(d => !d);
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
