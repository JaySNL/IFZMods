import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, nexusUrl, orderMods } from './render.mjs';

test('esc escapes html-significant characters', () => {
  assert.equal(esc('a & b <c> "d"'), 'a &amp; b &lt;c&gt; &quot;d&quot;');
});

test('nexusUrl builds mod url from slug + id', () => {
  assert.equal(
    nexusUrl({ nexusModId: 42 }, 'infectionfreezone'),
    'https://www.nexusmods.com/infectionfreezone/mods/42',
  );
});

test('orderMods puts featured first in given order, rest alpha by name', () => {
  const mods = [
    { key: 'b', name: 'Bravo' },
    { key: 'a', name: 'Alpha' },
    { key: 'feat2', name: 'Zeta' },
    { key: 'feat1', name: 'Yankee' },
  ];
  const out = orderMods(mods, ['feat1', 'feat2']);
  assert.deepEqual(out.map((m) => m.key), ['feat1', 'feat2', 'a', 'b']);
});
