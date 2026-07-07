import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'breakbarriers-device-id';

let cached: string | null = null;

function randomId(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'dev_';
  for (let i = 0; i < 24; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}

/** Anonymous install identity; replaced by Sign in with Apple post-MVP. */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  const stored = await AsyncStorage.getItem(KEY);
  if (stored) {
    cached = stored;
    return stored;
  }
  const id = randomId();
  await AsyncStorage.setItem(KEY, id);
  cached = id;
  return id;
}
