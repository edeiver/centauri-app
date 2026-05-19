import { borderRadius } from './borderRadius';
import { darkColors, lightColors } from './colors';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { fontFamilies, typography } from './typography';

export const darkTheme = {
  name: 'Centauri App',
  mode: 'dark',
  colors: darkColors,
  spacing,
  typography,
  fontFamilies,
  borderRadius,
  shadows,
};

export const lightTheme = {
  name: 'Luminous Celestial',
  mode: 'light',
  colors: lightColors,
  spacing,
  typography,
  fontFamilies,
  borderRadius,
  shadows,
};

export const themes = {
  dark: darkTheme,
  light: lightTheme,
};
