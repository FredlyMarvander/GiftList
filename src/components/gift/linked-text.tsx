import * as WebBrowser from 'expo-web-browser';

import { AppText, type AppTextProps } from '@/components/ui/app-text';
import { useToast } from '@/providers/toast-provider';

/** Splits on web links only; other schemes are left as plain text. */
const LINK = /(https?:\/\/[^\s<>"']+)/gi;

/** Notes may contain shop links, so make them tappable. */
export function LinkedText({ children, ...rest }: Omit<AppTextProps, 'children'> & { children: string }) {
  const toast = useToast();
  const open = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      toast({ message: 'Could not open this link', icon: 'circle-alert' });
    }
  };

  return (
    <AppText {...rest}>
      {children.split(LINK).map((part, index) =>
        // With one capture group, every odd part is a link.
        index % 2 === 1 ? (
          <AppText
            key={index}
            variant={rest.variant}
            color="primaryText"
            accessibilityRole="link"
            onPress={() => open(part)}
            style={{ textDecorationLine: 'underline' }}>
            {part}
          </AppText>
        ) : (
          part
        ),
      )}
    </AppText>
  );
}
