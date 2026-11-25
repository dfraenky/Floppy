import * as SecureStore from 'expo-secure-store';

// The media type the Library tab opened last, remembered across launches. Storage failures
// only cost the memory, never the page.
const KEY = 'floppy.lastLibraryType';

export function loadLastLibraryType() {
  return SecureStore.getItemAsync(KEY).catch(() => null);
}

export function saveLastLibraryType(mediaType) {
  if (!mediaType) return;
  SecureStore.setItemAsync(KEY, String(mediaType)).catch(() => {});
}
