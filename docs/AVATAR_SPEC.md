# Avatar System Spec — Layered 2D

*Decision context: Memoji/Animoji have no third-party API, and face-scan avatars would
bypass the cowrie wardrobe economy (our core reward loop). Instead: a layered 2D system
where users assemble a likeness — 80% of "it's me!" at 5% of the cost. This spec exists
so commissioned art supports it from day one (Sprint 4 🔑 decision).*

## Layer stack (bottom → top)

| # | Layer | Options at launch | Source |
|---|---|---|---|
| 1 | Body/skin | 8 skin tones (warm-undertone range; melanin-rich shades are the majority, not an afterthought) | identity picker (free) |
| 2 | Face | 4 face shapes × neutral/smile expressions | identity picker (free) |
| 3 | Eyes & brows | 4 styles | identity picker (free) |
| 4 | Hair | 10 styles: TWA, afro, cornrows, box braids, twists, locs, low fade, waves, wig/straight, bald — plus 6 colors | identity picker (free) |
| 5 | Outfit (`outfit` slot) | wardrobe economy: bùbá (default), aṣọ òkè, agbádá, ìró+bùbá, dàǹṣíkí… | cowries/levels |
| 6 | Headwear (`head` slot) | fìlà, gèlè (3 tie styles), àdìrẹ headwrap | cowries/levels |
| 7 | Accessory (`accessory` slot) | ìlẹ̀kẹ̀ iyùn (coral beads), dùndún drum, ìrùkẹ̀rẹ̀ (horsetail whisk), ṣẹ̀kẹ̀rẹ̀ | cowries/levels/contract rewards |
| 8 | Effect (`effect` slot, rare) | iná streak flame aura, contract-completion glow | earned only, never purchasable |

**Identity layers (1–4) are free and unlimited** — a learner's likeness is never paywalled.
**Expression layers (5–8) are the economy** — pride is the collectible.

## Art production constraints (give this to the artist)

- Each option is a **separate transparent PNG (plus source SVG/AI)** on a shared 1024×1024
  canvas with a common anchor; layers composite by simple stacking, no per-combination art.
- Every outfit must work with every skin tone and hair style — no occlusion surprises;
  headwear must define a hair-crop mask (hat hair rule: braids/locs stay visible under gèlè/fìlà).
- Two required poses: **bust** (profile/home, 1024) and **full-body celebrate** (lesson
  summary, streak milestones). Same layer system for both.
- Style target: warm, rounded, flat-2D with subtle texture — Duolingo-adjacent charm,
  but distinctly West African in pattern and color (àdìrẹ indigo, aṣọ òkè stripes).
- Deliverables v1: 8 skins × (4 faces, 4 eyes) shared, 10 hair × 6 colors, 6 outfits,
  4 headwear, 4 accessories, 2 effects ≈ **~90 unique assets**.

## Data model impact (small)

`AvatarConfig` grows from `{ base, outfit, head, accessory }` to:

```ts
interface AvatarConfig {
  skin: number;      // 0–7
  face: number;      // 0–3
  eyes: number;      // 0–3
  hair: number;      // 0–9
  hairColor: number; // 0–5
  outfit?: string;   // wardrobe item ids (unchanged economy)
  head?: string;
  accessory?: string;
  effect?: string;
}
```

Emoji placeholders remain the renderer until assets land; the store schema migrates once,
before beta, so synced profiles don't need a second migration.

## Icebox (post-launch)

- ARKit face-tracked "talking avatar" for speaking practice (needs dev build + 3D or
  puppet-rig investment — revisit when ASR speaking exercises land).
- Image Playground one-off stylized portraits (iOS 18.2+ only; static; low priority).
