import { useEffect, useState } from 'react';
import { getActiveAuthSession, subscribeAuthSession } from './authSession';
import { cardPreferenceCache as cached, forgetCardPreferences } from './cardPreferenceCache';
import { createSettingsTransport } from './settingsTransport';

// One preferences read per session, shared by every card surface that needs
// the person's card settings, instead of one request per mounted grid.
function loadCardPreferences(session) {
  if (cached.session !== session || !cached.promise) {
    const promise = createSettingsTransport({ auth: session }).loadPreferences()
      .then(payload => payload?.preferences || {});
    // A failed read is not remembered, so the next surface tries again.
    promise.catch(() => { if (cached.promise === promise) forgetCardPreferences(); });
    cached.session = session;
    cached.promise = promise;
  }
  return cached.promise;
}

function useCardPreference(pick, fallback) {
  const [session, setSession] = useState(() => getActiveAuthSession());
  const [value, setValue] = useState(fallback);
  useEffect(() => subscribeAuthSession(setSession), []);
  useEffect(() => {
    if (!session) {
      setValue(fallback);
      return undefined;
    }
    let active = true;
    loadCardPreferences(session)
      .then(preferences => { if (active) setValue(pick(preferences)); })
      .catch(() => {});
    return () => { active = false; };
  }, [session]); // `pick` and `fallback` are module-level constants at every call site.
  return value;
}

const pickGridLayout = preferences => (preferences.mobile_grid_layout === 'comfortable' ? 'comfortable' : 'compact');
const pickClickable = preferences => Boolean(preferences.clickable_media_cards);

// The person's Mobile Grid preference (Comfortable: two across, Compact: three across), read
// from the server like Now Playing does, so Home and Search size their cards from one place.
export function useMobileGridLayout() {
  return useCardPreference(pickGridLayout, 'compact');
}

// The person's "clickable media cards" preference, as the web and Home use it: off, the first
// tap on a card shows its quick actions and the second opens it; on, a tap opens it at once.
// Until the preference has loaded, cards reveal their actions first, like the server default.
export function useClickableMediaCards() {
  return useCardPreference(pickClickable, false);
}
