import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { applyMarkdownAction, normalizeSelection } from './markdown';
import { CollectionGroup, CollectionSectionHeading } from './CollectionCopies';
import { Icon } from './Icon';
import { actionIcons } from './actionIcons';
import { systemFillColor } from './separatorColor';

const DEFAULT_PALETTE = {
  background: '#18181b',
  surface: '#27272a',
  surfaceStrong: '#3f3f46',
  border: '#52525b',
  text: '#fafafa',
  textSecondary: '#d4d4d8',
  textMuted: '#a1a1aa',
  accent: '#6366f1',
  link: '#818cf8',
  danger: '#f87171',
  codeBackground: '#1f2328',
};

// Lucide shapes for the grouped toolbar, so eight tools fit on one row as icons instead of letters.
const toolPath = ds => ({ viewBox: '0 0 24 24', root: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2',
  'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, children: ds.map(d => ({ tag: 'path', attrs: { d }, children: [] })) });
const TOOL_ICONS = {
  heading: toolPath(['M6 12h12', 'M6 20V4', 'M18 20V4']),
  bold: toolPath(['M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8']),
  italic: toolPath(['M19 4h-9', 'M14 20H5', 'M15 4 9 20']),
  code: toolPath(['m16 18 6-6-6-6', 'm8 6-6 6 6 6']),
  link: toolPath(['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71']),
  quote: toolPath(['M17 6H3', 'M21 12H8', 'M21 18H8', 'M3 12v6']),
  ul: toolPath(['M3 12h.01', 'M3 18h.01', 'M3 6h.01', 'M8 12h13', 'M8 18h13', 'M8 6h13']),
  ol: toolPath(['M10 12h11', 'M10 18h11', 'M10 6h11', 'M4 10h2', 'M4 6h1v4', 'M6 18H4c0-1 2-2 2-3s-1-1.5-2-1']),
};

const DEFAULT_LABELS = {
  write: 'Write',
  preview: 'Preview',
  hint: 'Markdown supported',
  heading: 'Heading',
  bold: 'Bold',
  italic: 'Italic',
  code: 'Code',
  link: 'Link',
  quote: 'Quote',
  bulletedList: 'Bulleted list',
  numberedList: 'Numbered list',
  emptyPreview: 'Nothing to preview yet.',
  boldPlaceholder: 'bold text',
  italicPlaceholder: 'italic text',
  codePlaceholder: 'code',
  linkPlaceholder: 'link text',
};

const TOOLBAR = [
  { action: 'heading', glyph: 'H', label: 'heading' },
  { action: 'bold', glyph: 'B', label: 'bold' },
  { action: 'italic', glyph: 'I', label: 'italic' },
  { action: 'code', glyph: '<>', label: 'code' },
  { action: 'link', glyph: 'Link', label: 'link' },
  { action: 'quote', glyph: '>', label: 'quote' },
  { action: 'ul', glyph: 'UL', label: 'bulletedList' },
  { action: 'ol', glyph: 'OL', label: 'numberedList' },
];

function errorText(error) {
  if (!error) return '';
  return Array.isArray(error) ? error.join(' ') : String(error);
}

export function MarkdownNotes({
  value = '',
  onChangeText,
  label = 'Notes',
  labelHidden = false,
  hint,
  placeholder,
  error,
  disabled = false,
  accessibilityLabel,
  labels: suppliedLabels,
  palette: suppliedPalette,
  Preview,
  minHeight = 150,
  testID,
  // Grouped-list design (the Tracking sheet and Collection modal): a titled card holding a
  // Write / Preview segmented control with the formatting tools, then a borderless text area.
  grouped = false,
}) {
  const labels = { ...DEFAULT_LABELS, ...(suppliedLabels || {}) };
  const palette = { ...DEFAULT_PALETTE, ...(suppliedPalette || {}) };
  const [tab, setTab] = useState('write');
  // The info tip opens on hover (web) or when tapped (native); a tap pins it open until tapped again.
  const [tipHover, setTipHover] = useState(false);
  const [tipPinned, setTipPinned] = useState(false);
  const tipOpen = tipHover || tipPinned;
  const [pendingSelection, setPendingSelection] = useState(null);
  const selection = useRef({ start: 0, end: 0 });
  const input = useRef(null);
  const message = errorText(error);

  function change(next) {
    onChangeText?.(next);
  }

  function rememberSelection(event) {
    selection.current = normalizeSelection(event?.nativeEvent?.selection, String(value).length);
    if (pendingSelection) setPendingSelection(null);
  }

  function runAction(action) {
    const next = applyMarkdownAction(value, selection.current, action, {
      bold: labels.boldPlaceholder,
      italic: labels.italicPlaceholder,
      code: labels.codePlaceholder,
      link: labels.linkPlaceholder,
    });
    selection.current = next.selection;
    setPendingSelection(next.selection);
    change(next.value);
    input.current?.focus?.();
  }

  const tabs = (
    <View style={styles.tabs}>
      {['write', 'preview'].map(key => {
        const active = tab === key;
        return <Pressable key={key}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
          accessibilityLabel={labels[key]}
          onPress={() => setTab(key)}
          style={({ pressed }) => [styles.tab, active && { backgroundColor: palette.surfaceStrong }, pressed && styles.pressed]}>
          <Text style={[styles.tabText, { color: active ? palette.text : palette.textMuted }]}>{labels[key]}</Text>
        </Pressable>;
      })}
    </View>
  );

  const toolbar = (
    <View style={styles.toolbar}>
      {TOOLBAR.map(item => <Pressable key={item.action}
        accessibilityRole="button"
        accessibilityLabel={labels[item.label]}
        disabled={disabled}
        onPress={() => runAction(item.action)}
        style={({ pressed }) => [styles.tool, pressed && { backgroundColor: palette.surfaceStrong }]}>
        <Text style={[styles.toolText, { color: disabled ? palette.textMuted : palette.textSecondary }]}>{item.glyph}</Text>
      </Pressable>)}
    </View>
  );

  const input_ = tab === 'write' ? <TextInput
    ref={input}
    accessibilityLabel={accessibilityLabel || label}
    accessibilityState={{ disabled }}
    editable={!disabled}
    multiline
    onChangeText={change}
    onSelectionChange={rememberSelection}
    placeholder={placeholder}
    placeholderTextColor={palette.textMuted}
    selection={pendingSelection || undefined}
    textAlignVertical="top"
    value={String(value ?? '')}
    style={[grouped ? styles.groupedInput : styles.input, {
      minHeight: grouped ? 132 : minHeight,
      color: palette.text,
      opacity: disabled ? 0.6 : 1,
    }]} /> : <View style={[grouped ? styles.groupedPreview : styles.preview, { minHeight: grouped ? 132 : minHeight }]}>
    {Preview
      ? <Preview markdown={value} labels={labels} palette={palette} />
      : <Text style={[grouped ? styles.groupedFallback : styles.fallback, { color: palette.textSecondary }]}>{String(value || labels.emptyPreview)}</Text>}
  </View>;

  if (grouped) {
    // iOS: the system fill track with a raised card-coloured segment. Web: a darker track with a lighter segment.
    const system = systemFillColor();
    const fill = system || palette.surfaceDim || palette.surfaceStrong;
    const raised = system ? palette.surface : palette.surfaceStrong;
    return <View style={styles.root} testID={testID}>
      {!labelHidden ? <View style={styles.groupedHeadingWrap}>
        <View style={styles.groupedHeading}>
          <CollectionSectionHeading title={label} palette={palette} />
          <Pressable accessibilityRole="button" accessibilityLabel={hint || labels.hint} hitSlop={10}
            accessibilityState={{ expanded: tipOpen }} onPress={() => setTipPinned(open => !open)}
            onHoverIn={() => setTipHover(true)} onHoverOut={() => setTipHover(false)}>
            <Icon spec={actionIcons.info} size={16} color={palette.textMuted} />
          </Pressable>
        </View>
        {tipOpen ? <View accessibilityRole="alert" style={[styles.tip, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.tipText, { color: palette.textSecondary }]}>{hint || labels.hint}</Text>
        </View> : null}
      </View> : null}
      <CollectionGroup palette={palette}>
        <View key="controls" style={styles.groupedControls}>
          <View style={[styles.segments, { backgroundColor: fill }]}>
            {['write', 'preview'].map(key => {
              const active = tab === key;
              return <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: active }}
                accessibilityLabel={labels[key]} onPress={() => setTab(key)}
                style={({ pressed }) => [styles.segment, active && { backgroundColor: raised }, pressed && styles.pressed]}>
                <Text style={[styles.segmentText, { color: active ? palette.text : palette.textMuted }]}>{labels[key]}</Text>
              </Pressable>;
            })}
          </View>
        </View>
        <View key="tools" style={styles.groupedTools}>
          {TOOLBAR.map(item => <Pressable key={item.action} accessibilityRole="button"
            accessibilityLabel={labels[item.label]} disabled={disabled} onPress={() => runAction(item.action)} hitSlop={4}
            style={({ pressed }) => [styles.groupedTool, pressed && { backgroundColor: fill }]}>
            <Icon spec={TOOL_ICONS[item.action]} size={18} color={disabled ? palette.textMuted : palette.textSecondary} />
          </Pressable>)}
        </View>
        <View key="body">{input_}</View>
      </CollectionGroup>
      {message ? <Text accessibilityRole="alert" style={[styles.error, { color: palette.danger }]}>{message}</Text> : null}
    </View>;
  }

  return <View style={styles.root} testID={testID}>
    {!labelHidden ? <View style={styles.labelRow}>
      <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
      <Text style={[styles.hint, { color: palette.textMuted }]}>{hint || labels.hint}</Text>
    </View> : null}
    <View style={[styles.frame, { borderColor: palette.border, backgroundColor: palette.background }]}>
      <View style={[styles.header, { borderBottomColor: palette.border, backgroundColor: palette.surface }]}>
        {tabs}
        {toolbar}
      </View>
      {tab === 'write' ? <TextInput
        ref={input}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityState={{ disabled }}
        editable={!disabled}
        multiline
        onChangeText={change}
        onSelectionChange={rememberSelection}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        selection={pendingSelection || undefined}
        textAlignVertical="top"
        value={String(value ?? '')}
        style={[styles.input, {
          minHeight,
          color: palette.text,
          opacity: disabled ? 0.6 : 1,
        }]} /> : <View style={[styles.preview, { minHeight }]}>
        {Preview
          ? <Preview markdown={value} labels={labels} palette={palette} />
          : <Text style={[styles.fallback, { color: palette.textSecondary }]}>{String(value || labels.emptyPreview)}</Text>}
      </View>}
    </View>
    {message ? <Text accessibilityRole="alert" style={[styles.error, { color: palette.danger }]}>{message}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  root: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  label: { flexShrink: 1, fontSize: 13, fontWeight: '600' },
  hint: { flexShrink: 0, fontSize: 11 },
  frame: { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, borderBottomWidth: 1, paddingVertical: 2 },
  tabs: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 2 },
  tab: { borderRadius: 5, paddingHorizontal: 10, paddingVertical: 6 },
  tabText: { fontSize: 13, fontWeight: '600' },
  pressed: { opacity: 0.75 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginLeft: 'auto', paddingHorizontal: 2 },
  tool: { borderRadius: 5, paddingHorizontal: 8, paddingVertical: 6 },
  toolText: { fontSize: 12, fontWeight: '600' },
  input: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, lineHeight: 19 },
  preview: { paddingHorizontal: 12, paddingVertical: 10 },
  fallback: { fontSize: 13, lineHeight: 19 },
  error: { fontSize: 12, lineHeight: 17 },
  groupedControls: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  segments: { flexDirection: 'row', borderRadius: 9, padding: 2 },
  segment: { borderRadius: 7, paddingHorizontal: 14, paddingVertical: 5 },
  segmentText: { fontSize: 14, fontWeight: '600' },
  groupedToolsScroll: { flex: 1, minWidth: 0 },
  // Tools get their own row under Write / Preview: all eight fit on a phone without scrolling.
  groupedTools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8 },
  groupedTool: { minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  groupedToolText: { fontSize: 14, fontWeight: '600' },
  groupedInput: { paddingVertical: 12, fontSize: 17, lineHeight: 22 },
  groupedPreview: { paddingVertical: 12 },
  groupedFallback: { fontSize: 17, lineHeight: 22 },
  groupedHeadingWrap: { zIndex: 10 },
  groupedHeading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tip: { position: 'absolute', top: '100%', left: 0, zIndex: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 2 },
  tipText: { fontSize: 13, lineHeight: 18 },
});
