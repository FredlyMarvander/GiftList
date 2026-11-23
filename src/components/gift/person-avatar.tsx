import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { fonts } from '@/constants/theme';
import { initials, personKey } from '@/lib/names';

const TONES = [
  { bg: '#FBD9E7', fg: '#9B2F62' },
  { bg: '#DDD5FA', fg: '#4A3DB8' },
  { bg: '#CDEEDF', fg: '#1B6B4F' },
  { bg: '#D3E4FB', fg: '#28548F' },
  { bg: '#FBE3C6', fg: '#8A4F0C' },
  { bg: '#F6D3D8', fg: '#943240' },
];

/** The same person always gets the same color. */
function toneFor(name: string) {
  const sum = [...personKey(name)].reduce((total, letter) => total + letter.charCodeAt(0), 0);
  return TONES[sum % TONES.length];
}

export function PersonAvatar({ name, size }: { name: string; size: number }) {
  const tone = toneFor(name);
  return (
    <View
      aria-hidden
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: tone.bg }]}>
      <AppText
        maxFontSizeMultiplier={1}
        style={{ fontFamily: fonts.bold, fontSize: size * 0.38, lineHeight: size * 0.5, color: tone.fg }}>
        {initials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({ avatar: { alignItems: 'center', justifyContent: 'center' } });
