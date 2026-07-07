/**
 * FSRS scheduling wrapper (ts-fsrs). Cards are stored JSON-serialized in the
 * profile store; dates are revived here. Review logs are kept so FSRS
 * parameters can be optimized server-side later (Phase 4).
 */
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card } from 'ts-fsrs';

const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

export { Rating };

/** Card as persisted (Dates → ISO strings via JSON round-trip). */
export type StoredCard = Omit<Card, 'due' | 'last_review'> & {
  due: string;
  last_review?: string;
};

export interface ReviewLogEntry {
  vocabId: string;
  rating: number;
  reviewedAt: string;
}

function revive(stored: StoredCard): Card {
  return {
    ...stored,
    due: new Date(stored.due),
    last_review: stored.last_review ? new Date(stored.last_review) : undefined,
  } as Card;
}

function freeze(card: Card): StoredCard {
  return JSON.parse(JSON.stringify(card)) as StoredCard;
}

export function newCard(now: Date = new Date()): StoredCard {
  return freeze(createEmptyCard(now));
}

export function reviewCard(
  stored: StoredCard,
  rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy,
  now: Date = new Date(),
): StoredCard {
  const { card } = scheduler.next(revive(stored), now, rating);
  return freeze(card);
}

export function isDue(stored: StoredCard, now: Date = new Date()): boolean {
  return new Date(stored.due).getTime() <= now.getTime();
}

export function dueCards(
  cards: Record<string, StoredCard>,
  now: Date = new Date(),
): string[] {
  return Object.keys(cards)
    .filter((id) => isDue(cards[id], now))
    .sort((a, b) => new Date(cards[a].due).getTime() - new Date(cards[b].due).getTime());
}
