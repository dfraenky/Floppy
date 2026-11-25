import React, { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../../frontend/ui/Icon';

// Material 3 navigation bar for Android phones: the four places people use most, always one
// thumb-tap away, and "More" for the full drawer (other media types, Explore, Settings).
// Lucide shapes, drawn like the rest of the app's icons.
const shape = paths => ({ viewBox: '0 0 24 24', root: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2',
  'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, children: paths.map(d => ({ tag: 'path', attrs: { d }, children: [] })) });

const ICONS = {
  home: shape(['M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8',
    'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z']),
  discover: shape(['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'm16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z']),
  library: shape(['m16 6 4 14', 'M12 6v14', 'M8 8v12', 'M4 4v16']),
  calendar: shape(['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z']),
  more: shape(['M4 6h16', 'M4 12h16', 'M4 18h16']),
};

export const BOTTOM_NAV_ITEMS = [
  { key: 'home', label: 'Home', match: href => href === '/' },
  { key: 'discover', label: 'Discover', match: href => href.startsWith('/discover') },
  { key: 'library', label: 'Library', match: href => href.startsWith('/medialist/') },
  { key: 'calendar', label: 'Calendar', match: href => href.startsWith('/calendar') },
  { key: 'more', label: 'More', match: () => false },
];

export function activeBottomNavKey(activeHref, menuOpen) {
  if (menuOpen) return 'more';
  const href = String(activeHref || '');
  return BOTTOM_NAV_ITEMS.find(item => item.match(href))?.key || null;
}

export function BottomNavBar({ activeHref, menuOpen = false, onNavigate, onOpenMenu, palette, bottomInset = 0 }) {
  // The bar would ride up on the keyboard while typing a search; it steps aside instead.
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  if (keyboard) return null;
  const current = activeBottomNavKey(activeHref, menuOpen);
  return <View accessibilityRole="tablist" style={[styles.bar, {
    backgroundColor: palette.sidebar || palette.surface,
    borderTopColor: palette.border,
    paddingBottom: bottomInset,
  }]}>
    {BOTTOM_NAV_ITEMS.map(item => {
      const selected = current === item.key;
      const color = selected ? palette.text : palette.textMuted;
      return <Pressable key={item.key} accessibilityRole="tab" accessibilityLabel={item.label}
        accessibilityState={{ selected }} style={styles.item}
        android_ripple={{ color: 'rgba(127, 127, 127, 0.16)', borderless: true, radius: 36 }}
        onPress={() => (item.key === 'more' ? onOpenMenu?.() : onNavigate?.(item.key))}>
        <View style={[styles.indicator, selected && { backgroundColor: palette.indicator || 'rgba(99, 102, 241, 0.28)' }]}>
          <Icon spec={ICONS[item.key]} size={22} color={selected ? (palette.accentText || palette.text) : palette.textMuted} />
        </View>
        <Text numberOfLines={1} style={[styles.label, { color, fontWeight: selected ? '700' : '500' }]}>{item.label}</Text>
      </Pressable>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
  item: { flex: 1, alignItems: 'center', gap: 4, paddingBottom: 12 },
  // Material 3's active indicator: a 64 x 32 pill behind the selected icon.
  indicator: { width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, lineHeight: 16 },
});
