import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const appSource = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');

test('index.html keeps every DOM id used by the browser app', () => {
  const queriedIds = [...appSource.matchAll(/querySelector\('#([^']+)'\)/g)].map((match) => match[1]);

  for (const id of queriedIds) {
    assert.match(html, new RegExp(`id="${id}"`), `missing DOM id: ${id}`);
  }
});

test('official draw CTA is visible before advanced settings', () => {
  const ctaIndex = html.indexOf('id="draw-button"');
  const settingsIndex = html.indexOf('id="settings-panel"');

  assert.ok(ctaIndex > -1, 'draw button is missing');
  assert.ok(settingsIndex > -1, 'settings panel is missing');
  assert.ok(ctaIndex < settingsIndex, 'primary draw action should render before settings');
  assert.match(html, /공식 추첨 시작/);
});
