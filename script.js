let rageLevel = 0;
const rageBar = document.getElementById('rageBar');
const ragePercent = document.getElementById('ragePercent');
const bodyElement = document.body;

const industrialInsults = [
    "Stop clicking furiously. It won't compile faster.",
    "Your erratic mouse gestures indicate structural panic.",
    "Clicking empty space implies a severe lack of interface comprehension.",
    "Error: Click tracking overhead exceeded. Slow down.",
    "Warning: User patience dropping below acceptable parameters.",
    "Buffer Overflow: Aggression vectors exceeding optimal thresholds.",
    "System Alert: Hostile hardware interaction detected."
];

window.addEventListener('click', (event) => {
    if (event.target === bodyElement || event.target.tagName === 'HEADER' || event.target.tagName === 'MAIN'){
        rageLevel = Math.min(rageLevel + 12, 100);
        spawnFloatingInsult(event.clientX, event.clientY);
    }else {
        rageLevel = Math.min(rageLevel + 6, 100);
    }
    updateRageUI();
});

window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    rageLevel = Math.min(rageLevel + 25, 100);
    updateRageUI();
    spawnFloatingInsult(event.clientX, event.clientY, "ACCESS DENIED");
});

setInterval(() => {
    if (rageLevel > 0) {
        rageLevel = Math.max(rageLevel - 1.5, 0);
        updateRageUI();
    }
}, 120);

function updateRageUI() {
    rageBar.style.width = `${rageLevel}%`;
    ragePercent.innerText = `${Math.floor(rageLevel)}%`;

    if (rageLevel >= 75){
        bodyElement.classList.add('shake-active');
        rageBar.style.background = '#ff0000';
        bodyElement.style.setProperty('--terminal-accent', '#ff0000');
        bodyElement.style.setProperty('--terminal-glow', 'rgba(255, 0, 0, 0.4)');
    }else if (rageLevel >= 40) {
        bodyElement.classList.remove('shake-active');
        rageBar.style.background = '#ff6600';
        bodyElement.style.setProperty('--terminal-accent', '#ff6600');
        bodyElement.style.setProperty('--terminal-glow', 'rgba(255, 102, 0, 0.2)');
    }else{
        bodyElement.classList.remove('shake-active');
        rageBar.style.background = 'linear-gradient(90deg, #ff3e3e, #ff0055)';
        bodyElement.style.setProperty('--terminal-accent', '#ff3e3e');
        bodyElement.style.setProperty('--terminal-glow', 'rgba(255, 62, 62, 0.2)');
    }
}

function spawnFloatingInsult(x, y, customText = null){
    const toast = document.createElement('div');
    toast.className = 'floating-insult-node';

    if (customText){
        toast.innerText = `![${customText}]`;
    }else {
        const randomIndex = Math.floor(Math.random() * industrialInsults.length);
        toast.innerText = `[ERR]: ${industrialInsults[randomIndex]}`;
        console.warn(`[NailUnfun Diagnostics]: ${industrialInsults[randomIndex]}`);
    }

    toast.style.left = `${x}px`;
    toast.style.top = `${y}px`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}