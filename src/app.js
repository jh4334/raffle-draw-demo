import { buildOfficialResultText, createAuditRecord, drawNumbers, validateDrawConfig } from './officialDraw.js';

const DRAW_DELAY_MS = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320;

const agencyNameInput = document.querySelector('#agency-name');
const eventNameInput = document.querySelector('#event-name');
const startNumberInput = document.querySelector('#start-number');
const endNumberInput = document.querySelector('#end-number');
const winnerCountInput = document.querySelector('#winner-count');
const headerAgency = document.querySelector('#header-agency');
const headerEvent = document.querySelector('#header-event');
const drawButton = document.querySelector('#draw-button');
const redrawButton = document.querySelector('#redraw-button');
const resetButton = document.querySelector('#reset-button');
const copyButton = document.querySelector('#copy-button');
const resultList = document.querySelector('#result-list');
const message = document.querySelector('#message');
const stageText = document.querySelector('#stage-text');
const summaryText = document.querySelector('#condition-summary');
const auditList = document.querySelector('#audit-list');
const currentTime = document.querySelector('#current-time');

let latestRecord = null;
let auditRecords = [];
let isDrawing = false;
let currentConfigValid = true;
let pendingDraw = null;

function readConfig() {
  return {
    agencyName: agencyNameInput.value.trim(),
    eventName: eventNameInput.value.trim(),
    start: Number(startNumberInput.value),
    end: Number(endNumberInput.value),
    count: Number(winnerCountInput.value),
  };
}

function setStage(text, tone = 'ready') {
  stageText.textContent = text;
  stageText.dataset.tone = tone;
}

function showMessage(text, tone = 'info') {
  message.textContent = text;
  message.dataset.tone = tone;
}

function formatNumber(number) {
  return new Intl.NumberFormat('ko-KR').format(number);
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'medium' });
}

function updateClock() {
  currentTime.textContent = formatDateTime(new Date());
}

function syncActionState() {
  drawButton.disabled = isDrawing || !currentConfigValid;
  redrawButton.disabled = isDrawing || !currentConfigValid || auditRecords.length === 0;
  copyButton.disabled = isDrawing || !latestRecord;
  resetButton.disabled = isDrawing;
}

function updateHeader(config) {
  headerAgency.textContent = config.agencyName || '공공기관';
  headerEvent.textContent = config.eventName || '공식 번호 추첨';
}

function updateSummary() {
  const config = readConfig();
  updateHeader(config);

  try {
    validateDrawConfig(config);
    currentConfigValid = true;
    summaryText.textContent = `${config.agencyName || '공공기관'} · ${config.eventName || '공식 번호 추첨'} · 대상 ${formatNumber(config.start)}-${formatNumber(config.end)}번 · 당첨 ${formatNumber(config.count)}명`;
    if (latestRecord && !isDrawing) {
      showMessage('추첨 조건이 유효합니다. 재추첨은 새 회차로 감사 로그에 남습니다.', 'info');
    } else if (!latestRecord && !isDrawing) {
      showMessage('기본 조건 확인 후 공식 추첨을 시작하세요.', 'info');
    }
  } catch (error) {
    currentConfigValid = false;
    summaryText.textContent = '추첨 조건을 확인하세요.';
    showMessage(error.message, 'error');
  }

  syncActionState();
}

function renderResultPlaceholder(label = '확정 전') {
  const item = document.createElement('li');
  item.className = 'result-placeholder';

  const value = document.createElement('span');
  value.textContent = '--';

  const caption = document.createElement('small');
  caption.textContent = label;

  item.append(value, caption);
  resultList.replaceChildren(item);
}

function renderWinners(winners) {
  const items = winners.map((winner) => {
    const item = document.createElement('li');
    item.className = 'winner-card';

    const label = document.createElement('span');
    label.className = 'winner-label';
    label.textContent = '당첨 번호';

    const value = document.createElement('strong');
    value.textContent = String(winner);

    item.append(label, value);
    return item;
  });

  resultList.replaceChildren(...items);
}

function renderAuditLog() {
  if (auditRecords.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-log';
    empty.textContent = '확정 기록이 쌓이면 이곳에 회차별로 보존됩니다.';
    auditList.replaceChildren(empty);
    syncActionState();
    return;
  }

  const items = auditRecords.map((record, index) => {
    const round = auditRecords.length - index;
    const item = document.createElement('li');
    item.className = 'audit-item';

    const count = document.createElement('span');
    count.className = 'audit-count';
    count.textContent = `${round}회`;

    const main = document.createElement('div');
    main.className = 'audit-main';

    const title = document.createElement('strong');
    title.className = 'audit-title';
    title.textContent = record.eventName;

    const detail = document.createElement('span');
    detail.className = 'audit-detail';
    detail.textContent = `범위 ${record.rangeLabel} · 당첨 ${record.winners.join(', ')}`;

    const time = document.createElement('time');
    time.dateTime = record.timestamp;
    time.textContent = formatDateTime(record.timestamp);

    main.append(title, detail, time);
    item.append(count, main);
    return item;
  });

  auditList.replaceChildren(...items);
  syncActionState();
}

function performDraw({ isRedraw = false } = {}) {
  const config = readConfig();

  try {
    validateDrawConfig(config);
  } catch (error) {
    currentConfigValid = false;
    setStage('공식 추첨 대기', 'ready');
    showMessage(error.message, 'error');
    syncActionState();
    return;
  }

  window.clearTimeout(pendingDraw);
  isDrawing = true;
  resultList.classList.add('is-running');
  setStage(isRedraw ? '재추첨 진행 중' : '공식 추첨 진행 중', 'running');
  showMessage('입회 확인과 난수 추출을 진행 중입니다.', 'info');
  syncActionState();

  pendingDraw = window.setTimeout(() => {
    const winners = drawNumbers(config);
    latestRecord = createAuditRecord({ ...config, winners });
    auditRecords = [latestRecord, ...auditRecords];

    renderWinners(winners);
    renderAuditLog();
    resultList.classList.remove('is-running');
    setStage('공식 결과 확정', 'confirmed');
    showMessage(isRedraw ? '재추첨 결과가 확정되었습니다. 이전 결과는 감사 로그에 보존됩니다.' : '공식 추첨 결과가 확정되었습니다.', 'success');
    isDrawing = false;
    pendingDraw = null;
    syncActionState();
  }, DRAW_DELAY_MS);
}

function resetAll() {
  window.clearTimeout(pendingDraw);
  agencyNameInput.value = '공공기관';
  eventNameInput.value = '공식 번호 추첨';
  startNumberInput.value = '1';
  endNumberInput.value = '30';
  winnerCountInput.value = '1';
  latestRecord = null;
  auditRecords = [];
  isDrawing = false;
  pendingDraw = null;
  resultList.classList.remove('is-running');
  renderResultPlaceholder();
  renderAuditLog();
  setStage('공식 추첨 대기', 'ready');
  updateSummary();
}

async function copyLatestResult() {
  if (!latestRecord) {
    showMessage('복사할 확정 결과가 없습니다.', 'error');
    return;
  }
  const text = buildOfficialResultText(latestRecord);
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API unavailable');
    }
    await navigator.clipboard.writeText(text);
    showMessage('공식 결과 문구를 클립보드에 복사했습니다.', 'success');
  } catch {
    showMessage(text, 'info');
  }
}

[agencyNameInput, eventNameInput, startNumberInput, endNumberInput, winnerCountInput].forEach((element) => {
  element.addEventListener('input', updateSummary);
});

drawButton.addEventListener('click', () => performDraw());
redrawButton.addEventListener('click', () => performDraw({ isRedraw: true }));
resetButton.addEventListener('click', resetAll);
copyButton.addEventListener('click', copyLatestResult);

updateClock();
setInterval(updateClock, 1000);
renderResultPlaceholder();
renderAuditLog();
updateSummary();
