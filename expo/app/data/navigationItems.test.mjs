import assert from 'node:assert/strict';
import test from 'node:test';
import { libraryTypesFrom, moreItemsFrom } from './navigationItems.js';

const model = {
  primary: [
    { label: 'Home', href: '/' },
    { label: 'Discover', href: '/discover' },
    { label: 'Anime', href: '/medialist/anime', icon: { viewBox: '0 0 24 24' } },
    { label: 'Games', href: '/medialist/game?layout=grid' },
  ],
  secondary: [
    { label: 'Calendar', href: '/calendar' },
    { label: 'History', href: '/history' },
    { label: 'Lists', href: '/lists/' },
  ],
  bottom: { settings: { label: 'Settings', href: '/settings/account' }, appearance: null },
};

test('Library chips list only the media types, in drawer order', () => {
  assert.deepEqual(libraryTypesFrom(model).map(entry => [entry.type, entry.label]), [['anime', 'Anime'], ['game', 'Games']]);
  assert.deepEqual(libraryTypesFrom(null), []);
});

test('More leaves out what the navigation bar already holds', () => {
  const { explore, account } = moreItemsFrom(model);
  assert.deepEqual(explore.map(item => item.label), ['History', 'Lists']);
  assert.deepEqual(account.map(item => item.label), ['Settings']);
});
