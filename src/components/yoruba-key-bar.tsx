import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Yorùbá character bar for free-text input. Two rows:
 *  - under-dot letters and the digraph gb
 *  - combining tone marks applied to whatever vowel precedes them
 * Tone marks (◌́ ◌̀) are inserted as combining characters after the cursor's
 * last character, so "e" + acute → "é". Callers append to a controlled value.
 */

const LETTERS = ['ẹ', 'ọ', 'ṣ', 'gb', 'ẹ́', 'ọ́', 'ń'];
const TONE_MARKS: { label: string; char: string }[] = [
  { label: '◌́', char: '́' }, // acute — high tone
  { label: '◌̀', char: '̀' }, // grave — low tone
];

interface Props {
  onInsert: (text: string) => void;
  onToneMark: (combining: string) => void;
}

export function YorubaKeyBar({ onInsert, onToneMark }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {LETTERS.map((ch) => (
        <Key key={ch} label={ch} bg={theme.backgroundElement} onPress={() => onInsert(ch)} />
      ))}
      {TONE_MARKS.map((t) => (
        <Key
          key={t.char}
          label={t.label}
          bg={theme.backgroundSelected}
          onPress={() => onToneMark(t.char)}
        />
      ))}
    </View>
  );
}

function Key({ label, bg, onPress }: { label: string; bg: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Insert ${label}`}
      onPress={onPress}
      style={[styles.key, { backgroundColor: bg }]}>
      <ThemedText type="smallBold" style={styles.keyLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

/** Apply a combining tone mark to the last base character of `value` (→ NFC). */
export function applyToneMark(value: string, combining: string): string {
  if (value.length === 0) return value;
  return (value + combining).normalize('NFC');
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  key: {
    minWidth: 44,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    alignItems: 'center',
  },
  keyLabel: {
    fontSize: 18,
  },
});
