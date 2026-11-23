import { createContext, use, useCallback, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon-data';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  icon?: IconName;
  destructive?: boolean;
};

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

/** Promise-based dialog that looks the same on iOS, Android and web. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [request, setRequest] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null);

  const confirm = useCallback<Confirm>(
    (options) =>
      new Promise((resolve) => {
        setRequest({ ...options, resolve });
        setVisible(true);
      }),
    [],
  );

  const answer = (value: boolean) => {
    setVisible(false);
    request?.resolve(value);
  };

  const tone = request?.destructive ? 'danger' : 'primaryText';

  return (
    <ConfirmContext value={confirm}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => answer(false)}>
        <View style={styles.root}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            onPress={() => answer(false)}
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          />
          {request ? (
            <View
              accessibilityRole="alert"
              accessibilityViewIsModal
              style={[styles.dialog, { backgroundColor: colors.surface }]}>
              {request.icon ? (
                <View
                  style={[
                    styles.icon,
                    { backgroundColor: request.destructive ? colors.dangerSoft : colors.primarySoft },
                  ]}>
                  <Icon name={request.icon} size={26} color={tone} />
                </View>
              ) : null}
              <AppText variant="heading" color="heading" align="center">
                {request.title}
              </AppText>
              <AppText variant="body" color="textMuted" align="center">
                {request.message}
              </AppText>
              <View style={styles.actions}>
                <Button
                  label={request.cancelLabel ?? 'Cancel'}
                  variant="soft"
                  onPress={() => answer(false)}
                  style={styles.action}
                />
                <Button
                  label={request.confirmLabel}
                  variant={request.destructive ? 'danger' : 'primary'}
                  onPress={() => answer(true)}
                  style={styles.action}
                />
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </ConfirmContext>
  );
}

export function useConfirm(): Confirm {
  const confirm = use(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used inside ConfirmProvider');
  return confirm;
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  dialog: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actions: { flexDirection: 'row', gap: spacing.md, alignSelf: 'stretch', marginTop: spacing.md },
  action: { flex: 1, paddingHorizontal: spacing.sm },
});
