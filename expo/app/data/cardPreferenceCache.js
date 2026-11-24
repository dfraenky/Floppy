// The card preferences read (Mobile Grid, clickable media cards) is shared per
// session by every card surface; saving settings drops it so the next read is fresh.
export const cardPreferenceCache = { session: null, promise: null };

export function forgetCardPreferences() {
  cardPreferenceCache.session = null;
  cardPreferenceCache.promise = null;
}
