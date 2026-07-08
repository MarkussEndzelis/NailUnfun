const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvasContainer');

const uiCursor = document.getElementById('valCursor');
const uiOrigin = document.getElementById('valOrigin');
const uiRadius = document.getElementById('valRadius');
const uiDev = document.getElementById('valDev');
const uiEcc = document.getElementById('valEcc');
const uiDisc = document.getElementById('valDisc');
const uiVelo = document.getElementById('valVelo');
const uiCheat = document.getElementById('valCheat');
const uiLiveScore = document.getElementById('liveScore');
const uiMatch = document.getElementById('structureMatch');
const uiConsole = document.getElementById('consolePipeline');
const uiWarning = document.getElementById('canvasWarning');

let isDrawing = false;
let pointsArray = [];
let targetOrigin = { x: 0, y: 0};
let currentMeanRadius = 0;
let lastTimestamp = 0;

const TARGET_IMPERFECTION = 18.47;

function resizeCanvas(){
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    targetOrigin.x = canvas.width / 2;
    targetOrigin.y = canvas.height / 2;
    uiOrigin.innerText = `X: ${targetOrigin.x.toFixed(0)}, Y: ${targetOrigin.y.toFixed(0)}`;
}

window.addEventListener('resize', resizeCanvas);

function clearCanvasWorkspace(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    pointsArray = [];
    currentMeanRadius = 0;
    uiCheat.innerText = "PASS";
    uiMatch.innerText = "PENDING";
    uiWarning.innerText = "";

    uiLiveScore.innerText = "0.00%";
    uiMatch.innerText = "PENDING";
    uiMatch.style.color = "#ffffff";
    uiWarning.innerText = "";
    pushConsoleLog("Canvas telemetry cache purged.", "warn");
}

document.getElementById('btnClear').addEventListener('click', clearCanvasWorkspace);

function pushConsoleLog(text, type = "muted"){
    const logItem = document.createElement('div');
    logItem.className = `log-line text-${type}`;
    logItem.innerText = `[${new Date().toLocaleTimeString()}] ${text}`;
    uiConsole.appendChild(logItem);
    uiConsole.scrollTop = uiConsole.scrollHeight;

    if (uiConsole.children.length > 5){
        uiConsole.removeChild(uiConsole.children[0]);
    }
}

container.addEventListener('mousedown', (e) => {
    isDrawing = true;
    pointsArray = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastTimestamp = performance.now();

    const coord = getEventCoordinates(e);
    pointsArray.push(coord);
    ctx.beginPath();
    ctx.moveTo(coord.x, coord.y);
    pushConsoleLog("Primary draw path execution initiated.", "success");
});

container.addEventListener('mousemove', (e) => {
    if (!isDrawing){
        return;
    }

    let rawCoord = getEventCoordinates(e);
    let now = performance.now();
    let deltaTime = now - lastTimestamp;
    lastTimestamp = now;

    let vectorX = rawCoord.x - targetOrigin.x;
    let vectorY = rawCoord.y - targetOrigin.y;
    let distanceToCenter = Math.sqrt(vectorX * vectorX + vectorY * vectorY);

    if (currentMeanRadius === 0){
        currentMeanRadius = 160;
    }
    let deltaRadius = distanceToCenter - currentMeanRadius;

    let dynamicCorrectionX = rawCoord.x - (vectorX / distanceToCenter) * (deltaRadius * 0.4);
    let dynamicCorrectionY = rawCoord.y - (vectorY / distanceToCenter) * (deltaRadius * 0.4);

    let finalCoord = {x: dynamicCorrectionX, y: dynamicCorrectionY, time: now};
    pointsArray.push(finalCoord);

    let lastPoint = pointsArray[pointsArray.length - 2];
    let movementDistance = Math.sqrt(Math.pow(finalCoord.x - lastPoint.x, 2) + Math.pow(finalCoord.y - lastPoint.y, 2));
    let currentVelocity = movementDistance / (deltaTime || 1);

    ctx.lineTo(finalCoord.x, finalCoord.y);
    ctx.stroke();

    uiCursor.innerText = `X: ${finalCoord.x.toFixed(0)}, Y: ${finalCoord.y.toFixed(0)}`;
    uiVelo.innerText = `${(currentVelocity * 10).toFixed(2)}px/ms`;

    executeLiveAnalysis();
});

window.addEventListener('mouseup', () => {
    if(!isDrawing){
        return;
    }
    isDrawing = false;
    ctx.closePath();
    pushConsoleLog(`Stroke parsing terminated. Vector collection size: ${pointsArray.length}`, "success");
});

function getEventCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function executeLiveAnalysis() {
    if (pointsArray.length < 5){
        return;
    }

    let totalX = 0, totalY = 0;
    pointsArray.forEach(p => {totalX += p.x; totalY += p.y; });
    let calculatedOriginX = totalX / pointsArray.length;
    let calculatedOriginY = totalY / pointsArray.length;

    let totalRadius = 0;
    let radiusCollection = [];

    pointsArray.forEach(p => {
        let r = Math.sqrt(Math.pow(p.x - calculatedOriginX, 2) + Math.pow(p.y - calculatedOriginY, 2));
        totalRadius += r;
        radiusCollection.push(r);
    });

    let meanRadius = totalRadius / pointsArray.length;
    currentMeanRadius = meanRadius;
    uiRadius.innerText = `${meanRadius.toFixed(2)}`;

    let varianceSum = 0;
    radiusCollection.forEach(r => {
        varianceSum += Math.pow(r - meanRadius, 2);
    });

    let standartDeviation = Math.sqrt(varianceSum / pointsArray.length);
    uiDev.innerText = standartDeviation.toFixed(3);

    let calculatedImperfectionPercent = (standartDeviation / meanRadius) * 100;
    uiLiveScore.innerText = `${calculatedImperfectionPercent.toFixed(2)}%`;

    if (standartDeviation < 2){
        uiCheat.innerText = "FAIL (STRAIGHT LINE)";
        uiCheat.style.color = "#ff3333";
    }else{
        uiCheat.style.color = "#00ff66";
        uiCheat.innerText = "PASS";
    }
}

function evaluateSubmissionData(){
    if (pointsArray.length < 30){
        uiWarning.innerText = "ERROR: TRACE DISCONTINUITY. PATH LENGTH INSUFFICIENT.";
        pushConsoleLog("Evaluation rejected: Incomplete data footprint.", "error");
        return;
    }
    let startNode = pointsArray[0];
    let endNode = pointsArray[pointsArray.length - 1];
    let gapDistance = Math.sqrt(Math.pow(startNode.x - endNode.x, 2) + Math.pow(startNode.y - endNode.y, 2));
    let separationIndex = (gapDistance / currentMeanRadius) * 100;
    uiDisc.innerText = `${separationIndex.toFixed(2)}%`;

    if (separationIndex > 15){
        uiWarning.innerText = "CRITICAL FAILURE: APEX GAP DETECTED. CIRCLE UNCLOSED.";
        uiMatch.innerText = "REJECTED";
        uiMatch.style.color = "#ff3333";
        pushConsoleLog("Geometric rejection: Endpoint closure threshold bypassed.", "error");
        return;
    }
    let totalX = 0, totalY = 0;
    pointsArray.forEach(p => {totalX += p.x; totalY += p.y; });
    let finalOriginX = totalX / pointsArray.length;
    let finalOriginY = totalY / pointsArray.length;

    let totalRad = 0;
    let rads = [];
    pointsArray.forEach(p => {
        let r = Math.sqrt(Math.pow(p.x - finalOriginX, 2) + Math.pow(p.y - finalOriginY, 2));
        totalRad += r;
        rads.push(r);
    });
    let finalMeanRadius = totalRad / pointsArray.length;
    let vSum = 0;
    rads.forEach(r => vSum += Math.pow(r - finalMeanRadius, 2));
    let finalDev = Math.sqrt(vSum / pointsArray.length);
    let finalImperfection = (finalDev / finalMeanRadius) * 100;

    let scoreAccuracyOffset = Math.abs(finalImperfection - TARGET_IMPERFECTION);

    if (scoreAccuracyOffset <= 0.5){
        uiMatch.innerText = "PERFECTLY IMPERFECT! UNLOCKED.";
        uiMatch.style.color = "#00ff66";
        uiWarning.innerText = "SUCCESS: YOU SUCCESSFULLY RESITED PERFECTION.";
        pushConsoleLog(`Target validation complete. Margin variance: ${scoreAccuracyOffset.toFixed(3)}%`, "success");
    }else{
        uiMatch.innerText = "CALIBRATION MISMATCH";
        uiMatch.style.color = "#ff3333";
        let directionMsg = finalImperfection > TARGET_IMPERFECTION ? "Too chaotic!" : "Too clean/perfect!";
        uiWarning.innerText = `FAILED: ${directionMsg} Target is ${TARGET_IMPERFECTION}%. You hit ${finalImperfection.toFixed(2)}%.`;
        pushConsoleLog(`Data submission invalidated. Adjustment required.`, "error");
    }
}

document.getElementById('btnSubmit').addEventListener('click', () => evaluateSubmissionData(false));
resizeCanvas();