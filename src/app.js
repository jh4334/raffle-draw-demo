import { buildOfficialResultText, createAuditRecord, drawNumbers, validateDrawConfig } from './officialDraw.js';

const agencyNameInput = document.querySelector('#agency-name');
const eventNameInput = document.querySelector('#event-name');
const startNumberInput = document.querySelector('#start-number');
const endNumberInput = document.querySelector('#end-number');
const winnerCountInput = document.querySelector('#winner-count');
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

function readConfig() {
  return {
    agencyName: agencyNameInput.value,
    eventName: eventNameInput.value,
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

function updateClock() {
  currentTime.textContent = new Date().toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'medium' });
}

function updateSummary() {
  try {
    const config = readConfig();
    validateDrawConfig(config);
    summaryText.textContent = `${config.agencyName || '공공기관'} · ${config.eventName || '공식 번호 추첨'} · 대상 ${config.start}-${config.end}번 · 당첨 ${config.count}명`;
    showMessage('추첨 조건이 유효합니다. 입회자 확인 후 추첨을 진행하세요.', 'info');
  } catch (error) {
    summaryText.textContent = '추첨 조건을 확인하세요.';
    showMessage(error.message, 'error');
  }
}

function renderWinners(winners) {
  const items = winners.map((winner) => {
    const item = document.createElement('li');
    item.className = 'winner-card';
    item.innerHTML = `<span class="winner-label">당첨 번호</span><strong>${winner}</strong>`;
    return item;
  });
  resultList.replaceChildren(...items);
}

function renderAuditLog() {
  if (auditRecords.length === 0) {
    auditList.innerHTML = '<li class="empty-log">아직 확정된 추첨 기록이 없습니다.</li>';
    return;
  }

  const items = auditRecords.map((record, index) => {
    const item = document.createElement('li');
    item.className = 'audit-item';
    item.innerHTML = `
      <div><strong>${auditRecords.length - index}회차</strong> ${record.eventName}</div>
      <div>범위 ${record.rangeLabel} · 당첨 ${record.winners.join(', ')}</div>
      <time>${new Date(record.timestamp).toLocaleString('ko-KR')}</time>
    `;
    return item;
  });
  auditList.replaceChildren(...items);
}

function performDraw({ isRedraw = false } = {}) {
  const config = readConfig();
  try {
    setStage(isRedraw ? '재추첨 진행 중' : '추첨 진행 중', 'running');
    validateDrawConfig(config);
    const winners = drawNumbers(config);
    latestRecord = createAuditRecord({ ...config, winners });
    auditRecords = [latestRecord, ...auditRecords];
    renderWinners(winners);
    renderAuditLog();
    setStage('결과 확정', 'confirmed');
    showMessage(isRedraw ? '재추첨 결과가 확정되었습니다. 이전 결과도 감사 로그에 보존됩니다.' : '추첨 결과가 확정되었습니다.', 'success');
  } catch (error) {
    setStage('추첨 대기', 'ready');
    resultList.replaceChildren();
    showMessage(error.message, 'error');
  }
}

function resetAll() {
  agencyNameInput.value = '공공기관';
  eventNameInput.value = '공식 번호 추첨';
  startNumberInput.value = '1';
  endNumberInput.value = '30';
  winnerCountInput.value = '1';
  latestRecord = null;
  auditRecords = [];
  resultList.replaceChildren();
  renderAuditLog();
  setStage('추첨 대기', 'ready');
  updateSummary();
}

async function copyLatestResult() {
  if (!latestRecord) {
    showMessage('복사할 확정 결과가 없습니다.', 'error');
    return;
  }
  const text = buildOfficialResultText(latestRecord);
  try {
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
renderAuditLog();
updateSummary();
