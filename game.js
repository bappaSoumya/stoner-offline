// ─── GLOBALS ───
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameActive = true;
let currentPlayer = 1;
let isDragging = false;
let mousePos = { x: 0, y: 0 };
let birds = [], trees = [];
let particles = [];
let activeProjectile = null;
let subProjectiles = [];
let nextTurnQueued = false;

const isNight = Math.random() > 0.5;
const skyColor = isNight ? '#1a237e' : '#87CEEB';
const skyBottom = isNight ? '#000051' : '#E0F6FF';

// Pick random map
const currentMap = MAP_TEMPLATES[Math.floor(Math.random() * MAP_TEMPLATES.length)];
const mapGround = currentMap.getGround();

const BASE_GROUND = 520;

function getGroundY(x) {
    if (mapGround.type === 'flat') return BASE_GROUND;
    if (mapGround.type === 'hill') {
        if (mapGround.hillSide === 'left') {
            if (x < 300) return BASE_GROUND - 100 + (x / 300) * 100;
            return BASE_GROUND;
        } else {
            if (x > 700) return BASE_GROUND - 100 + ((1000 - x) / 300) * 100;
            return BASE_GROUND;
        }
    }
    if (mapGround.type === 'valley') {
        let center = 500;
        let dist = Math.abs(x - center);
        return BASE_GROUND - Math.max(0, (dist - 150) / 350 * 100);
    }
    if (mapGround.type === 'river') {
        // river is a dip
        let riverCenter = mapGround.riverSide === 'left' ? 350 : 650;
        let dist = Math.abs(x - riverCenter);
        if (dist < 80) return BASE_GROUND + 20;
        return BASE_GROUND;
    }
    return BASE_GROUND;
}

function drawGround() {
    // Draw terrain
    ctx.beginPath();
    ctx.moveTo(0, 600);
    for (let x = 0; x <= 1000; x += 2) {
        ctx.lineTo(x, getGroundY(x));
    }
    ctx.lineTo(1000, 600);
    ctx.closePath();
    ctx.fillStyle = isNight ? '#1b5e20' : '#2e7d32';
    ctx.fill();

    // River water
    if (mapGround.type === 'river') {
        let riverCenter = mapGround.riverSide === 'left' ? 350 : 650;
        ctx.fillStyle = 'rgba(33,150,243,0.6)';
        ctx.beginPath();
        for (let x = riverCenter - 80; x <= riverCenter + 80; x += 2) {
            let gy = getGroundY(x);
            ctx.lineTo(x, gy);
        }
        ctx.lineTo(riverCenter + 80, 600);
        ctx.lineTo(riverCenter - 80, 600);
        ctx.closePath();
        ctx.fill();
        // Water shimmer
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            let wx = riverCenter - 60 + Math.sin(Date.now() / 800 + i) * 40;
            let wy = BASE_GROUND + 10 + i * 3;
            ctx.beginPath();
            ctx.moveTo(wx - 10, wy);
            ctx.lineTo(wx + 10, wy);
            ctx.stroke();
        }
    }

    // Dirt line
    ctx.strokeStyle = isNight ? '#33691e' : '#1b5e20';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= 1000; x += 2) {
        if (x === 0) ctx.moveTo(x, getGroundY(x));
        else ctx.lineTo(x, getGroundY(x));
    }
    ctx.stroke();
}

function initEnvironment() {
    for (let i = 0; i < 5; i++) {
        let tx = 50 + Math.random() * 900;
        trees.push({ x: tx, groundY: getGroundY(tx), size: 30 + Math.random() * 40, color: isNight ? '#1b5e20' : '#388e3c' });
    }
    for (let i = 0; i < 3; i++) {
        birds.push({ x: Math.random() * 1000, y: 40 + Math.random() * 120, s: 0.5 + Math.random(), wing: 0 });
    }
}

function drawSky() {
    let grad = ctx.createLinearGradient(0, 0, 0, BASE_GROUND);
    grad.addColorStop(0, skyColor);
    grad.addColorStop(1, skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun/Moon
    ctx.fillStyle = isNight ? '#f5f5f5' : '#fff59d';
    ctx.beginPath(); ctx.arc(800, 80, 40, 0, Math.PI * 2); ctx.fill();
    if (isNight) { ctx.fillStyle = skyColor; ctx.beginPath(); ctx.arc(775, 75, 40, 0, Math.PI * 2); ctx.fill(); }

    // Stars at night
    if (isNight) {
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 40; i++) {
            let sx = (i * 137 + 50) % 1000;
            let sy = (i * 97 + 20) % 200;
            ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill();
        }
    }
}

function drawTrees() {
    trees.forEach(t => {
        ctx.fillStyle = '#5d4037'; ctx.fillRect(t.x - 5, t.groundY - t.size, 10, t.size);
        ctx.fillStyle = t.color; ctx.beginPath(); ctx.arc(t.x, t.groundY - t.size, t.size / 1.2, 0, Math.PI * 2); ctx.fill();
    });
}

function drawBirds() {
    ctx.strokeStyle = isNight ? '#666' : '#333'; ctx.lineWidth = 2;
    birds.forEach(b => {
        b.x += b.s; if (b.x > 1100) b.x = -100;
        b.wing += 0.1; let w = Math.sin(b.wing) * 5;
        ctx.beginPath(); ctx.moveTo(b.x - 10, b.y + w); ctx.quadraticCurveTo(b.x, b.y - 5, b.x + 10, b.y + w); ctx.stroke();
    });
}

function drawEnvironment() {
    drawSky();
    drawBirds();
    drawTrees();
    drawGround();
}

// ─── INIT PLAYERS ───
let p1GroundY = getGroundY(160);
let p2GroundY = getGroundY(840);
let p1 = new Player(160, p1GroundY, '#1565c0', 1);
let p2 = new Player(840, p2GroundY, '#c62828', 2);

// ─── GAME LOGIC ───
function nextTurn() {
    activeProjectile = null;
    subProjectiles = [];
    // Handle multi hits
    [p1, p2].forEach(p => {
        if (p.multiHits === 3) {
            p.points = Math.max(0, p.points - 50);
        } else {
            p.points = Math.max(0, p.points - 15 * p.multiHits);
        }
        p.multiHits = 0;
    });
    updateUI();
    if (p1.hp <= 0 || p2.hp <= 0) { gameActive = false; return; }
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateStoneSelector();
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) };
}

canvas.addEventListener('mousedown', (e) => { if (gameActive && !activeProjectile) { isDragging = true; mousePos = getMousePos(e); } });
window.addEventListener('mousemove', (e) => { if (isDragging) mousePos = getMousePos(e); });
window.addEventListener('mouseup', handleRelease);

canvas.addEventListener('touchstart', (e) => { if (gameActive && !activeProjectile) { isDragging = true; mousePos = getMousePos(e); e.preventDefault(); } }, { passive: false });
window.addEventListener('touchmove', (e) => { if (isDragging) { mousePos = getMousePos(e); e.preventDefault(); } }, { passive: false });
window.addEventListener('touchend', handleRelease);

function handleRelease() {
    if (!isDragging) return;
    isDragging = false;
    let cp = currentPlayer === 1 ? p1 : p2;
    let stoneKey = cp.selectedStone;
    // Check availability
    if (stoneKey !== 'rock' && cp.stones[stoneKey] <= 0) {
        stoneKey = 'rock'; cp.selectedStone = 'rock';
    }
    // Consume stone
    if (stoneKey !== 'rock') { cp.stones[stoneKey]--; }
    activeProjectile = new Projectile(
        cp.slingshotX, cp.slingshotY,
        (cp.slingshotX - mousePos.x) * POWER_MULT,
        (cp.slingshotY - mousePos.y) * POWER_MULT,
        stoneKey, cp.id
    );
    updateStoneSelector();
}

// ─── UI UPDATE ───
function updateUI() {
    document.getElementById('hp1').style.width = Math.max(0, p1.hp) + '%';
    document.getElementById('hp2').style.width = Math.max(0, p2.hp) + '%';
    document.getElementById('hp1-txt').textContent = Math.max(0, Math.round(p1.hp));
    document.getElementById('hp2-txt').textContent = Math.max(0, Math.round(p2.hp));

    const p1pts = Number.isFinite(p1.points) ? p1.points : 0;
    const p2pts = Number.isFinite(p2.points) ? p2.points : 0;
    document.getElementById('pts1').style.width = Math.min(100, (p1pts / MAX_PTS) * 100) + '%';
    document.getElementById('pts2').style.width = Math.min(100, (p2pts / MAX_PTS) * 100) + '%';
    document.getElementById('pts1-txt').textContent = p1pts;
    document.getElementById('pts2-txt').textContent = p2pts;

    document.getElementById('ui-p1').className = currentPlayer === 1 ? 'stats active-ui' : 'stats';
    document.getElementById('ui-p2').className = currentPlayer === 2 ? 'stats active-ui' : 'stats';

    let msg = document.getElementById('turn-msg');
    if (!gameActive) {
        msg.innerText = p1.hp <= 0 ? "🏆 PLAYER 2 WINS!" : "🏆 PLAYER 1 WINS!";
        document.getElementById('stone-selector').style.display = 'none';
    } else {
        msg.innerText = activeProjectile ? "💥 FIRE!" : `🎯 PLAYER ${currentPlayer}'S TURN`;
    }

    document.getElementById('map-name').textContent = '🗺️ ' + currentMap.name;
}

// ─── MAIN LOOP ───
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEnvironment();
    p1.updateEffects();
    p2.updateEffects();
    p1.draw();
    p2.draw();

    // Drag line
    if (isDragging) {
        let activeP = currentPlayer === 1 ? p1 : p2;
        let st = STONE_TYPES[activeP.selectedStone];
        ctx.strokeStyle = st.glow || (isNight ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)');
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(activeP.slingshotX, activeP.slingshotY); ctx.lineTo(mousePos.x, mousePos.y); ctx.stroke();
        ctx.setLineDash([]);

        // Power indicator
        let dx = activeP.slingshotX - mousePos.x;
        let dy = activeP.slingshotY - mousePos.y;
        let power = Math.min(Math.hypot(dx, dy) * POWER_MULT, 25);
        let powerPct = Math.round((power / 25) * 100);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Power: ' + powerPct + '%', mousePos.x + 15, mousePos.y - 10);
    }

    // Active projectile
    if (activeProjectile && activeProjectile.active) {
        activeProjectile.update();
        activeProjectile.draw();
    }

    // Sub projectiles (multi stone)
    for (let i = subProjectiles.length - 1; i >= 0; i--) {
        let sp = subProjectiles[i];
        if (sp.active) { sp.update(); sp.draw(); }
        else { subProjectiles.splice(i, 1); }
    }

    // Advance turn once all projectiles have finished
    if (nextTurnQueued && (!activeProjectile || !activeProjectile.active) && subProjectiles.length === 0 && gameActive) {
        nextTurnQueued = false;
        nextTurn();
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    updateUI();
    requestAnimationFrame(loop);
}

// ─── INIT ───
document.getElementById('reset-btn').onclick = () => location.reload();
initEnvironment();
updateStoneSelector();
loop();