import { draw, parseNames } from './raffle.js';

const namesInput = document.querySelector('#names');
const winnerCountInput = document.querySelector('#winner-count');
const drawButton = document.querySelector('#draw-button');
const resetButton = document.querySelector('#reset-button');
const resultList = document.querySelector('#result-list');
const message = document.querySelector('#message');

function clearResults() {
  resultList.replaceChildren();
}

function renderWinners(winners) {
  const items = winners.map((winner) => {
    const item = document.createElement('li');
    item.textContent = winner;
    return item;
  });

  resultList.replaceChildren(...items);
}

drawButton.addEventListener('click', () => {
  const names = parseNames(namesInput.value);
  const winnerCount = Number(winnerCountInput.value);

  try {
    const winners = draw(names, winnerCount);

    renderWinners(winners);
    message.textContent = '';
  } catch (error) {
    if (error instanceof RangeError) {
      clearResults();
      message.textContent = error.message;
      return;
    }

    throw error;
  }
});

resetButton.addEventListener('click', () => {
  namesInput.value = '';
  winnerCountInput.value = '1';
  clearResults();
  message.textContent = '';
});
