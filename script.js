'use strict';

const STORAGE_KEY = 'operacion-cumpleanos-v6';
const WAIT_MS = 20 * 60 * 1000;
const FINAL_CODE = '7392';
const STORIES = {
  life: [
    { kicker: 'TAL DÍA COMO HOY', title: 'Hace 36 años<br><em>empezó todo.</em>', text: 'Desde aquel 23 de septiembre han pasado 13.149 días. Parece mucho, pero se han quedado cortos para todo lo que ha ocurrido.' },
    { kicker: '36 VUELTAS AL SOL', title: '13.149<br><em>amaneceres.</em>', text: 'Días normales, días enormes, viajes, cambios de planes y más de una historia que empezó sin avisar.' },
    { kicker: 'CÁLCULO APROXIMADO', title: '303 millones de<br><em>respiraciones.</em>', text: 'Unas tranquilas, otras entre risas y unas cuantas intentando recuperar el aire después de algún plan brillante.' },
    { kicker: 'MOTOR INTERNO', title: '1.325 millones de<br><em>latidos.</em>', text: 'La cifra es aproximada. En su caso puede ser mayor: ya sabemos que el corazón no le cabe en el pecho.' },
    { kicker: 'LOS PRIMEROS CAPÍTULOS', title: 'Ha cambiado.<br><em>Por suerte.</em>', text: 'Han cambiado los años, los planes y alguna que otra versión. La sonrisa ya estaba allí desde el principio.', image: 'images/story/01-inicios.jpg', alt: 'Ainhoa de joven con una amiga en clase' },
    { kicker: 'AMIGAS // MUCHAS HISTORIAS', title: 'Gente que<br><em>se queda.</em>', text: 'No se llega hasta aquí sola. Hay amigas, noches, viajes y momentos pequeños que acabaron siendo parte de la historia.', image: 'images/story/02-amigas.jpg', alt: 'Ainhoa de joven con sus amigas' },
    { kicker: 'EL TIEMPO PASA', title: 'La risa<br><em>se mantiene.</em>', text: 'Cambian los sitios y las épocas. La facilidad para montar un plan y reírse sigue exactamente donde estaba.', image: 'images/story/03-historias.jpg', alt: 'Ainhoa sonriendo en uno de sus recuerdos' },
    { kicker: 'MÁS GENTE, MÁS CAPÍTULOS', title: 'Una vida bien<br><em>acompañada.</em>', text: 'Familia, amigas y toda la gente que ha ido sumando. Ese también es uno de sus grandes logros.', image: 'images/story/04-gym.jpg', alt: 'Ainhoa sonriendo con una amiga en el gimnasio' },
    { kicker: 'HOY // NIVEL 36', title: 'Treinta y seis<br><em>años después.</em>', text: 'Muchos países, muchas versiones y la misma capacidad para ver el lado bueno incluso cuando el plan se complica.', image: 'images/story/05-cumple-36.jpg', alt: 'Ainhoa celebrando su cumpleaños 36 con un pañuelo amarillo' }
  ],
  achievements: [
    { kicker: 'OBJETIVO CONSEGUIDO', title: 'Una casa<br><em>propia.</em>', text: 'Uno de esos objetivos que parecían lejanos ya está cumplido. Una casa suya, conseguida paso a paso y sin que nadie le regalase nada.' },
    { kicker: 'PRIORIDADES IMPORTANTES', title: 'Y un sofá<br><em>como debe ser.</em>', text: 'Porque comprar una casa está muy bien, pero tener un sofá enorme donde disfrutarla era parte indispensable del proyecto.' },
    { kicker: 'TRABAJO Y FORMACIÓN', title: 'Carrera, máster<br><em>y mucho esfuerzo.</em>', text: 'Ha estudiado, se ha preparado y se ha ganado cada paso. Hoy trabaja en una de las empresas más grandes del mundo. Es para estar muy orgullosa.' },
    { kicker: 'LO QUE NO SALE EN EL CURRÍCULUM', title: 'Todo lo demás<br><em>que ha construido.</em>', text: 'Una vida llena de gente que la quiere, una casa, objetivos cumplidos y otros todavía por estrenar. El expediente debería terminar aquí. Pero algo vuelve a fallar.' }
  ]
};
const WORD_SIZE = 13;
const WORDS = [
  { value: 'P4PAYA', start: [1, 1], direction: [0, 1] },
  { value: 'J1MMY', start: [2, 11], direction: [1, 0] },
  { value: 'L4URA', start: [7, 11], direction: [1, -1] },
  { value: 'MARIB3L', start: [11, 11], direction: [0, -1] }
];
const PUZZLES = [
  { image: 'images/piscina.jpeg', label: 'FOTO 01 / 02' },
  { image: 'images/restaurante.jpeg', label: 'FOTO 02 / 02' }
];
const defaultState = {
  screen: 'intro', storyPhase: 'life', storyIndex: 0, puzzleIndex: 0, puzzleBoards: [], puzzleMoves: [0, 0], puzzlesComplete: false,
  nextMissionAt: 0, foundWords: [], hintCount: 0, codeAttempts: 0, codeStage: 'entry', giftUnlocked: false, finalUnlockAt: 0
};

function loadState() {
  try { return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return { ...defaultState }; }
}

let state = loadState();
const screens = [...document.querySelectorAll('main > section')];
const grid = document.querySelector('#word-grid');
const wordStatus = document.querySelector('#word-status');
const wordHint = document.querySelector('#word-hint');
const hintStatus = document.querySelector('#hint-status');
const photoPuzzle = document.querySelector('#photo-puzzle');
const codeForm = document.querySelector('#code-form');
const codeInput = document.querySelector('#code');
const lockIcon = document.querySelector('#lock-icon');
const errorVideo = document.querySelector('#error-video');
const codeOpen = document.querySelector('#code-open');
let selection = null;
let selectedTile = null;
let countdownTimer = null;

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function showScreen(id, persist = true) {
  screens.forEach((screen) => { screen.hidden = screen.id !== id; });
  if (persist) { state.screen = id; saveState(); }
  document.querySelector(`#${id} h1, #${id} h2`)?.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'story') renderStory();
  if (id === 'puzzles') renderPuzzle();
  if (id === 'waiting') startCountdown();
  if (id === 'final-wait') startFinalCountdown();
  if (id === 'mission') paintFoundWords();
  if (id === 'lock') renderLock();
}

function renderStory() {
  const slides = STORIES[state.storyPhase];
  const slide = slides[state.storyIndex];
  const wrap = document.querySelector('#story-photo-wrap');
  const photo = document.querySelector('#story-photo');
  document.querySelector('#story-kicker').textContent = slide.kicker;
  document.querySelector('#story-title').innerHTML = slide.title;
  document.querySelector('#story-text').textContent = slide.text;
  document.querySelector('#story-progress-bar').style.width = `${((state.storyIndex + 1) / slides.length) * 100}%`;
  wrap.hidden = !slide.image;
  if (slide.image) { photo.src = slide.image; photo.alt = slide.alt; }
  document.querySelector('#story-next').innerHTML = state.storyIndex === slides.length - 1
    ? 'Cerrar el archivo <span aria-hidden="true">→</span>'
    : 'Seguir <span aria-hidden="true">→</span>';
}

document.querySelector('#start').addEventListener('click', () => showScreen('story'));
document.querySelector('#story-next').addEventListener('click', () => {
  const slides = STORIES[state.storyPhase];
  if (state.storyIndex < slides.length - 1) { state.storyIndex += 1; saveState(); renderStory(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else showScreen(state.storyPhase === 'life' ? 'glitch-one' : 'glitch-two');
});

function seededRandom(seed) { let value = seed; return () => ((value = (value * 9301 + 49297) % 233280) / 233280); }
function shuffledBoard(seed) {
  const random = seededRandom(seed); const board = Array.from({ length: 16 }, (_, index) => index);
  for (let index = board.length - 1; index > 0; index -= 1) { const swap = Math.floor(random() * (index + 1)); [board[index], board[swap]] = [board[swap], board[index]]; }
  return board;
}
function ensurePuzzleState() {
  if (!state.puzzleBoards[0]) state.puzzleBoards[0] = shuffledBoard(2309);
  if (!state.puzzleBoards[1]) state.puzzleBoards[1] = shuffledBoard(1990);
  saveState();
}
function renderPuzzle() {
  ensurePuzzleState();
  const stage = document.querySelector('#puzzle-stage'); const complete = document.querySelector('#puzzles-complete');
  if (state.puzzlesComplete || state.puzzleIndex >= PUZZLES.length) { stage.hidden = true; complete.hidden = false; return; }
  stage.hidden = false; complete.hidden = true;
  const puzzle = PUZZLES[state.puzzleIndex]; const board = state.puzzleBoards[state.puzzleIndex]; photoPuzzle.innerHTML = '';
  board.forEach((sourceIndex, position) => {
    const tile = document.createElement('button'); const row = Math.floor(sourceIndex / 4); const column = sourceIndex % 4;
    tile.type = 'button'; tile.className = 'puzzle-tile'; tile.dataset.position = position; tile.style.backgroundImage = `url('${puzzle.image}')`;
    tile.style.backgroundPosition = `${column * 100 / 3}% ${row * 100 / 3}%`; tile.setAttribute('aria-label', `Pieza ${position + 1}`); photoPuzzle.append(tile);
  });
  document.querySelector('#puzzle-label').textContent = puzzle.label;
  document.querySelector('#move-count').textContent = `${state.puzzleMoves[state.puzzleIndex]} movimientos`;
  document.querySelector('#puzzle-instructions').textContent = state.puzzleIndex === 0
    ? 'Toca dos piezas para intercambiarlas. Primero, la foto de la piscina.'
    : 'Primera foto recuperada. Ahora toca reconstruir la del restaurante.';
  selectedTile = null;
}
function checkPuzzle() {
  if (!state.puzzleBoards[state.puzzleIndex].every((value, index) => value === index)) return;
  state.puzzleIndex += 1; if (state.puzzleIndex >= PUZZLES.length) state.puzzlesComplete = true; saveState(); setTimeout(renderPuzzle, 500);
}
photoPuzzle.addEventListener('click', (event) => {
  const tile = event.target.closest('.puzzle-tile'); if (!tile) return; const position = Number(tile.dataset.position);
  if (selectedTile === null) { selectedTile = position; tile.classList.add('selected'); return; }
  const board = state.puzzleBoards[state.puzzleIndex]; [board[selectedTile], board[position]] = [board[position], board[selectedTile]];
  state.puzzleMoves[state.puzzleIndex] += 1; saveState(); renderPuzzle(); checkPuzzle();
});
document.querySelector('#puzzle-hint').addEventListener('click', () => {
  const board = state.puzzleBoards[state.puzzleIndex]; const wrong = board.findIndex((value, index) => value !== index); if (wrong < 0) return;
  const correctTile = board.indexOf(wrong); [board[wrong], board[correctTile]] = [board[correctTile], board[wrong]]; saveState(); renderPuzzle(); checkPuzzle();
});
document.querySelector('#begin-wait').addEventListener('click', () => {
  if (!state.nextMissionAt) state.nextMissionAt = Date.now() + WAIT_MS; saveState(); showScreen('waiting');
});
function startCountdown() {
  clearInterval(countdownTimer);
  const update = () => {
    const remaining = Math.max(0, state.nextMissionAt - Date.now());
    if (!state.nextMissionAt || remaining === 0) { clearInterval(countdownTimer); state.storyPhase = 'achievements'; state.storyIndex = 0; saveState(); showScreen('story'); return; }
    const minutes = Math.floor(remaining / 60000); const seconds = Math.floor((remaining % 60000) / 1000);
    document.querySelector('#countdown').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  update(); countdownTimer = setInterval(update, 1000);
}

function buildWordGrid() {
  const random = seededRandom(230990); const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ111223344556789';
  const letters = Array.from({ length: WORD_SIZE * WORD_SIZE }, () => alphabet[Math.floor(random() * alphabet.length)]);
  WORDS.forEach(({ value, start, direction }) => [...value].forEach((character, index) => { const row = start[0] + direction[0] * index; const column = start[1] + direction[1] * index; letters[row * WORD_SIZE + column] = character; }));
  grid.innerHTML = '';
  letters.forEach((character, index) => { const cell = document.createElement('button'); cell.type = 'button'; cell.className = 'word-cell'; cell.textContent = character; cell.dataset.index = index; cell.setAttribute('role', 'gridcell'); cell.setAttribute('aria-label', `${character}, fila ${Math.floor(index / WORD_SIZE) + 1}, columna ${(index % WORD_SIZE) + 1}`); grid.append(cell); });
  paintFoundWords();
}
function indexesBetween(startIndex, endIndex) {
  const sr = Math.floor(startIndex / WORD_SIZE), sc = startIndex % WORD_SIZE, er = Math.floor(endIndex / WORD_SIZE), ec = endIndex % WORD_SIZE;
  const rd = er - sr, cd = ec - sc; if (!(rd === 0 || cd === 0 || Math.abs(rd) === Math.abs(cd))) return [];
  const steps = Math.max(Math.abs(rd), Math.abs(cd)); return Array.from({ length: steps + 1 }, (_, i) => (sr + Math.sign(rd) * i) * WORD_SIZE + sc + Math.sign(cd) * i);
}
function wordIndexes(word) { return [...word.value].map((_, index) => (word.start[0] + word.direction[0] * index) * WORD_SIZE + word.start[1] + word.direction[1] * index); }
function clearProvisional() { grid.querySelectorAll('.selecting').forEach((cell) => cell.classList.remove('selecting')); }
function updateSelection(endIndex) { if (!selection) return; clearProvisional(); selection.indexes = indexesBetween(selection.start, endIndex); selection.indexes.forEach((index) => grid.children[index].classList.add('selecting')); }
function finishSelection() {
  if (!selection) return; const candidate = selection.indexes.map((index) => grid.children[index].textContent).join(''); const reversed = [...candidate].reverse().join('');
  const match = WORDS.find(({ value }) => candidate === value || reversed === value); clearProvisional();
  if (match && !state.foundWords.includes(match.value)) { state.foundWords.push(match.value); saveState(); paintFoundWords(); } selection = null;
}
function paintFoundWords() {
  grid.querySelectorAll('.found, .hinted').forEach((cell) => cell.classList.remove('found', 'hinted'));
  WORDS.slice(0, state.hintCount).forEach((word) => grid.children[wordIndexes(word)[0]]?.classList.add('hinted'));
  state.foundWords.forEach((value) => { const word = WORDS.find((item) => item.value === value); if (word) wordIndexes(word).forEach((index) => grid.children[index]?.classList.add('found')); });
  wordStatus.textContent = `${state.foundWords.length} de 4 palabras encontradas`; wordHint.hidden = state.hintCount >= WORDS.length;
  hintStatus.textContent = state.hintCount ? `Pista ${state.hintCount}: la primera letra marcada en amarillo es la ${WORDS[state.hintCount - 1].value[0]}.` : '';
  if (state.foundWords.length === WORDS.length && state.screen === 'mission') setTimeout(() => showScreen('lock'), 650);
}
wordHint.addEventListener('click', () => { if (state.hintCount >= WORDS.length) return; state.hintCount += 1; saveState(); paintFoundWords(); });
grid.addEventListener('pointerdown', (event) => { const cell = event.target.closest('.word-cell'); if (!cell) return; event.preventDefault(); grid.setPointerCapture(event.pointerId); selection = { start: Number(cell.dataset.index), indexes: [] }; updateSelection(selection.start); });
grid.addEventListener('pointermove', (event) => { if (!selection) return; const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.word-cell'); if (target && grid.contains(target)) updateSelection(Number(target.dataset.index)); });
grid.addEventListener('pointerup', finishSelection); grid.addEventListener('pointercancel', () => { clearProvisional(); selection = null; });

function renderLock() {
  const isError = state.codeStage === 'error' && !state.giftUnlocked; lockIcon.classList.toggle('open', state.giftUnlocked);
  codeForm.hidden = isError || state.giftUnlocked; errorVideo.hidden = !isError; codeOpen.hidden = !state.giftUnlocked;
}
codeForm.addEventListener('submit', (event) => {
  event.preventDefault(); state.codeAttempts += 1;
  if (state.codeAttempts === 1) state.codeStage = 'error'; else { state.codeStage = 'success'; state.giftUnlocked = true; }
  saveState(); renderLock();
});
document.querySelector('#retry-code').addEventListener('click', () => { state.codeStage = 'entry'; saveState(); renderLock(); codeInput.value = ''; codeInput.focus(); });
document.querySelector('#final-code-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.querySelector('#final-code');
  const status = document.querySelector('#final-code-status');
  if (input.value !== FINAL_CODE) { status.textContent = 'Código incorrecto. Revisa la tarjeta que acompaña al regalo.'; input.select(); return; }
  status.textContent = '';
  if (!state.finalUnlockAt) state.finalUnlockAt = Date.now() + 60 * 60 * 1000;
  saveState(); showScreen('final-wait');
});
function startFinalCountdown() {
  clearInterval(countdownTimer);
  const update = () => {
    const remaining = Math.max(0, state.finalUnlockAt - Date.now());
    if (!state.finalUnlockAt || remaining === 0) { clearInterval(countdownTimer); showScreen('destination'); return; }
    const hours = Math.floor(remaining / 3600000), minutes = Math.floor((remaining % 3600000) / 60000), seconds = Math.floor((remaining % 60000) / 1000);
    document.querySelector('#final-countdown').textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  update(); countdownTimer = setInterval(update, 1000);
}
document.addEventListener('click', (event) => { const button = event.target.closest('[data-next]'); if (button) showScreen(button.dataset.next); });

buildWordGrid();
if (state.screen === 'waiting' && state.nextMissionAt && state.nextMissionAt <= Date.now()) { state.storyPhase = 'achievements'; state.storyIndex = 0; state.screen = 'story'; }
if (state.screen === 'final-wait' && state.finalUnlockAt && state.finalUnlockAt <= Date.now()) state.screen = 'destination';
showScreen(state.screen, false);
