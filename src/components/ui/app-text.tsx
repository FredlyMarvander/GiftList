import { StyleSheet, Text, type TextProps } from 'react-native';

import { fonts, type ColorToken } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

const variants = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  subheading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 23 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
});

export type AppTextVariant = keyof typeof variants;

export type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

export function AppText({ variant = 'body', color = 'text', align, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      maxFontSizeMultiplier={1.4}
      {...rest}
      style={[variants[variant], { color: colors[color] }, align && { textAlign: align }, style]}
    />
  );
}
