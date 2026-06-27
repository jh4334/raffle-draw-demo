import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildOfficialResultText,
  createAuditRecord,
  drawNumbers,
  generateNumberPool,
  validateDrawConfig,
} from '../src/officialDraw.js';

test('generateNumberPool creates inclusive numeric range from 1 to 30', () => {
  const numbers = generateNumberPool(1, 30);

  assert.equal(numbers.length, 30);
  assert.equal(numbers[0], 1);
  assert.equal(numbers.at(-1), 30);
});

test('validateDrawConfig rejects invalid public draw ranges and winner counts', () => {
  assert.throws(() => validateDrawConfig({ start: 0, end: 30, count: 1 }), RangeError);
  assert.throws(() => validateDrawConfig({ start: 1, end: 31, count: 1 }), RangeError);
  assert.throws(() => validateDrawConfig({ start: 10, end: 1, count: 1 }), RangeError);
  assert.throws(() => validateDrawConfig({ start: 1, end: 30, count: 31 }), RangeError);
});

test('drawNumbers returns unique winners inside configured range using injectable random', () => {
  const randomValues = [0.99, 0, 0.5];
  const winners = drawNumbers({ start: 1, end: 30, count: 3, random: () => randomValues.shift() ?? 0 });

  assert.equal(winners.length, 3);
  assert.equal(new Set(winners).size, 3);
  assert.ok(winners.every((number) => number >= 1 && number <= 30));
  assert.deepEqual(winners, [30, 1, 16]);
});

test('createAuditRecord stores immutable official draw metadata', () => {
  const record = createAuditRecord({
    agencyName: '서울○○기관',
    eventName: '공개 추첨',
    start: 1,
    end: 30,
    count: 2,
    winners: [7, 12],
    now: () => new Date('2026-06-27T04:00:00.000Z'),
  });

  assert.equal(record.agencyName, '서울○○기관');
  assert.equal(record.eventName, '공개 추첨');
  assert.equal(record.rangeLabel, '1-30');
  assert.deepEqual(record.winners, [7, 12]);
  assert.equal(record.timestamp, '2026-06-27T04:00:00.000Z');
});

test('buildOfficialResultText includes agency, event, range, winners, and timestamp', () => {
  const text = buildOfficialResultText({
    agencyName: '서울○○기관',
    eventName: '공개 추첨',
    rangeLabel: '1-30',
    winners: [7, 12],
    timestamp: '2026-06-27T04:00:00.000Z',
  });

  assert.match(text, /서울○○기관/);
  assert.match(text, /공개 추첨/);
  assert.match(text, /1-30/);
  assert.match(text, /7, 12/);
  assert.match(text, /2026-06-27T04:00:00.000Z/);
});
