/**
 * Design tokens for GiftList.
 *
 * Colors were sampled from the Figma mockups. Text colors that missed WCAG AA
 * contrast in the mockup (placeholders, tagline, status pills) are darkened
 * while keeping the same hue.
 */

const light = {
  background: '#FCFAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F3F9',
  surfaceSunken: '#EAEAF0',
  border: '#C7C5D2',
  borderSoft: '#E8E6EF',
  borderStrong: '#8C8AAF',
  fieldBorder: '#D5D2E2',
  search: '#F0EFFA',

  heading: '#14112B',
  text: '#2E2A70',
  textStrong: '#1B1342',
  textMuted: '#69658A',
  placeholder: '#737090',

  primary: '#695DDF',
  onPrimary: '#FFFFFF',
  primarySoft: '#E6E0F8',
  onPrimarySoft: '#2E2A70',
  primaryBorder: '#534E8B',
  primaryText: '#5146BE',

  pink: '#E89FBF',
  heart: '#F1B2CE',

  hero: '#FDF2F5',
  heroBadge: '#FFFFFF',
  heroLabel: '#514A72',
  heroDate: '#675F8E',
  rose: '#B5375B',
  roseSoft: '#FBE3EA',

  danger: '#8B4965',
  dangerSoft: '#F4E7F0',
  dangerBorder: '#C488A5',
  error: '#BE2C4C',

  success: '#1F6B48',
  successSoft: '#DCF2E6',
  successBorder: '#9CD3B7',

  warning: '#86480A',
  warningSoft: '#FFF3E0',
  warningBorder: '#F0CB97',

  ideaBg: '#F5E8F0',
  ideaText: '#8B4965',
  plannedBg: '#E6E0F8',
  plannedText: '#5A4F9A',
  boughtBg: '#DCF2E6',
  boughtText: '#1F6B48',
  givenBg: '#DFE9FB',
  givenText: '#2F5A9E',

  chipBg: '#F8E8F2',
  chipText: '#A0447A',

  /** Two-series chart colors, checked for color-blind separation on `surface`. */
  chartSpent: '#695DDF',
  chartToBuy: '#D9669A',

  quote: '#5F5886',
  overlay: 'rgba(20, 17, 43, 0.5)',
  shadow: 'rgba(46, 42, 112, 0.14)',
  toast: '#2B2656',
  onToast: '#FFFFFF',
};

export type ThemeColors = Record<keyof typeof light, string>;
export type ColorToken = keyof ThemeColors;
export type ColorScheme = 'light' | 'dark';

const dark: ThemeColors = {
  background: '#141229',
  surface: '#1E1B3A',
  surfaceMuted: '#1B1835',
  surfaceSunken: '#282449',
  border: '#3A3561',
  borderSoft: '#2C2850',
  borderStrong: '#7F7AB0',
  fieldBorder: '#403B69',
  search: '#211E40',

  heading: '#F6F4FF',
  text: '#E4E0FF',
  textStrong: '#FFFFFF',
  textMuted: '#A8A3CB',
  placeholder: '#938EB8',

  primary: '#6F63E3',
  onPrimary: '#FFFFFF',
  primarySoft: '#2F2A5C',
  onPrimarySoft: '#DAD3FF',
  primaryBorder: '#6C62B8',
  primaryText: '#B4AAFF',

  pink: '#F0A9C8',
  heart: '#D887AC',

  hero: '#2E1C38',
  heroBadge: '#3D2648',
  heroLabel: '#D9CDEB',
  heroDate: '#BDB0D6',
  rose: '#FF9DB8',
  roseSoft: '#4A2438',

  danger: '#F2B5D0',
  dangerSoft: '#3A2338',
  dangerBorder: '#7D4A68',
  error: '#FF8FA8',

  success: '#8FE0B5',
  successSoft: '#163A2C',
  successBorder: '#2F6B51',

  warning: '#FFC98A',
  warningSoft: '#3B2A17',
  warningBorder: '#6E4F28',

  ideaBg: '#3A2338',
  ideaText: '#F2B5D0',
  plannedBg: '#2F2A5C',
  plannedText: '#C9C0FF',
  boughtBg: '#163A2C',
  boughtText: '#8FE0B5',
  givenBg: '#1D2F52',
  givenText: '#A9C8FF',

  chipBg: '#3B2138',
  chipText: '#F3ACD3',

  chartSpent: '#8378F0',
  chartToBuy: '#C9628F',

  quote: '#C3BDE4',
  overlay: 'rgba(6, 5, 18, 0.68)',
  shadow: 'rgba(0, 0, 0, 0.4)',
  toast: '#3A3470',
  onToast: '#FFFFFF',
};

export const themes: Record<ColorScheme, ThemeColors> = { light, dark };

/** Family names registered in the root layout. */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

/** Smallest comfortable touch target (Apple HIG 44pt, Material 48dp). */
export const touchTarget = 44;

/** Keeps the phone layout readable on tablets and desktop browsers. */
export const maxContentWidth = 560;
