import type { ReactNode, Ref } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { maxContentWidth, spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type ScreenProps = {
  header?: ReactNode;
  children: ReactNode;
  /** Floats above the content, e.g. the add button. */
  overlay?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scrollRef?: Ref<ScrollViewInstance>;
};

/** Browsers scroll while typing to keep the caret visible, which would count as a drag on web. */
export const keyboardDismissMode = Platform.select({ ios: 'interactive', android: 'on-drag', default: 'none' } as const);

/** Scrolling page with consistent gutters, safe areas and keyboard handling. */
export function Screen({ header, children, overlay, contentStyle, scrollRef }: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {header}
      {/* iOS insets the scroll view itself; Android is edge-to-edge and needs the padding. */}
      <KeyboardAvoidingView style={styles.fill} behavior="padding" enabled={Platform.OS === 'android'}>
        <ScrollView
          ref={scrollRef}
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={keyboardDismissMode}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xxl, paddingTop: header ? spacing.sm : insets.top + spacing.sm },
            contentStyle,
          ]}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
  },
});
