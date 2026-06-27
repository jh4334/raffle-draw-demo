import assert from 'node:assert/strict';
import test from 'node:test';

import { drawWinners, parseNames, validateWinnerCount } from '../src/raffle.js';

test('parseNames trims names, removes blank lines, and keeps first unique order', () => {
  const input = '  김하나  \n\n이두리\n김하나\n  박세찬  \n   ';

  const names = parseNames(input);

  assert.deepEqual(names, ['김하나', '이두리', '박세찬']);
});

test('validateWinnerCount rejects counts below one', () => {
  assert.throws(() => validateWinnerCount(0, ['김하나']), RangeError);
});

test('validateWinnerCount rejects counts larger than participant count', () => {
  assert.throws(() => validateWinnerCount(3, ['김하나', '이두리']), RangeError);
});

test('drawWinners returns requested number of unique participants using injectable random', () => {
  const randomValues = [0.99, 0.01];
  const random = () => randomValues.shift() ?? 0;

  const winners = drawWinners(['김하나', '이두리', '박세찬'], 2, random);

  assert.equal(winners.length, 2);
  assert.equal(new Set(winners).size, 2);
  assert.deepEqual(winners, ['박세찬', '김하나']);
});

test('drawWinners can draw every participant without duplicates', () => {
  const winners = drawWinners(['김하나', '이두리', '박세찬'], 3, () => 0);

  assert.deepEqual(winners.sort(), ['김하나', '박세찬', '이두리'].sort());
});
