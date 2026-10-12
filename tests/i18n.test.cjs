const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const source = read('assets/scripts/i18n.js');
const messages = JSON.parse(source.match(/const messages = (\{[\s\S]*?\n\});/)[1]);
const decode = text => text.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");

for (const page of ['index.html', 'dm.html']) {
  test(`${page}: every static UI translation key has a Chinese translation`, () => {
    const html = read(page);
    const keys = [...html.matchAll(/data-i18n(?:-(?:placeholder|aria-label|title|alt))?="([^"]+)"/g)];
    assert.ok(keys.length > 30);
    for (const [, key] of keys) assert.ok(messages[decode(key)], `Missing translation: ${key}`);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, 'HTML IDs must be unique');
    assert.ok(html.indexOf('scripts/i18n.js') < html.indexOf('scripts/main.js'));
    assert.match(html, /<html lang="en">/);
  });
}

test('literal JavaScript translation calls are covered by the dictionary', () => {
  const main = read('assets/scripts/main.js');
  for (const [, literal] of main.matchAll(/\bt\(("(?:[^"\\]|\\.)*")/g)) {
    const key = JSON.parse(literal);
    assert.ok(messages[key], `Missing translation: ${key}`);
  }
});

test('English and Chinese templates contain matching variable placeholders', () => {
  const variables = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
  for (const [english, chinese] of Object.entries(messages)) {
    assert.ok(chinese.trim(), `Empty translation: ${english}`);
    assert.deepEqual(variables(chinese), variables(english), english);
  }
});
