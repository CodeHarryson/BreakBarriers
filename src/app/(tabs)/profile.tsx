import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/components/exercises/exercise-footer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { AVATAR_BASES, WARDROBE, type WardrobeSlot } from '@/data/wardrobe';
import { effectiveStreak } from '@/lib/streak';
import { levelForXp, useProfile, XP_PER_LEVEL } from '@/state/profile';

export default function ProfileScreen() {
  const { xp, cowries, streak, avatar, ownedItems, buyItem, equipItem, setAvatarBase } =
    useProfile();
  const level = levelForXp(xp);

  const equippedEmoji = (slot: WardrobeSlot) => {
    const id = avatar[slot];
    return id ? WARDROBE.find((w) => w.id === id)?.emoji : undefined;
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedView type="backgroundElement" style={styles.avatarCard}>
            <ThemedText style={styles.avatarFace}>{avatar.base}</ThemedText>
            <View style={styles.avatarSlots}>
              {(['head', 'outfit', 'accessory'] as const).map((slot) => (
                <ThemedText key={slot} style={styles.slotEmoji}>
                  {equippedEmoji(slot) ?? '·'}
                </ThemedText>
              ))}
            </View>
            <ThemedText type="smallBold">Level {level}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP to level {level + 1}
            </ThemedText>
          </ThemedView>

          <View style={styles.statsRow}>
            <Stat label="Iná (streak)" value={`🔥 ${effectiveStreak(streak)}`} />
            <Stat label="Longest" value={`${streak.longest}`} />
            <Stat label="Cowries" value={`🐚 ${cowries}`} />
            <Stat label="Freezes" value={`🧊 ${streak.freezes}`} />
          </View>

          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
            FACE
          </ThemedText>
          <View style={styles.baseRow}>
            {AVATAR_BASES.map((base) => (
              <Pressable
                accessibilityRole="button"
                key={base}
                onPress={() => setAvatarBase(base)}
                style={[styles.baseChoice, avatar.base === base && styles.baseSelected]}>
                <ThemedText style={styles.baseEmoji}>{base}</ThemedText>
              </Pressable>
            ))}
          </View>

          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
            AṢỌ (WARDROBE)
          </ThemedText>
          {WARDROBE.map((item) => {
            const owned = ownedItems.includes(item.id);
            const equipped = avatar[item.slot] === item.id;
            const locked = level < item.unlockLevel;
            return (
              <ThemedView key={item.id} type="backgroundElement" style={styles.itemRow}>
                <ThemedText style={styles.itemEmoji}>{item.emoji}</ThemedText>
                <View style={styles.itemText}>
                  <ThemedText type="smallBold">
                    {item.nameYo} · {item.nameEn}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {locked
                      ? `Unlocks at level ${item.unlockLevel}`
                      : owned
                        ? item.slot
                        : `🐚 ${item.costCowries}`}
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  disabled={locked || (owned && equipped && item.costCowries === 0)}
                  onPress={() => {
                    if (!owned) {
                      buyItem(item.id);
                    } else {
                      equipItem(equipped ? null : item.id, item.slot);
                    }
                  }}
                  style={[
                    styles.itemButton,
                    {
                      backgroundColor: locked
                        ? '#AFAFAF'
                        : equipped
                          ? Palette.indigo
                          : owned
                            ? Palette.green
                            : cowries >= item.costCowries
                              ? Palette.amber
                              : '#AFAFAF',
                    },
                  ]}>
                  <ThemedText type="smallBold" style={styles.itemButtonLabel}>
                    {locked ? '🔒' : equipped ? 'Equipped' : owned ? 'Equip' : 'Buy'}
                  </ThemedText>
                </Pressable>
              </ThemedView>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.stat}>
      <ThemedText type="smallBold">{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
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
  },
  scroll: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  avatarCard: {
    borderRadius: 24,
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  avatarFace: {
    fontSize: 72,
    lineHeight: 84,
  },
  avatarSlots: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  slotEmoji: {
    fontSize: 24,
    lineHeight: 30,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  stat: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  baseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  baseChoice: {
    borderRadius: 12,
    padding: Spacing.one,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  baseSelected: {
    borderColor: Palette.indigo,
  },
  baseEmoji: {
    fontSize: 32,
    lineHeight: 40,
  },
  itemRow: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  itemEmoji: {
    fontSize: 28,
    lineHeight: 36,
  },
  itemText: {
    flex: 1,
    gap: Spacing.half,
  },
  itemButton: {
    borderRadius: 12,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  itemButtonLabel: {
    color: '#fff',
  },
});
