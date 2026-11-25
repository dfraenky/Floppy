import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { CollectionGroup, CollectionRow } from '../../../frontend/ui/CollectionCopies';
import { Title } from '../../../frontend/ui/Title';
import { signOut } from '../data/authTransport';
import { moreItemsFrom, useNavigationModel } from '../data/navigationModel';
import { palette } from '../theme';

// The navigation bar's "More": a full page in the grouped-list style of the Tracking sheet and
// Android's own settings, instead of a side drawer. It holds what the bar does not: the Explore
// pages (History, Lists, Statistics, Collection, Tags, ...) and the account rows. Media types live
// in Library's chips; Home, Discover and Calendar are in the bar.
const groupPalette = {
  surface: palette.surface,
  text: palette.text,
  textSecondary: palette.textSecondary,
  textMuted: palette.textMuted,
  accent: palette.accent,
  danger: palette.danger,
};

const LOGOUT_ICON = { viewBox: '0 0 24 24', root: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2',
  'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, children: [
  { tag: 'path', attrs: { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }, children: [] },
  { tag: 'path', attrs: { d: 'm16 17 5-5-5-5' }, children: [] },
  { tag: 'path', attrs: { d: 'M21 12H9' }, children: [] },
] };

export default function MoreScreen({ onOpenHref }) {
  const { model, error } = useNavigationModel();
  const [signOutError, setSignOutError] = useState('');
  const { explore, account } = moreItemsFrom(model);
  const row = item => <CollectionRow key={item.key || item.href} icon={item.icon} label={item.label}
    chevron palette={groupPalette} onPress={() => onOpenHref?.(item.href, item)} />;
  return <Screen chrome={false}>
    <View style={styles.page}>
      <Title size="page" level={1} color={palette.text}>More</Title>
      {!model && !error ? <ActivityIndicator color={palette.accent} style={styles.loading} /> : null}
      {error ? <Text accessibilityRole="alert" style={[styles.error, { color: palette.danger }]}>
        {error.message || 'The menu could not be loaded.'}</Text> : null}
      {explore.length ? <CollectionGroup title="Explore" palette={groupPalette}>{explore.map(row)}</CollectionGroup> : null}
      <CollectionGroup title="Account" palette={groupPalette}>
        {account.map(row)}
        <CollectionRow icon={LOGOUT_ICON} tone="danger" label="Logout" palette={groupPalette}
          onPress={() => {
            setSignOutError('');
            signOut().catch(cause => setSignOutError(cause?.message || 'Could not sign out. Try again.'));
          }} />
      </CollectionGroup>
      {signOutError ? <Text accessibilityRole="alert" style={[styles.error, { color: palette.danger }]}>{signOutError}</Text> : null}
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  page: { gap: 8, paddingBottom: 24 },
  loading: { marginTop: 24 },
  error: { fontSize: 13, lineHeight: 18 },
});
