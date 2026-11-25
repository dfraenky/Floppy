import React from 'react';
import { Icon } from '../../../frontend/ui/Icon';
import { actionIcons } from '../../../frontend/ui/actionIcons';
import { SelectField } from '../../../frontend/ui/SelectField';

// Android uses the shared accessible dropdown (iOS supplies a system menu in
// SelectRowPicker.ios.jsx). This file keeps the .jsx extension so Metro does
// not resolve it ahead of the .ios.jsx variant.
export function renderSelectRowPicker({ label = 'Calendar Type', value, options, onChange, palette }) {
  const selected = options.find(option => option.value === value);
  return <SelectField label={label} labelHidden value={value} options={options}
    displayValue={selected?.displayLabel} palette={palette} popover
    accessibilityLabel={`${label}: ${selected?.label ?? ''}`}
    onChange={event => onChange(event.target.value)}
    triggerStyle={{ borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 0 }}
    triggerTextStyle={{ color: palette.textSecondary, fontSize: 16 }}
    indicator={<Icon spec={actionIcons.chevronsUpDown} size={16} color={palette.textMuted} />} />;
}
