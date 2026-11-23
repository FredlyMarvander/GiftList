import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { IconButton } from '@/components/ui/icon-button';
import { maxContentWidth, spacing, touchTarget } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  right?: ReactNode;
  backIcon?: 'arrow-left' | 'x';
};

export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Back button and title share one row so they line up, unlike the mockup. */
export function ScreenHeader({ title, right, backIcon = 'arrow-left' }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <IconButton
        icon={backIcon}
        label={backIcon === 'x' ? 'Close' : 'Go back'}
        onPress={goBack}
        size={26}
        color="heading"
      />
      <AppText
        variant="title"
        color="heading"
        align="center"
        numberOfLines={1}
        adjustsFontSizeToFit
        accessibilityRole="header"
        style={styles.title}>
        {title}
      </AppText>
      {right ?? <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
  },
  title: { flex: 1 },
  placeholder: { width: touchTarget },
});
