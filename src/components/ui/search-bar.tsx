import { StyleSheet, TextInput, View } from 'react-native';

import { hideWebOutline } from '@/components/ui/fields';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { fonts, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  const { colors, scheme } = useTheme();
  return (
    <View
      accessibilityRole="search"
      style={[styles.bar, { backgroundColor: colors.search, borderColor: colors.borderSoft }]}>
      <Icon name="search" size={22} color="textMuted" />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        keyboardAppearance={scheme}
        maxFontSizeMultiplier={1.3}
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.input, { color: colors.heading }, hideWebOutline]}
      />
      {value ? <IconButton icon="x" label="Clear search" size={18} color="textMuted" onPress={() => onChangeText('')} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
  },
  input: { flex: 1, alignSelf: 'stretch', fontFamily: fonts.regular, fontSize: 15, paddingVertical: 10 },
});
