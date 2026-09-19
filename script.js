'use strict';

const intro = document.querySelector('#intro');
const mission = document.querySelector('#mission');
const start = document.querySelector('#start');
const back = document.querySelector('#back');

start.hidden = false;

start.addEventListener('click', () => {
  intro.hidden = true;
  mission.hidden = false;
  document.querySelector('#mission-title').focus();
});

back.addEventListener('click', () => {
  mission.hidden = true;
  intro.hidden = false;
  start.focus();
});
