// Pure helpers over the server navigation model, kept apart from the hook so they can be tested in Node.

// The media types the person tracks, in their drawer order: [{ type, label, icon }].
export function libraryTypesFrom(model) {
  return (model?.primary || [])
    .map(item => ({ item, type: String(item.href || '').match(/\/medialist\/([^/?#]+)/)?.[1] }))
    .filter(entry => entry.type)
    .map(({ item, type }) => ({ type, label: item.label, icon: item.icon }));
}

// Explore pages for the More page, without the ones the navigation bar already holds.
const IN_BAR = ['/', '/discover', '/calendar'];
export function moreItemsFrom(model) {
  const pathOf = href => {
    try { return new URL(String(href || ''), 'http://floppy.local').pathname.replace(/\/+$/, '') || '/'; }
    catch { return String(href || ''); }
  };
  const explore = (model?.secondary || []).filter(item => item.href && !IN_BAR.includes(pathOf(item.href)));
  const bottom = model?.bottom || {};
  const account = [bottom.settings, bottom.appearance].filter(item => item && item.href);
  return { explore, account };
}
