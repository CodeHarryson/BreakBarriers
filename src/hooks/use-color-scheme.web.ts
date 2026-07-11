import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useProfile } from '@/state/profile';

// Hydration flag via useSyncExternalStore: the server snapshot is always
// `false`, the client snapshot `true`, so the color scheme only applies after
// hydration (avoids a server/client markup mismatch during static rendering).
const emptySubscribe = () => () => {};

export function useColorScheme(): 'light' | 'dark' {
  const hasHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const system = useRNColorScheme();
  const override = useProfile((s) => s.themeOverride);
  if (!hasHydrated) return 'light';
  const resolved = override === 'system' ? system : override;
  return resolved === 'dark' ? 'dark' : 'light';
}
