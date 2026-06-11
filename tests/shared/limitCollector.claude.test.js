'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');

const { fetchClaudeLimits } = require('../../src/shared/limitCollector');

function fakeSpawnForClaudeUsage(expectedCommand = 'claude') {
  return (command, args) => {
    assert.equal(command, expectedCommand);
    assert.deepEqual(args, ['/usage']);
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.kill = () => {};
    process.nextTick(() => {
      child.stdout.emit('data', Buffer.from([
        'Current session',
        '95% left',
        'Resets 6pm',
        'Current week',
        '80% left',
        'Resets Jun 18'
      ].join('\n')));
      child.emit('close', 0);
    });
    return child;
  };
}

test('Claude limits fall back to direct CLI usage on Windows when OAuth usage is unavailable', async () => {
  const provider = await fetchClaudeLimits({}, {
    platform: 'win32',
    now: () => Date.parse('2026-06-11T00:00:00Z'),
    claudeCredentialPath: 'C:\\Users\\Javis\\.claude\\.credentials.json',
    stat: async () => ({ mtimeMs: 1 }),
    readFile: async () => JSON.stringify({
      claudeAiOauth: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.parse('2026-06-12T00:00:00Z')
      }
    }),
    fetch: async () => ({
      ok: false,
      status: 500
    }),
    spawn: fakeSpawnForClaudeUsage()
  });

  assert.equal(provider.provider, 'claude');
  assert.equal(provider.status, 'ok');
  assert.equal(provider.source, 'cli');
  assert.equal(provider.windows[0].kind, 'session');
  assert.equal(provider.windows[0].usedPercent, 5);
  assert.equal(provider.windows[1].kind, 'weekly');
  assert.equal(provider.windows[1].usedPercent, 20);
});
