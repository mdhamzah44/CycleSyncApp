import React, { createContext, useContext, useState } from 'react';
import { COLORS } from '../constants/theme';

interface ThemeContextType {
  isDark: boolean;
  colors: typeof COLORS.light;
  primaryColor: string;
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(COLORS.primary);

  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <ThemeContext.Provider value={{
      isDark,
      colors,
      primaryColor,
      toggleTheme: () => setIsDark(p => !p),
      setPrimaryColor,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
