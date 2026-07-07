/**
 * Avatar wardrobe. Emoji placeholders until commissioned art lands (Phase 0
 * design task); `asset` will point at real images then. Costs are in cowries
 * (owó ẹyọ), tiers unlock by level.
 */

export type WardrobeSlot = 'outfit' | 'head' | 'accessory';

export interface WardrobeItem {
  id: string;
  nameYo: string;
  nameEn: string;
  slot: WardrobeSlot;
  emoji: string;
  costCowries: number;
  unlockLevel: number;
}

export const WARDROBE: WardrobeItem[] = [
  { id: 'buba-basic', nameYo: 'Bùbá', nameEn: 'Everyday buba', slot: 'outfit', emoji: '👕', costCowries: 0, unlockLevel: 1 },
  { id: 'fila', nameYo: 'Fìlà', nameEn: 'Fila cap', slot: 'head', emoji: '🧢', costCowries: 30, unlockLevel: 2 },
  { id: 'gele', nameYo: 'Gèlè', nameEn: 'Gele headwrap', slot: 'head', emoji: '👒', costCowries: 30, unlockLevel: 2 },
  { id: 'beads-coral', nameYo: 'Ìlẹ̀kẹ̀ iyùn', nameEn: 'Coral beads', slot: 'accessory', emoji: '📿', costCowries: 50, unlockLevel: 3 },
  { id: 'aso-oke', nameYo: 'Aṣọ òkè', nameEn: 'Aso-oke outfit', slot: 'outfit', emoji: '🥻', costCowries: 80, unlockLevel: 4 },
  { id: 'talking-drum', nameYo: 'Dùndún', nameEn: 'Talking drum', slot: 'accessory', emoji: '🥁', costCowries: 100, unlockLevel: 5 },
  { id: 'agbada', nameYo: 'Agbádá', nameEn: 'Agbada robe', slot: 'outfit', emoji: '🥋', costCowries: 150, unlockLevel: 6 },
];

export interface AvatarConfig {
  base: string; // emoji face
  outfit?: string;
  head?: string;
  accessory?: string;
}

export const AVATAR_BASES = ['🙂', '😀', '😎', '🥰', '🧐', '😌'];

export const defaultAvatar: AvatarConfig = { base: '🙂', outfit: 'buba-basic' };
