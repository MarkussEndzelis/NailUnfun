const OBJECTS = [
    {icon: '🚦', label: 'TRAFFIC LIGHTS'},
    {icon: '🚗', label: 'CARS'},
    {icon: '🚏', label: 'BUS STOPS'},
    {icon: '🌳', label: 'TREES'},
    {icon: '🏠', label: 'HOUSES'},
    {icon: '🚲', label: 'BICYCLES'},
    {icon: '🛑', label: 'STOP SIGNS'},
    {icon: '🚧', label: 'CONSTRUCTION'},
    {icon: '⛲', label: 'FOUNTAINS'},
    {icon: '🏪', label: 'STORES'},
];

const GRID_SIZE = 16;
const TARGET_ROUNDS = 5;

let currentTarget = null;
let correctSet = new Set();
let selectedSet = new Set();
let roundsVerified = 0;
let rejections = 0;
let gameOver = false;

const gridEl = document.getElementById('grid');
const targetLabelEl = document.getElementById('targetLabel');
const resultLineEl = document.getElementById('resultLine');
const roundCountEl = document.getElementById('roundCount');
const rejectCountEl = document.getElementById('rejectCount');
const btnVerify = document.getElementById('btnVerify');
const btnReset = document.getElementById('btnReset');

function pickTarget(){
    return OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
}

function pickDecoy(excludeIcon){
    let pool = OBJECTS.filter(o => o.icon !== excludeIcon);
    return pool[Math.floor(Math.random() * pool.length)];
}

function buildRound(){
    if(gameOver){
        return;
    }

    selectedSet = new Set();
    correctSet = new Set();
    currentTarget = pickTarget();
    targetLabelEl.innerText = currentTarget.label;

    const correctCount = 3 + Math.floor(Math.random() * 3);
    const indices = Array.from({ length: GRID_SIZE}, (_, i) => i);

    for (let i = indices.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const correctIndices = indices.slice(0, correctCount);
    correctIndices.forEach(i => correctSet.add(i));

    gridEl.innerHTML = '';
    for (let i = 0; i < GRID_SIZE; i++){
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.index = i;
        const icon = correctSet.has(i) ? currentTarget.icon : pickDecoy(currentTarget.icon).icon;
        tile.innerText = icon;
        tile.addEventListener('click', () => toggleTile(icon, tile));
        gridEl.appendChild(tile);
    }

    resultLineEl.className = 'result-line';
    resultLineEl.innerText = 'Awaiting selection...';
}

function toggleTile(index, tileEl){
    if (gameOver){
        return;
    }
    if (selectedSet.has(index)){
        selectedSet.delete(index);
        tileEl.classList.remove('selected');
    }else{
        selectedSet.add(index);
        tileEl.classList.add('selected');
    }
}

function jaccard(a, b){
    const union = new Set([...a, ...b]);
    if (union.size === 0){
        return 0;
    }
    let intersection = 0;
    a.forEach(v => { if (b.has(v)) intersection++; });
    return intersection / union.size;
}

function verify(){
    if(gameOver){
        return;
    }

    if(selectedSet.size === 0){
        fail("NO SELECTION DETECTED. Suspiciously lazy for a human. REJECTED.")
        return;
    }

    const score = jaccard(selectedSet, correctSet);

    if (score === 1){
        fail("PERFECT MATCH. No human identifies traffic infrastructure this precisely. FLAGGED AS BOT.");
        return;
    }

    if(score >= 0.2 && score <= 0.75){
        pass();
        return;
    }

    if(score > 0.75){
        fail("SUSPICIOUSLY ACCURATE. Try being wrong on purpose.")
    }else {
        fail("SELECTION TOO RANDOM. At least pretend to try.");
    }
}

function pass(){
    roundsVerified++;
    roundCountEl.innerText = `${roundsVerified} / ${TARGET_ROUNDS}`;
    resultLineEl.className = 'result-line pass';
    resultLineEl.innerText = `VERIFIED. Your imperfection was acceptable this time.`;

    if (roundsVerified >= TARGET_ROUNDS){
        endGame();
    }else {
        setTimeout(buildRound, 1400);
    }
}

function fail(message){
    rejections++;
    rejectCountEl.innerText = rejections;
    resultLineEl.className = 'result-line fail';
    resultLineEl.innerText = message;
    setTimeout(buildRound, 1600);
}

function endGame(){
    gameOver = true;
    resultLineEl.className = 'result-line pass';
    resultLineEl.innerText = `HUMANITY CONFIRMED after ${rejections} rejection(s). You may now leave the internet.`;
    btnVerify.disabled = true;
    btnReset.innerText = 'PLAY AGAIN';
    btnReset.onclick = () => {
        roundsVerified = 0;
        rejections = 0;
        gameOver = false;
        roundCountEl.innerText = `0 / ${TARGET_ROUNDS}`;
        rejectCountEl.innerText = '0';
        btnVerify.disabled = false;
        btnReset.innerText = 'RESHUFFLE';
        btnReset.onclick = buildRound;
        buildRound();
    };
}

btnVerify.addEventListener('click', verify);
btnReset.addEventListener('click', buildRound);

buildRound();