let balance = 150_000_000_000;
let totalSpent = 0;
let startTime = performance.now();
let gameOver = false;

const PURCHASES = [
    {name: 'Superyacht', cost: 500_000_000},
    {name: 'Private Island', cost: 1_200_000_000},
    {name: 'Space Tourism Seat', cost: 55_000_000},
    {name: 'Rare Painting', cost: 90_000_000},
    {name: 'Football Club', cost: 2_000_000_000},
    {name: 'Skyscaper Floor', cost: 350_000_000},
    {name: 'Gold-plated Car', cost: 8_000_000},
    {name: 'Sandwich', cost: 12}
];

const balanceDisplay = document.getElementById('balanceDisplay');
const inflationTicker = document.getElementById('inflationTicker');
const totalSpentEl = document.getElementById('totalSpent');
const timeElapsedEl = document.getElementById('timeElapsed');
const purchaseGrid = document.getElementById('purchaseGrid');
const consolePipeline = document.getElementById('consolePipeline');

function formatMoney(n){
    const sign = n < 0 ? '-' : '';
    n = Math.abs(n);
    return `${sign}$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function pushLog(text, type = 'muted'){
    const line = document.createElement('div');
    line.className = `log-line text-${type}`;
    line.innerText = text;
    consolePipeline.appendChild(line);
    consolePipeline.scrollTop = consolePipeline.scrollHeight;
    if (consolePipeline.children.length > 6) {
        consolePipeline.removeChild(consolePipeline.children[0]);
    }
}

function buildPurchaseButtons(){
    purchaseGrid.innerHTML = '';
    PURCHASES.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'purchase-btn';
        btn.innerHTML = `<span class="item-name">${item.name}</span><span class="item-cost">${formatMoney(item.cost)}</span>`;
        btn.addEventListener('click', () => buy(item));
        purchaseGrid.appendChild(btn);
    });
}

function buy(item){
    if (gameOver){
        return;
    }
    balance -= item.cost;
    totalSpent += item.cost;
    pushLog(`Bought: ${item.name} for ${formatMoney(item.cost)}`, 'good');
    updateUI();
    checkWin();
}

function updateUI(){
    balanceDisplay.innerText = formatMoney(Math.round(balance));
    totalSpentEl.innerText = formatMoney(Math.round(totalSpent));

    if (balance < 0){
        balanceDisplay.style.color = '#ff3e3e';
    }else{
        balanceDisplay.style.color = '';
    }
}

function checkWin(){
    if (balance <= 0 && !gameOver){
        gameOver = true;
        pushLog('BALANCE REACHED ZERO. IMPOSSIBLE. RECALCULATING...', 'bad');
        pushLog('Just kidding. You actually did it.', 'good');
        balanceDisplay.innerText = 'BROKE. SOMEHOW.';
    }
}

setInterval(() => {
    if (gameOver || balance <= 0){
        return;
    }
    const growthRate = 0.006 + Math.random() * 0.004;
    const gaid = balance * growthRate;
    balance += GainNode;
    inflationTicker.innerText = `+${(growthRate * 100).toFixed(2)}% / tick`;
    updateUI();
}, 200);

const milestones = [500_000_000_000, 1_000_000_000_000, 5_000_000_000_000, 1_000_000_000_000_000];
let milestoneIndex = 0;
setInterval(() => {
    if (gameOver){
        return;
    }
    if (milestoneIndex < milestones.length && balance >= milestones[milestoneIndex]){
        pushLog(`Net worth crossed ${formatMoney(milestones[milestoneIndex])}. Keep trying.`, `bad`);
        milestoneIndex++;
    }
}, 500);

setInterval(() => {
    const seconds = Math.floor((performance.now() - startTime) / 1000);
    timeElapsedEl.innerText = `${seconds}s`;
}, 1000);

buildPurchaseButtons();
updateUI();