import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FormSaveBar } from '../../../frontend/ui/FormSaveBar';

const SaveBarContext = createContext(null);

// The settings screen owns the viewport overlay. Editors keep their existing
// save state and callbacks; their scroll content does not own the dock geometry.
// `hidden` steps the dock aside while the section menu is open, so it never
// covers the menu's last entries.
export function SettingsSaveBarHost({ children, hidden = false }) {
  const [bar, setBar] = useState(null);
  return <SaveBarContext.Provider value={setBar}>
    <View style={styles.root}>
      {children}
      {bar && !hidden ? <View style={styles.dock}>{bar}</View> : null}
    </View>
  </SaveBarContext.Provider>;
}

export default function SettingsSaveBar(props) {
  const setBar = useContext(SaveBarContext);
  const latest = useRef(props);
  latest.current = props;
  // Callback identity changes must not cause an overlay/render feedback loop.
  // The ref supplies the current action; the serializable presentation drives
  // updates (dirty, saving, errors, translated copy and theme colors).
  const signature = JSON.stringify(props);
  // The dock only appears while there is something to do or to report: unsaved changes, a
  // save in flight, an error, and for two seconds after a save ("All changes saved").
  // A permanent "All changes saved" card covered the end of every settings page.
  const pending = Boolean(props.dirty || props.saving || props.error || props.appearance);
  const [justSaved, setJustSaved] = useState(false);
  const wasPending = useRef(pending);
  useEffect(() => {
    if (wasPending.current && !pending) {
      setJustSaved(true);
      const timer = setTimeout(() => setJustSaved(false), 2000);
      wasPending.current = pending;
      return () => clearTimeout(timer);
    }
    wasPending.current = pending;
    return undefined;
  }, [pending]);
  const visible = pending || justSaved;
  useEffect(() => {
    if (!setBar) return undefined;
    setBar(visible ? <FormSaveBar {...latest.current} onSave={() => latest.current.onSave?.()} /> : null);
    return () => setBar(null);
  }, [setBar, signature, visible]);
  return setBar || !visible ? null : <FormSaveBar {...props} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  dock: { position: 'absolute', left: 16, right: 16, bottom: 16, zIndex: 20 },
});
