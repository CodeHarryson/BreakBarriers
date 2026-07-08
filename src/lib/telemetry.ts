/**
 * Crash + error reporting via Sentry. No-ops without EXPO_PUBLIC_SENTRY_DSN
 * (local/dev builds don't phone home). Call initTelemetry() once at the very
 * top of the root layout, before rendering.
 */
import * as Sentry from '@sentry/react-native';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initTelemetry(): void {
  if (!DSN) return;
  Sentry.init({
    dsn: DSN,
    // Trim breadcrumb/PII surface; we only need crashes + errors for the beta.
    sendDefaultPii: false,
    tracesSampleRate: 0.2,
  });
}

/** Wrap the root component so render errors are captured (returns input as-is when DSN unset). */
export const wrapWithTelemetry: typeof Sentry.wrap = DSN
  ? Sentry.wrap
  : (component) => component;

export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (!DSN) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
