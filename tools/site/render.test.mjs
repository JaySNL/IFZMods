import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, nexusUrl, orderMods, renderCard, renderPage } from './render.mjs';

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

test('renderCard includes name, summary, lazy banner, and nexus link', () => {
  const html = renderCard(
    { key: 'PerfPack', name: 'Perf Pack', summary: 'Faster late game', nexusModId: 50 },
    'infectionfreezone',
  );
  assert.match(html, /assets\/banners\/PerfPack\.png/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /Perf Pack/);
  assert.match(html, /Faster late game/);
  assert.match(html, /mods\/50/);
  assert.match(html, /Get on Nexus/);
});

test('renderCard badges a library and escapes html', () => {
  const html = renderCard(
    { key: 'IFZModAPI', name: 'API & <lib>', summary: 'x', nexusModId: 42, isLibrary: true },
    'infectionfreezone',
  );
  assert.match(html, /class="badge"/);
  assert.match(html, /API &amp; &lt;lib&gt;/);
});

test('renderCard omits nexus button when no id', () => {
  const html = renderCard({ key: 'x', name: 'X', summary: 'y' }, 'infectionfreezone');
  assert.doesNotMatch(html, /Get on Nexus/);
});

test('renderPage is standalone, counts mods, orders featured first, wires links', () => {
  const mods = [
    { key: 'a', name: 'Alpha', summary: 's', nexusModId: 1 },
    { key: 'b', name: 'Bravo', summary: 's', nexusModId: 2 },
  ];
  const meta = {
    kofi: 'https://ko-fi.com/jaymade88',
    nexusProfile: 'https://www.nexusmods.com/profile/JaySNL',
    github: 'https://github.com/JaySNL',
    youtube: 'https://www.youtube.com/@jaysdesk',
    discord: 'https://discord.gg/habeKjNdN9',
    installDoc: 'https://github.com/JaySNL/IFZMods/blob/main/INSTALL.md',
  };
  const html = renderPage({ mods, gameSlug: 'infectionfreezone', featuredKeys: ['b'], meta });
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /2 free mods/);
  assert.match(html, /ko-fi\.com\/jaymade88/);
  assert.match(html, /@jaysdesk/);
  assert.match(html, /discord\.gg\/habeKjNdN9/);
  assert.match(html, /profile\/JaySNL/);
  assert.ok(html.indexOf('Bravo') < html.indexOf('Alpha'));
  assert.doesNotMatch(html, /<link[^>]+rel=["']?stylesheet/i);
  assert.doesNotMatch(html, /<script\s+src=/i);
  assert.match(html, /href="api\.html"/);
  assert.match(html, /API for Modders/);
});

import { renderApiPage, renderApiSection } from './render.mjs';

const apiFixture = [{
  key: 'FooApi', title: 'FooApi', dll: 'FooApi.dll', guid: 'com.x.foo', version: '1.0.0',
  blurb: 'Does foo things.',
  reference: {
    bepInDependency: '[BepInDependency("com.x.foo")]',
    hintPath: '<Reference Include="FooApi"><HintPath>..\\FooApi\\bin\\Release\\FooApi.dll</HintPath></Reference>',
    notes: 'Never version-pin unless <required> & audited.',
  },
  types: [{
    name: 'Foo', kind: 'static class', summary: 'Entry point.',
    members: [{ signature: 'static void Bar(int n)', params: [{ name: 'n', type: 'int', desc: 'count' }], returns: 'void — nothing', remarks: 'Call once at Awake.' }],
    hooks: [{ name: 'Foo.Ping', signature: 'static event Action Ping', when: 'Fires on ping.', remarks: 'Unsubscribe on destroy.' }],
  }],
  example: 'Foo.Bar(3); // <run>',
}];
const apiMeta = { github: 'https://github.com/JaySNL', discord: 'https://discord.gg/habeKjNdN9' };

test('renderApiSection shows blurb, referencing box, member, hook, example', () => {
  const html = renderApiSection(apiFixture[0]);
  assert.match(html, /id="FooApi"/);
  assert.match(html, /v1\.0\.0/);
  assert.match(html, /Referencing this API/);
  assert.match(html, /\[BepInDependency\(&quot;com\.x\.foo&quot;\)\]/);
  assert.match(html, /HintPath/);
  assert.match(html, /static void Bar\(int n\)/);
  assert.match(html, /Foo\.Ping/);
  assert.match(html, /Foo\.Bar\(3\); \/\/ &lt;run&gt;/);
  assert.match(html, /Never version-pin unless &lt;required&gt; &amp; audited/);
});

test('renderApiPage is standalone, no external requests, links back to index, lists all APIs', () => {
  const html = renderApiPage({ apis: apiFixture, meta: apiMeta });
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /API for Modders/);
  assert.match(html, /href="index\.html"/);
  assert.match(html, /href="#FooApi"/);
  assert.doesNotMatch(html, /<link[^>]+rel=["']?stylesheet/i);
  assert.doesNotMatch(html, /<script\s+src=/i);
});
