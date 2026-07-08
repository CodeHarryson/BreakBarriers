/**
 * Analytics facade over PostHog. No-ops entirely without
 * EXPO_PUBLIC_POSTHOG_KEY, so local/dev builds send nothing and the rest of
 * the app calls `track(...)` unconditionally. Events are a closed union so
 * names/props stay consistent across the funnel (PostHog dashboards depend on
 * stable event names).
 */
import PostHog from 'posthog-react-native';

const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

let client: PostHog | null = null;

export function initAnalytics(): void {
  if (!KEY || client) return;
  client = new PostHog(KEY, { host: HOST });
}

type AnalyticsEvent =
  | { name: 'session_started'; props: Record<string, never> }
  | { name: 'onboarding_completed'; props: { motivation: string | null } }
  | { name: 'lesson_started'; props: { lessonId: string; kind: string } }
  | {
      name: 'lesson_completed';
      props: { lessonId: string; kind: string; correct: number; total: number; perfect: boolean };
    }
  | { name: 'review_completed'; props: { rating: number } }
  | { name: 'streak_extended'; props: { current: number } }
  | { name: 'chest_claimed'; props: { day: number; reward: number } }
  | { name: 'item_purchased'; props: { itemId: string; cost: number } }
  | { name: 'goal_reached'; props: { goalXp: number } };

export function track<E extends AnalyticsEvent>(name: E['name'], props: E['props']): void {
  client?.capture(name, props as Record<string, string | number | boolean | null>);
}

/** Tie events to the anonymous device identity used for sync. */
export function identifyDevice(deviceId: string): void {
  client?.identify(deviceId);
}
