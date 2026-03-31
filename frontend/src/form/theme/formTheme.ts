// src/form/theme/formTheme.ts

export const formFontNames = {
  Inter: 'Inter',
  Roboto: 'Roboto',
  OpenSans: 'Open Sans',
  Lato: 'Lato',
  Montserrat: 'Montserrat',
  SourceSansPro: 'Source Sans Pro',
  Poppins: 'Poppins',
  Raleway: 'Raleway',
  NotoSans: 'Noto Sans',
  Ubuntu: 'Ubuntu',
} as const;
export type formFontName = (typeof formFontNames)[keyof typeof formFontNames];

export const formThemeColors = {
  Default: 'default',
  Red: 'red',
  Orange: 'orange',
  Yellow: 'yellow',
  Green: 'green',
  Blue: 'blue',
  // Indigo: 'indigo',
  Purple: 'purple',
  Pink: 'pink',
  // Gray: 'gray',
} as const;
export type formThemeColor =
  (typeof formThemeColors)[keyof typeof formThemeColors];

export const formThemeModes = {
  Light: 'light',
  Dark: 'dark',
} as const;
export type formThemeMode =
  (typeof formThemeModes)[keyof typeof formThemeModes];

export const DEFAULT_FORM_THEME = {
  color: formThemeColors.Red,
  mode: formThemeModes.Light,
  headingFont: { family: formFontNames.Inter },
  bodyFont: { family: formFontNames.Inter },
} as const;
