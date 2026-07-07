let rageLevel = 0;
const rageBar = document.getElementById('rageBar');
const ragePercent = document.getElementById('ragePercent');
const bodyElement = document.body;

const industrialInsults = [
    "Stop clicking furiosly. It won't compile faster.",
    "Your erratic mouse gestures indicate structural panic.",
    "Clicking empty space implies a severe lack of interface comprehension.",
    "Error: Click tracking overhead exceeded. Slow down.",
    "Warning: User patience dropping below acceptable parameters."
];

window.addEventListener('click', (event) => {
    rageLevel = Math.min(rageLevel + 8, 100);
    updateRageUI();

    if(event.target === bodyElement || event.target.tagName === 'HEADER'){
        const structuralIndex = Math.floor(Math.random() * industrialInsults.length);
        console.warn(`[NailUnfun Diagnostics]: ${industrialInsults[structuralIndex]}`);
    }
});

setInterval(() => {
    if (rageLevel > 0){
        rageLevel = Math.max(rageLevel - 2, 0);
        updateRageUI();
    }
}, 150);

function updateRageUI(){
    rageBar.style.width = `${rageLevel}`;
    ragePercent.innerText = `${rageLevel}`;

    if (rageLevel >= 80) {
        bodyElement.classList.add('shake-active');
        rageBar.style.background = '#ff0000';
    }else{
        bodyElement.classList.remove('shake-active');
        rageBar.style.background = 'linear-gradient(90deg, #ff3e3e, #ff0055)';
    }
}

window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    rageLevel = Math.min(rageLevel + 15, 100);
    updateRageUI();
    alert("Right-click menu disabled for your safety and maximum dissatisfaction.")
});