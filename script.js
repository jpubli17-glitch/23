'use strict';

const intro = document.querySelector('#intro');
const start = document.querySelector('#start');
const screens = [...document.querySelectorAll('main > section')];

start.hidden = false;

function showScreen(id) {
  screens.forEach((screen) => { screen.hidden = screen.id !== id; });
  const title = document.querySelector(`#${id} h1, #${id} h2`);
  if (title) title.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

start.addEventListener('click', () => showScreen('story'));

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-next], [data-back]');
  if (!button) return;
  showScreen(button.dataset.next || button.dataset.back);
});
