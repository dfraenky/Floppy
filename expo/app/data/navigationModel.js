import { useEffect, useState } from 'react';
import { getActiveAuthSession, subscribeAuthSession } from './authSession';

// The server's navigation model (/api/v1/user/navigation/), the same one the drawer draws:
// media types in `primary`, Explore pages in `secondary`, Settings and Appearance in `bottom`.
// One request per session, shared by the Library type chips and the More page.
const cache = { session: null, promise: null };

function loadNavigation(session) {
  if (cache.session !== session || !cache.promise) {
    const promise = session.request('/api/v1/user/navigation/').then(model => {
      if (!model || !Array.isArray(model.primary)) throw new Error('This address did not return a Floppy navigation menu.');
      return model;
    });
    promise.catch(() => { if (cache.promise === promise) cache.promise = null; });
    cache.session = session;
    cache.promise = promise;
  }
  return cache.promise;
}

export function useNavigationModel() {
  const [session, setSession] = useState(() => getActiveAuthSession());
  const [state, setState] = useState({ model: null, error: null });
  useEffect(() => subscribeAuthSession(setSession), []);
  useEffect(() => {
    if (!session || typeof session.request !== 'function') return undefined;
    let active = true;
    loadNavigation(session)
      .then(model => { if (active) setState({ model, error: null }); })
      .catch(error => { if (active) setState({ model: null, error }); });
    return () => { active = false; };
  }, [session]);
  return state;
}

export { libraryTypesFrom, moreItemsFrom } from './navigationItems.js';
