const MIN_WINNER_COUNT = 1;

function parseNames(raw) {
  const seen = new Set();
  const names = [];

  for (const line of raw.split('\n')) {
    const name = line.trim();

    if (name === '' || seen.has(name)) {
      continue;
    }

    seen.add(name);
    names.push(name);
  }

  return names;
}

function validateCount(names, count) {
  if (!Number.isFinite(count) || count < MIN_WINNER_COUNT) {
    throw new RangeError('당첨자 수는 1 이상이어야 합니다');
  }

  if (count > names.length) {
    throw new RangeError('당첨자 수가 참가자 수를 초과합니다');
  }
}

function shuffleNames(names, random = Math.random) {
  const shuffled = [...names];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function draw(names, count) {
  validateCount(names, count);

  return shuffleNames(names).slice(0, count);
}

function validateWinnerCount(count, names) {
  validateCount(names, count);
}

function drawWinners(names, count, random = Math.random) {
  validateCount(names, count);

  const remaining = [...names];
  const winners = [];

  while (winners.length < count) {
    const winnerIndex = Math.floor(random() * remaining.length);
    const [winner] = remaining.splice(winnerIndex, 1);
    winners.push(winner);
  }

  return winners;
}

export { draw, drawWinners, parseNames, validateCount, validateWinnerCount };
