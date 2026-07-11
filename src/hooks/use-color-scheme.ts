import { useColorScheme as useRNColorScheme } from 'react-native';

import { useProfile } from '@/state/profile';

export function useColorScheme(): 'light' | 'dark' {
  const system = useRNColorScheme();
  const override = useProfile((s) => s.themeOverride);
  const resolved = override === 'system' ? system : override;
  return resolved === 'dark' ? 'dark' : 'light';
}
