'use strict';

const STORAGE_KEY = 'operacion-cumpleanos-v8-test';
const BREAKFAST_CODE = '1023';
const GIFT_CODE = '1786';
const TEN_MINUTES = 2 * 1000;
const FIFTY_MINUTES = 2 * 1000;
const BREAKFAST = [
  { id: 'cafe', icon: '☕', name: 'Café', clue: 'Lo que despierta' },
  { id: 'zumo', icon: '🍊', name: 'Zumo', clue: 'Lo que se exprime' },
  { id: 'tostada', icon: '🍞', name: 'Tostada', clue: 'La base crujiente' },
  { id: 'tomate', icon: '🍅', name: 'Tomate', clue: 'Primero se unta' },
  { id: 'jamon', icon: '🥓', name: 'Jamón', clue: 'Después se corona' },
  { id: 'croissant', icon: '🥐', name: 'Croissant', clue: 'Lo que cruje' },
  { id: 'mermelada', icon: '🍓', name: 'Mermelada', clue: 'El final dulce' }
];
const PUZZLES = [
  { image: 'images/piscina.jpeg', label: 'FOTO 01 / 02' },
  { image: 'images/restaurante.jpeg', label: 'FOTO 02 / 02' }
];
const WORD_SIZE = 13;
const WORDS = [
  { value: 'P4PAYA', start: [1, 1], direction: [0, 1] },
  { value: 'J1MMY', start: [2, 11], direction: [1, 0] },
  { value: 'L4URA', start: [7, 11], direction: [1, -1] },
  { value: 'MARIB3L', start: [11, 11], direction: [0, -1] }
];
const defaultState = {
  screen: 'intro', breakfastOrder: ['croissant', 'cafe', 'jamon', 'zumo', 'mermelada', 'tostada', 'tomate'], breakfastAttempts: 0,
  waitTenUntil: 0, puzzleIndex: 0, puzzleBoards: [], puzzleMoves: [0, 0], puzzlesComplete: false, waitFiftyUntil: 0,
  foundWords: [], hintCount: 0
};
function loadState() { try { return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; } catch { return { ...defaultState }; } }
let state = loadState();
let selectedBreakfast = null;
let selectedTile = null;
let selection = null;
let countdownTimer = null;
const screens = [...document.querySelectorAll('main > section')];
const breakfastList = document.querySelector('#breakfast-list');
const photoPuzzle = document.querySelector('#photo-puzzle');
const grid = document.querySelector('#word-grid');
const wordStatus = document.querySelector('#word-status');
const wordHint = document.querySelector('#word-hint');
const hintStatus = document.querySelector('#hint-status');

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function showScreen(id, persist = true) {
  screens.forEach((screen) => { screen.hidden = screen.id !== id; });
  if (persist) { state.screen = id; saveState(); }
  document.querySelector(`#${id} h1, #${id} h2`)?.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'breakfast') renderBreakfast();
  if (id === 'puzzles') renderPuzzle();
  if (id === 'wordsearch') paintFoundWords();
  if (id === 'wait-ten') startCountdown('waitTenUntil', 'countdown-ten', 'glitch-photos');
  if (id === 'wait-fifty') startCountdown('waitFiftyUntil', 'countdown-fifty', 'glitch-words');
}

function renderBreakfast() {
  breakfastList.innerHTML = '';
  state.breakfastOrder.forEach((id, index) => {
    const item = BREAKFAST.find((entry) => entry.id === id);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'breakfast-card'; button.dataset.index = index;
    button.innerHTML = `<span class="breakfast-position">${index + 1}</span><span class="breakfast-icon">${item.icon}</span><span><strong>${item.name}</strong><small>${item.clue}</small></span>`;
    if (selectedBreakfast === index) button.classList.add('selected');
    breakfastList.append(button);
  });
}
breakfastList.addEventListener('click', (event) => {
  const card = event.target.closest('.breakfast-card'); if (!card) return;
  const index = Number(card.dataset.index);
  if (selectedBreakfast === null) { selectedBreakfast = index; renderBreakfast(); return; }
  [state.breakfastOrder[selectedBreakfast], state.breakfastOrder[index]] = [state.breakfastOrder[index], state.breakfastOrder[selectedBreakfast]];
  selectedBreakfast = null; saveState(); renderBreakfast();
});
document.querySelector('#check-breakfast').addEventListener('click', () => {
  state.breakfastAttempts += 1; saveState();
  if (state.breakfastAttempts === 1) { showScreen('breakfast-error'); return; }
  const correct = state.breakfastOrder.every((id, index) => id === BREAKFAST[index].id);
  const status = document.querySelector('#breakfast-status');
  if (!correct) { status.textContent = 'La comanda sigue desordenada. Revisa las pistas pequeñas.'; return; }
  status.textContent = ''; showScreen('breakfast-success');
});

function validateCode(formId, inputId, statusId, expected, waitKey, duration, nextScreen) {
  document.querySelector(formId).addEventListener('submit', (event) => {
    event.preventDefault(); const input = document.querySelector(inputId); const status = document.querySelector(statusId);
    if (input.value !== expected) { status.textContent = 'Código incorrecto. Revisa la tarjeta que acompaña al regalo.'; input.select(); return; }
    status.textContent = ''; if (!state[waitKey]) state[waitKey] = Date.now() + duration; saveState(); showScreen(nextScreen);
  });
}
validateCode('#breakfast-code-form', '#breakfast-code-input', '#breakfast-code-status', BREAKFAST_CODE, 'waitTenUntil', TEN_MINUTES, 'wait-ten');
validateCode('#gift-code-form', '#gift-code-input', '#gift-code-status', GIFT_CODE, 'waitFiftyUntil', FIFTY_MINUTES, 'wait-fifty');
function startCountdown(stateKey, outputId, nextScreen) {
  clearInterval(countdownTimer);
  const update = () => {
    const remaining = Math.max(0, state[stateKey] - Date.now());
    if (!state[stateKey] || remaining === 0) { clearInterval(countdownTimer); showScreen(nextScreen); return; }
    const minutes = Math.floor(remaining / 60000); const seconds = Math.floor((remaining % 60000) / 1000);
    document.querySelector(`#${outputId}`).textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  update(); countdownTimer = setInterval(update, 1000);
}

function seededRandom(seed) { let value = seed; return () => ((value = (value * 9301 + 49297) % 233280) / 233280); }
function shuffledBoard(seed) { const random = seededRandom(seed); const board = Array.from({ length: 16 }, (_, index) => index); for (let index = 15; index > 0; index -= 1) { const swap = Math.floor(random() * (index + 1)); [board[index], board[swap]] = [board[swap], board[index]]; } return board; }
function ensurePuzzleState() { if (!state.puzzleBoards[0]) state.puzzleBoards[0] = shuffledBoard(2309); if (!state.puzzleBoards[1]) state.puzzleBoards[1] = shuffledBoard(1990); saveState(); }
function renderPuzzle() {
  ensurePuzzleState(); const stage = document.querySelector('#puzzle-stage'); const complete = document.querySelector('#puzzles-complete');
  if (state.puzzlesComplete || state.puzzleIndex >= PUZZLES.length) { stage.hidden = true; complete.hidden = false; return; }
  stage.hidden = false; complete.hidden = true; const puzzle = PUZZLES[state.puzzleIndex]; const board = state.puzzleBoards[state.puzzleIndex]; photoPuzzle.innerHTML = '';
  board.forEach((sourceIndex, position) => { const tile = document.createElement('button'); const row = Math.floor(sourceIndex / 4); const column = sourceIndex % 4; tile.type = 'button'; tile.className = 'puzzle-tile'; tile.dataset.position = position; tile.style.backgroundImage = `url('${puzzle.image}')`; tile.style.backgroundPosition = `${column * 100 / 3}% ${row * 100 / 3}%`; tile.setAttribute('aria-label', `Pieza ${position + 1}`); photoPuzzle.append(tile); });
  document.querySelector('#puzzle-label').textContent = puzzle.label; document.querySelector('#move-count').textContent = `${state.puzzleMoves[state.puzzleIndex]} movimientos`;
  document.querySelector('#puzzle-instructions').textContent = state.puzzleIndex === 0 ? 'Primero, reconstruye la foto de la piscina.' : 'Primera recuperada. Ahora toca la del restaurante.'; selectedTile = null;
}
function checkPuzzle() { if (!state.puzzleBoards[state.puzzleIndex].every((value, index) => value === index)) return; state.puzzleIndex += 1; if (state.puzzleIndex >= PUZZLES.length) state.puzzlesComplete = true; saveState(); setTimeout(renderPuzzle, 500); }
photoPuzzle.addEventListener('click', (event) => { const tile = event.target.closest('.puzzle-tile'); if (!tile) return; const position = Number(tile.dataset.position); if (selectedTile === null) { selectedTile = position; tile.classList.add('selected'); return; } const board = state.puzzleBoards[state.puzzleIndex]; [board[selectedTile], board[position]] = [board[position], board[selectedTile]]; state.puzzleMoves[state.puzzleIndex] += 1; saveState(); renderPuzzle(); checkPuzzle(); });
document.querySelector('#puzzle-hint').addEventListener('click', () => { const board = state.puzzleBoards[state.puzzleIndex]; const wrong = board.findIndex((value, index) => value !== index); if (wrong < 0) return; const correctTile = board.indexOf(wrong); [board[wrong], board[correctTile]] = [board[correctTile], board[wrong]]; saveState(); renderPuzzle(); checkPuzzle(); });

function buildWordGrid() {
  const random = seededRandom(230990); const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ111223344556789'; const letters = Array.from({ length: WORD_SIZE * WORD_SIZE }, () => alphabet[Math.floor(random() * alphabet.length)]);
  WORDS.forEach(({ value, start, direction }) => [...value].forEach((character, index) => { const row = start[0] + direction[0] * index; const column = start[1] + direction[1] * index; letters[row * WORD_SIZE + column] = character; })); grid.innerHTML = '';
  letters.forEach((character, index) => { const cell = document.createElement('button'); cell.type = 'button'; cell.className = 'word-cell'; cell.textContent = character; cell.dataset.index = index; cell.setAttribute('role', 'gridcell'); grid.append(cell); }); paintFoundWords();
}
function indexesBetween(startIndex, endIndex) { const sr = Math.floor(startIndex / WORD_SIZE), sc = startIndex % WORD_SIZE, er = Math.floor(endIndex / WORD_SIZE), ec = endIndex % WORD_SIZE; const rd = er - sr, cd = ec - sc; if (!(rd === 0 || cd === 0 || Math.abs(rd) === Math.abs(cd))) return []; const steps = Math.max(Math.abs(rd), Math.abs(cd)); return Array.from({ length: steps + 1 }, (_, i) => (sr + Math.sign(rd) * i) * WORD_SIZE + sc + Math.sign(cd) * i); }
function wordIndexes(word) { return [...word.value].map((_, index) => (word.start[0] + word.direction[0] * index) * WORD_SIZE + word.start[1] + word.direction[1] * index); }
function clearProvisional() { grid.querySelectorAll('.selecting').forEach((cell) => cell.classList.remove('selecting')); }
function updateSelection(endIndex) { if (!selection) return; clearProvisional(); selection.indexes = indexesBetween(selection.start, endIndex); selection.indexes.forEach((index) => grid.children[index].classList.add('selecting')); }
function finishSelection() { if (!selection) return; const candidate = selection.indexes.map((index) => grid.children[index].textContent).join(''); const reversed = [...candidate].reverse().join(''); const match = WORDS.find(({ value }) => candidate === value || reversed === value); clearProvisional(); if (match && !state.foundWords.includes(match.value)) { state.foundWords.push(match.value); saveState(); paintFoundWords(); } selection = null; }
function paintFoundWords() { grid.querySelectorAll('.found, .hinted').forEach((cell) => cell.classList.remove('found', 'hinted')); WORDS.slice(0, state.hintCount).forEach((word) => grid.children[wordIndexes(word)[0]]?.classList.add('hinted')); state.foundWords.forEach((value) => { const word = WORDS.find((item) => item.value === value); if (word) wordIndexes(word).forEach((index) => grid.children[index]?.classList.add('found')); }); wordStatus.textContent = `${state.foundWords.length} de 4 palabras encontradas`; wordHint.hidden = state.hintCount >= WORDS.length; hintStatus.textContent = state.hintCount ? `Pista ${state.hintCount}: la primera letra marcada en amarillo es la ${WORDS[state.hintCount - 1].value[0]}.` : ''; if (state.foundWords.length === WORDS.length && state.screen === 'wordsearch') setTimeout(() => showScreen('final-gift'), 650); }
wordHint.addEventListener('click', () => { if (state.hintCount >= WORDS.length) return; state.hintCount += 1; saveState(); paintFoundWords(); });
grid.addEventListener('pointerdown', (event) => { const cell = event.target.closest('.word-cell'); if (!cell) return; event.preventDefault(); grid.setPointerCapture(event.pointerId); selection = { start: Number(cell.dataset.index), indexes: [] }; updateSelection(selection.start); });
grid.addEventListener('pointermove', (event) => { if (!selection) return; const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.word-cell'); if (target && grid.contains(target)) updateSelection(Number(target.dataset.index)); });
grid.addEventListener('pointerup', finishSelection); grid.addEventListener('pointercancel', () => { clearProvisional(); selection = null; });

document.querySelector('#start').addEventListener('click', () => showScreen('breakfast'));
document.addEventListener('click', (event) => { const button = event.target.closest('[data-next]'); if (button) showScreen(button.dataset.next); });
buildWordGrid();
if (state.screen === 'wait-ten' && state.waitTenUntil && state.waitTenUntil <= Date.now()) state.screen = 'glitch-photos';
if (state.screen === 'wait-fifty' && state.waitFiftyUntil && state.waitFiftyUntil <= Date.now()) state.screen = 'glitch-words';
showScreen(state.screen, false);
