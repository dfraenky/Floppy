import React from 'react';
import { Pressable } from 'react-native';
import { Icon } from '../../../frontend/ui/Icon';
import { actionIcons } from '../../../frontend/ui/actionIcons';

// Native Liquid Glass is iOS-only; on Android and web a tonal circle tinted from the title
// colour, so it reads on light and dark sheets alike (Material 3 filled-tonal icon button).
export function SheetCloseButton({ onPress, color }) {
  return <Pressable accessibilityRole="button" accessibilityLabel="Close sheet" onPress={onPress} hitSlop={8}
    style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
      backgroundColor: tint(color, pressed ? 0.22 : 0.12) })}>
    <Icon spec={actionIcons.close} size={20} color={color} />
  </Pressable>;
}

function tint(color, alpha) {
  const hex = typeof color === 'string' && /^#([0-9a-f]{6})$/i.exec(color);
  if (!hex) return `rgba(127, 127, 127, ${alpha + 0.06})`;
  const n = parseInt(hex[1], 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
