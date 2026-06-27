const MIN_PUBLIC_NUMBER = 1;
const MAX_PUBLIC_NUMBER = 30;

function toInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    throw new RangeError(`${fieldName}은 정수여야 합니다`);
  }
  return number;
}

function generateNumberPool(start = MIN_PUBLIC_NUMBER, end = MAX_PUBLIC_NUMBER) {
  const first = toInteger(start, '시작 번호');
  const last = toInteger(end, '끝 번호');

  if (first < MIN_PUBLIC_NUMBER) {
    throw new RangeError('시작 번호는 1 이상이어야 합니다');
  }
  if (last > MAX_PUBLIC_NUMBER) {
    throw new RangeError('끝 번호는 30 이하이어야 합니다');
  }
  if (first > last) {
    throw new RangeError('시작 번호는 끝 번호보다 클 수 없습니다');
  }

  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

function validateDrawConfig({ start = MIN_PUBLIC_NUMBER, end = MAX_PUBLIC_NUMBER, count = 1 }) {
  const pool = generateNumberPool(start, end);
  const winnerCount = toInteger(count, '당첨 수');

  if (winnerCount < 1) {
    throw new RangeError('당첨 수는 1 이상이어야 합니다');
  }
  if (winnerCount > pool.length) {
    throw new RangeError('당첨 수가 추첨 대상 번호 개수를 초과합니다');
  }

  return { start: Number(start), end: Number(end), count: winnerCount, pool };
}

function drawNumbers({ start = MIN_PUBLIC_NUMBER, end = MAX_PUBLIC_NUMBER, count = 1, random = Math.random } = {}) {
  const config = validateDrawConfig({ start, end, count });
  const remaining = [...config.pool];
  const winners = [];

  while (winners.length < config.count) {
    const index = Math.floor(random() * remaining.length);
    const [winner] = remaining.splice(index, 1);
    winners.push(winner);
  }

  return winners;
}

function createAuditRecord({
  agencyName = '공공기관',
  eventName = '공식 번호 추첨',
  start = MIN_PUBLIC_NUMBER,
  end = MAX_PUBLIC_NUMBER,
  count = 1,
  winners,
  now = () => new Date(),
}) {
  if (!Array.isArray(winners) || winners.length === 0) {
    throw new RangeError('감사 기록에는 당첨 번호가 필요합니다');
  }

  return Object.freeze({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    agencyName: agencyName.trim() || '공공기관',
    eventName: eventName.trim() || '공식 번호 추첨',
    rangeLabel: `${start}-${end}`,
    count,
    winners: Object.freeze([...winners]),
    timestamp: now().toISOString(),
  });
}

function buildOfficialResultText(record) {
  return [
    `[공식 추첨 결과]`,
    `기관명: ${record.agencyName}`,
    `행사명: ${record.eventName}`,
    `추첨 범위: ${record.rangeLabel}`,
    `당첨 번호: ${record.winners.join(', ')}`,
    `확정 시각: ${record.timestamp}`,
  ].join('\n');
}

export {
  buildOfficialResultText,
  createAuditRecord,
  drawNumbers,
  generateNumberPool,
  validateDrawConfig,
};
