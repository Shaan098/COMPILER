import { useContext } from 'react';
import { createContext } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);
