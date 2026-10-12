// Policy-expression regression tests, NOT a replacement for the Firebase emulator.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const rules = JSON.parse(fs.readFileSync(path.join(__dirname, '../firebase-database.rules.json'), 'utf8')).rules;

class Snapshot {
  constructor(tree, parts = []) { this.tree = tree; this.parts = parts; }
  val() { return this.parts.reduce((node, key) => node?.[key], this.tree) ?? null; }
  exists() { return this.val() !== null; }
  child(key) { return new Snapshot(this.tree, [...this.parts, ...key.split('/')]); }
  parent() { return new Snapshot(this.tree, this.parts.slice(0, -1)); }
  hasChildren(keys) { return keys.every(key => this.child(key).exists()); }
}

function evaluate(expression, before, after, at, uid, campaignId = 'world', targetUid = uid) {
  return Function('auth', 'root', 'data', 'newData', '$campaignId', '$uid', `return (${expression});`)(
    uid ? { uid } : null, new Snapshot(before), new Snapshot(before).child(at),
    new Snapshot(after).child(at), campaignId, targetUid
  );
}

const base = () => ({
  users: { alice: { role: 'player' }, bob: { role: 'player' }, charlie: { role: 'player' } },
  campaigns: { world: { name: 'World', ownerUid: 'alice', createdAt: 'now', schemaVersion: 2 } },
  userCampaigns: {
    alice: { world: { name: 'World', role: 'dm', joinedAt: 'now', schemaVersion: 2 } },
    bob: { world: { name: 'World', role: 'player', joinedAt: 'now', schemaVersion: 2 } }
  }
});
const campaignWrite = rules.campaigns.$campaignId['.write'];
const membershipWrite = rules.userCampaigns.$uid.$campaignId['.write'];

test('signed-in users can read display names but not other users private profiles', () => {
  const before = base();
  const readName = rules.users.$uid.displayName['.read'];
  assert.equal(evaluate(readName, before, before, 'users/bob/displayName', 'alice', 'world', 'bob'), true);
  assert.equal(evaluate(readName, before, before, 'users/bob/displayName', null, 'world', 'bob'), false);
  assert.equal(evaluate(rules.users.$uid['.read'], before, before, 'users/bob', 'alice', 'world', 'bob'), false);
  assert.equal(evaluate(rules.users.$uid['.write'], before, before, 'users/bob', 'alice', 'world', 'bob'), false);
});

test('ordinary user may atomically create own campaign and DM membership', () => {
  const before = { users: base().users };
  const after = base();
  delete after.userCampaigns.bob;
  assert.equal(evaluate(campaignWrite, before, after, 'campaigns/world', 'alice'), true);
  assert.equal(evaluate(membershipWrite, before, after, 'userCampaigns/alice/world', 'alice'), true);
  assert.equal(evaluate(rules.userCampaigns.$uid.$campaignId['.validate'], before, after, 'userCampaigns/alice/world', 'alice'), true);
});

test('creation cannot omit membership, forge ownership, or run anonymously', () => {
  const before = { users: base().users };
  const after = base();
  delete after.userCampaigns;
  assert.equal(evaluate(campaignWrite, before, after, 'campaigns/world', 'alice'), false);
  assert.equal(evaluate(campaignWrite, before, base(), 'campaigns/world', 'bob'), false);
  assert.equal(evaluate(campaignWrite, before, base(), 'campaigns/world', null), false);
});

test('players and outsiders cannot write another campaign or grant DM to themselves', () => {
  const before = base();
  const after = base();
  after.userCampaigns.bob.world.role = 'dm';
  assert.equal(evaluate(campaignWrite, before, after, 'campaigns/world', 'bob'), false);
  assert.equal(evaluate(campaignWrite, before, after, 'campaigns/world', 'charlie'), false);
  assert.equal(evaluate(membershipWrite, before, after, 'userCampaigns/bob/world', 'bob'), false);
});

test('DM can invite a registered player, but cannot grant DM or downgrade a DM', () => {
  const before = base();
  const after = base();
  after.userCampaigns.charlie = { world: { ...after.userCampaigns.bob.world } };
  assert.equal(evaluate(membershipWrite, before, after, 'userCampaigns/charlie/world', 'alice', 'world', 'charlie'), true);
  after.userCampaigns.charlie.world.role = 'dm';
  assert.equal(evaluate(membershipWrite, before, after, 'userCampaigns/charlie/world', 'alice', 'world', 'charlie'), false);
  after.userCampaigns.alice.world.role = 'player';
  assert.equal(evaluate(membershipWrite, before, after, 'userCampaigns/alice/world', 'alice', 'world', 'alice'), false);
});

test('membership schema must match a new campaign, while legacy membership remains valid', () => {
  const before = base();
  const after = base();
  delete after.userCampaigns.bob.world.schemaVersion;
  const validate = rules.userCampaigns.$uid.$campaignId['.validate'];
  assert.equal(evaluate(validate, before, after, 'userCampaigns/bob/world', 'alice', 'world', 'bob'), false);
  delete after.campaigns.world.schemaVersion;
  assert.equal(evaluate(validate, before, after, 'userCampaigns/bob/world', 'alice', 'world', 'bob'), true);
});

test('only members may read a campaign and DM can atomically delete its memberships', () => {
  const before = base();
  const after = { ...before, campaigns: {}, userCampaigns: {} };
  const read = rules.campaigns.$campaignId['.read'];
  assert.equal(evaluate(read, before, before, 'campaigns/world', 'bob'), true);
  assert.equal(evaluate(read, before, before, 'campaigns/world', 'charlie'), false);
  assert.equal(evaluate(campaignWrite, before, after, 'campaigns/world', 'alice'), true);
  for (const uid of ['alice', 'bob']) {
    assert.equal(evaluate(membershipWrite, before, after, `userCampaigns/${uid}/world`, 'alice', 'world', uid), true);
  }
});
