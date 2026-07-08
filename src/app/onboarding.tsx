import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/components/exercises/exercise-footer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { AVATAR_BASES } from '@/data/wardrobe';
import { track } from '@/lib/analytics';
import { fetchRemoteProfile } from '@/lib/sync';
import { levelForXp, useProfile, type RemoteProfile } from '@/state/profile';

const MOTIVATIONS = [
  { id: 'heritage', emoji: '🌍', label: 'Connect with my heritage' },
  { id: 'family', emoji: '👵🏾', label: 'Speak with family' },
  { id: 'partner', emoji: '❤️', label: 'My partner speaks Yorùbá' },
  { id: 'culture', emoji: '🎶', label: 'Music, film & culture' },
] as const;

type Step = 'welcome' | 'motivation' | 'avatar';

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, restoreFromRemote } = useProfile();
  const [step, setStep] = useState<Step>('welcome');
  const [motivation, setMotivation] = useState<string | null>(null);
  const [base, setBase] = useState(AVATAR_BASES[0]);
  const [remote, setRemote] = useState<RemoteProfile | null>(null);

  useEffect(() => {
    // Restore-on-reinstall: quietly check for previous progress on this device.
    fetchRemoteProfile().then(setRemote);
  }, []);

  const finish = (skipToPath: boolean) => {
    completeOnboarding(motivation, base);
    track('onboarding_completed', { motivation });
    if (skipToPath) {
      router.replace('/');
    } else {
      router.replace('/lesson/tones-1');
    }
  };

  const restore = () => {
    if (!remote) return;
    restoreFromRemote(remote);
    router.replace('/');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {step === 'welcome' && (
          <View style={styles.step}>
            <ThemedText style={styles.hero}>🔥</ThemedText>
            <ThemedText type="title" style={styles.centered}>
              BreakBarriers
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centered}>
              Learn Yorùbá by living in it. Lessons, real tones, and a streak worth protecting.
            </ThemedText>
            <PrimaryButton label="Bẹ̀rẹ̀! (Start)" onPress={() => setStep('motivation')} />
            {remote && (
              <Pressable accessibilityRole="button" onPress={restore} style={styles.linkButton}>
                <ThemedText type="smallBold" style={{ color: Palette.indigo }}>
                  Restore my progress (Level {levelForXp(remote.xp)}, {remote.xp} XP) →
                </ThemedText>
              </Pressable>
            )}
          </View>
        )}

        {step === 'motivation' && (
          <View style={styles.step}>
            <ThemedText type="subtitle" style={styles.centered}>
              Why Yorùbá?
            </ThemedText>
            <View style={styles.options}>
              {MOTIVATIONS.map((m) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={m.label}
                  accessibilityState={{ selected: motivation === m.id }}
                  key={m.id}
                  onPress={() => setMotivation(m.id)}
                  style={[styles.option, motivation === m.id && styles.optionSelected]}>
                  <ThemedView type="backgroundElement" style={styles.optionInner}>
                    <ThemedText style={styles.optionEmoji}>{m.emoji}</ThemedText>
                    <ThemedText type="smallBold">{m.label}</ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </View>
            <PrimaryButton
              label="Continue"
              disabled={!motivation}
              onPress={() => setStep('avatar')}
            />
          </View>
        )}

        {step === 'avatar' && (
          <View style={styles.step}>
            <ThemedText type="subtitle" style={styles.centered}>
              Pick your avatar
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
              Earn cowries 🐚 to dress them in aṣọ òkè, gèlè, and more.
            </ThemedText>
            <View style={styles.baseRow}>
              {AVATAR_BASES.map((b, i) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Avatar option ${i + 1}`}
                  accessibilityState={{ selected: base === b }}
                  key={b}
                  onPress={() => setBase(b)}
                  style={[styles.baseChoice, base === b && styles.baseSelected]}>
                  <ThemedText style={styles.baseEmoji}>{b}</ThemedText>
                </Pressable>
              ))}
            </View>
            <PrimaryButton label="Start my first lesson" onPress={() => finish(false)} />
            <Pressable accessibilityRole="button" onPress={() => finish(true)} style={styles.linkButton}>
              <ThemedText type="small" themeColor="textSecondary">
                Skip — explore first
              </ThemedText>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.primaryButton, { backgroundColor: disabled ? '#AFAFAF' : Palette.green }]}>
      <ThemedText style={styles.primaryLabel}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  step: {
    gap: Spacing.four,
    alignItems: 'stretch',
  },
  hero: {
    fontSize: 72,
    lineHeight: 84,
    textAlign: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  options: {
    gap: Spacing.two,
  },
  option: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: Palette.indigo,
  },
  optionInner: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  optionEmoji: {
    fontSize: 26,
    lineHeight: 32,
  },
  baseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  baseChoice: {
    borderRadius: 14,
    padding: Spacing.one,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  baseSelected: {
    borderColor: Palette.indigo,
  },
  baseEmoji: {
    fontSize: 40,
    lineHeight: 50,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
