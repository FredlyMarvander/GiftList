import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon-data';
import { Touchable } from '@/components/ui/touchable';
import { maxContentWidth, radius, spacing, touchTarget } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type ToastOptions = {
  message: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  /** Runs when the toast goes away without its action being used. */
  onDismiss?: () => void;
};

type ActiveToast = ToastOptions & { id: number };

const VISIBLE_MS = 4500;
/** Keeps the toast above the floating add button. */
const BOTTOM_OFFSET = 92;

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const active = useRef<ActiveToast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nextId = useRef(0);

  const close = useCallback((usedAction: boolean) => {
    clearTimeout(timer.current);
    const closing = active.current;
    active.current = null;
    setToast(null);
    if (!closing) return;
    if (usedAction) closing.onAction?.();
    else closing.onDismiss?.();
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      close(false);
      nextId.current += 1;
      const next = { ...options, id: nextId.current };
      active.current = next;
      setToast(next);
      timer.current = setTimeout(() => close(false), VISIBLE_MS);
    },
    [close],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext value={value}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={[styles.layer, { bottom: insets.bottom + BOTTOM_OFFSET }]}>
          <Animated.View
            key={toast.id}
            entering={FadeInDown.duration(220)}
            exiting={FadeOutDown.duration(180)}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[styles.toast, { backgroundColor: colors.toast, boxShadow: `0px 10px 24px ${colors.shadow}` }]}>
            {toast.icon ? <Icon name={toast.icon} size={20} color="onToast" /> : null}
            <AppText variant="bodyMedium" color="onToast" style={styles.message}>
              {toast.message}
            </AppText>
            {toast.actionLabel ? (
              <Touchable onPress={() => close(true)} accessibilityLabel={toast.actionLabel} style={styles.action}>
                <AppText variant="bodyStrong" style={styles.actionText}>
                  {toast.actionLabel}
                </AppText>
              </Touchable>
            ) : null}
          </Animated.View>
        </View>
      ) : null}
    </ToastContext>
  );
}

export function useToast() {
  const show = use(ToastContext);
  if (!show) throw new Error('useToast must be used inside ToastProvider');
  return show;
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: spacing.xl },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    width: '100%',
    maxWidth: maxContentWidth - spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  message: { flex: 1, paddingVertical: spacing.md },
  action: { minHeight: touchTarget, justifyContent: 'center', paddingHorizontal: spacing.xs },
  actionText: { color: '#F5B9D2' },
});
