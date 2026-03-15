// Game initialization wrapper to ensure DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // ─── GLOBALS ───
    window.canvas = document.getElementById('gameCanvas');
    window.ctx = window.canvas.getContext('2d'); // Changed from '3d' to '2d' since this is a 2D game

    window.gameActive = true;
    window.currentPlayer = 1;
    window.isDragging = false;
    window.mousePos = { x: 0, y: 0 };
    window.birds = [];
    window.trees = [];
    window.particles = [];
    window.activeProjectile = null;
    window.subProjectiles = [];
    window.nextTurnQueued = false;

    window.isNight = Math.random() > 0.5;
    window.skyColor = window.isNight ? '#1a237e' : '#87CEEB';
    window.skyBottom = window.isNight ? '#000051' : '#E0F6FF';

    // Pick random map
    const currentMap = MAP_TEMPLATES[Math.floor(Math.random() * MAP_TEMPLATES.length)];
    const mapGround = currentMap.getGround();

    const BASE_GROUND = 520;

    window.getGroundY = function(x) {
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

    window.initEnvironment = function() {
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
        console.log('drawEnvironment');
        
        drawSky();
        drawBirds();
        drawTrees();
        drawGround();
    }

    // ─── INIT PLAYERS ───
    let p1GroundY = getGroundY(160);
    let p2GroundY = getGroundY(840);
    window.p1 = new Player(160, p1GroundY, '#1565c0', 1);
    window.p2 = null; // Will be created based on mode

    // Initialize based on game mode
    window.initializePlayers = function() {
        const gameMode = document.getElementById('gameMode').value;
        // Always create player objects so they render and participate in collisions
        window.p2 = new Player(840, p2GroundY, '#c62828', 2);

        // Reset HP and points for both players
        window.p1.hp = window.MAX_HP;
        window.p1.points = window.MAX_PTS;
        window.p1.multiHits = 0;
        window.p1.dead = false;
        window.p1.falling = false;
        window.p1.deathY = 0;
        window.p1.deathVel = 0;
        window.p1.jump = 0;
        window.p1.jumpVel = 0;
        window.p1.happy = 0;
        window.p1.reaction = '';
        window.p1.reactionTimer = 0;
        window.p1.effects = { slow: 0, burn: 0, stun: 0 };
        window.p1.stones = { rock: Infinity, ice: 0, fire: 0, thunder: 0, multi: 0 };
        window.p1.selectedStone = 'rock';
        
        window.p2.hp = window.MAX_HP;
        window.p2.points = window.MAX_PTS;
        window.p2.multiHits = 0;
        window.p2.dead = false;
        window.p2.falling = false;
        window.p2.deathY = 0;
        window.p2.deathVel = 0;
        window.p2.jump = 0;
        window.p2.jumpVel = 0;
        window.p2.happy = 0;
        window.p2.reaction = '';
        window.p2.reactionTimer = 0;
        window.p2.effects = { slow: 0, burn: 0, stun: 0 };
        window.p2.stones = { rock: Infinity, ice: 0, fire: 0, thunder: 0, multi: 0 };
        window.p2.selectedStone = 'rock';

        if (gameMode === 'single') {
            // Single player: randomly decide who starts
            window.currentPlayer = Math.random() < 0.5 ? 1 : 2;
        } else {
            window.currentPlayer = 1; // Multiplayer starts with player 1
        }
        window.updateUI(); // Update UI to reflect starting player
    }

    // Reset game function
    function resetGame() {
        // Reset game state
        window.gameActive = true;
        window.currentPlayer = 1;
        window.isDragging = false;
        window.mousePos = { x: 0, y: 0 };
        window.birds = [];
        window.trees = [];
        window.particles = [];
        window.activeProjectile = null;
        window.subProjectiles = [];
        window.nextTurnQueued = false;

        // Re-initialize players based on mode
        initializePlayers();

        // Reset UI
        window.updateUI();
        window.updateStoneSelector();
        initEnvironment();
    }

    initializePlayers();

    // Initialize AI
    initAI();

    // Initialize UI
    window.updateStoneSelector();
    window.updateUI();

    // ─── GAME LOGIC ───
    function nextTurn() {
        window.activeProjectile = null;
        window.subProjectiles = [];
        
        // Handle multi hits for both players
        if (window.p1) {
            if (window.p1.multiHits === 3) {
                window.p1.points = Math.max(0, window.p1.points - 50);
            } else {
                window.p1.points = Math.max(0, window.p1.points - 15 * window.p1.multiHits);
            }
            window.p1.multiHits = 0;
        }
        
        if (window.p2) {
            if (window.p2.multiHits === 3) {
                window.p2.points = Math.max(0, window.p2.points - 50);
            } else {
                window.p2.points = Math.max(0, window.p2.points - 15 * window.p2.multiHits);
            }
            window.p2.multiHits = 0;
        }

        window.updateUI();

        // Check win conditions
        let gameOver = false;
        if (window.p1.hp <= 0 || (window.p2 && window.p2.hp <= 0)) {
            window.gameActive = false;
            gameOver = true;
        }

        if (gameOver) return;

        // Switch player (works for both single-player and multiplayer)
        if (window.p2) {
            window.currentPlayer = window.currentPlayer === 1 ? 2 : 1;
        }

        window.updateStoneSelector();
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) };
    }

    canvas.addEventListener('mousedown', (e) => { if (window.gameActive && !window.activeProjectile) { window.isDragging = true; window.mousePos = getMousePos(e); } });
    window.addEventListener('mousemove', (e) => { if (window.isDragging) window.mousePos = getMousePos(e); });
    window.addEventListener('mouseup', handleRelease);

    canvas.addEventListener('touchstart', (e) => { if (window.gameActive && !window.activeProjectile) { window.isDragging = true; window.mousePos = getMousePos(e); e.preventDefault(); } }, { passive: false });
    window.addEventListener('touchmove', (e) => { if (window.isDragging) { window.mousePos = getMousePos(e); e.preventDefault(); } }, { passive: false });
    window.addEventListener('touchend', handleRelease);

    function handleRelease() {
        if (!window.isDragging) return;
        window.isDragging = false;

        // In single-player mode, only allow human input when it's human's turn
        if (document.getElementById('gameMode').value === 'single' && window.currentPlayer !== 1) {
            return;
        }

        let cp = window.currentPlayer === 1 ? window.p1 : window.p2;
        let stoneKey = cp.selectedStone;
        
        // Check availability
        if (stoneKey !== 'rock' && cp.stones[stoneKey] <= 0) {
            stoneKey = 'rock'; cp.selectedStone = 'rock';
        }
        
        // Consume stone
        if (stoneKey !== 'rock') { cp.stones[stoneKey]--; }
        
        window.activeProjectile = new Projectile(
            cp.slingshotX, cp.slingshotY,
            (cp.slingshotX - window.mousePos.x) * POWER_MULT,
            (cp.slingshotY - window.mousePos.y) * POWER_MULT,
            stoneKey, cp.id
        );
        
        window.updateStoneSelector();
    }

    // ─── UI UPDATE ───
    function updateUI() {
        // Update turn message
        let msg = document.getElementById('turn-msg');
        if (msg) {
            if (!window.gameActive) {
                const p1Lost = window.p1.hp <= 0;
                const p2Lost = window.p2 && window.p2.hp <= 0;
                msg.innerText = p1Lost ? "🏆 PLAYER 2 WINS!" : p2Lost ? "🏆 PLAYER 1 WINS!" : "🏆 DRAW!";
                msg.style.display = 'block';
            } else {
                msg.innerText = window.activeProjectile ? "💥 FIRE!" : `🎯 PLAYER ${window.currentPlayer}'S TURN`;
                msg.style.display = 'block';
            }
        }

        // Update map name
        let mapName = document.getElementById('map-name');
        if (mapName) {
            mapName.textContent = '🗺️ ' + currentMap.name;
            mapName.style.display = 'block';
        }

        // Update player progress bars
        updatePlayerProgressBars();

        // Update shop points display
        let cp = window.currentPlayer === 1 ? window.p1 : window.p2;
        let shopPts = document.getElementById('shop-pts');
        if (shopPts) {
            shopPts.textContent = cp.points;
        }

        // Update shop overlay points display
        let shopPlayerPts = document.getElementById('shop-pts');
        if (shopPlayerPts) {
            shopPlayerPts.textContent = cp.points;
        }

        // Update stone selector visibility
        let stoneSelector = document.getElementById('stone-selector');
        if (stoneSelector) {
            if (!window.gameActive) {
                stoneSelector.style.display = 'none';
            } else {
                stoneSelector.style.display = 'flex';
            }
        }

        // Update shop trigger button visibility
        let shopTrigger = document.getElementById('shop-trigger');
        if (shopTrigger) {
            if (!window.gameActive || window.activeProjectile) {
                shopTrigger.style.display = 'none';
            } else {
                // In single-player mode, only show for human player's turn
                const gameMode = document.getElementById('gameMode').value;
                if (gameMode === 'single' && window.currentPlayer !== 1) {
                    shopTrigger.style.display = 'none';
                } else {
                    shopTrigger.style.display = 'block';
                }
            }
        }
    }

    // Update player progress bars
    function updatePlayerProgressBars() {
        // Player 1 progress bar
        const p1HpBar = document.getElementById('p1-hp-bar');
        const p1PtsBar = document.getElementById('p1-pts-bar');
        if (p1HpBar && window.p1) {
            const hpPercent = Math.max(0, (window.p1.hp / window.MAX_HP) * 100);
            p1HpBar.style.width = hpPercent + '%';
            p1HpBar.style.background = hpPercent > 50 ? 'linear-gradient(90deg, #ff4444, #ff0000)' : 'linear-gradient(90deg, #ff0000, #8b0000)';
        }
        
        if (p1PtsBar && window.p1) {
            const ptsPercent = Math.max(0, (window.p1.points / window.MAX_PTS) * 100);
            p1PtsBar.style.width = ptsPercent + '%';
            p1PtsBar.style.background = ptsPercent > 50 ? 'linear-gradient(90deg, #2196f3, #21cbf3)' : 'linear-gradient(90deg, #2196f3, #21cbf3)';
        }

        // Player 2 progress bar
        const p2HpBar = document.getElementById('p2-hp-bar');
        const p2PtsBar = document.getElementById('p2-pts-bar');
        if (p2HpBar && window.p2) {
            const hpPercent = Math.max(0, (window.p2.hp / window.MAX_HP) * 100);
            p2HpBar.style.width = hpPercent + '%';
            p2HpBar.style.background = hpPercent > 50 ? 'linear-gradient(90deg, #ff4444, #ff0000)' : 'linear-gradient(90deg, #ff0000, #8b0000)';
        }
        
        if (p2PtsBar && window.p2) {
            const ptsPercent = Math.max(0, (window.p2.points / window.MAX_PTS) * 100);
            p2PtsBar.style.width = ptsPercent + '%';
            p2PtsBar.style.background = ptsPercent > 50 ? 'linear-gradient(90deg, #2196f3, #21cbf3)' : 'linear-gradient(90deg, #2196f3, #21cbf3)';
        }
    }

    // ─── MAIN LOOP ───
    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawEnvironment();
        
        // Update and draw players
        if (window.p1) window.p1.updateEffects();
        if (window.p2) window.p2.updateEffects();
        
        if (window.p1 && !window.p1.dead) window.p1.draw();
        if (window.p2 && !window.p2.dead) window.p2.draw();
        
        // AI logic
        if (aiPlayer2 && window.currentPlayer === 2 && !window.activeProjectile && window.gameActive) {
            aiPlayer2.think();
        }
        if (aiPlayer2) {
            aiPlayer2.update();
        }
        
        // Drag line
        if (window.isDragging) {
            let activeP = window.currentPlayer === 1 ? window.p1 : window.p2;
            let st = window.STONE_TYPES[activeP.selectedStone];
            ctx.strokeStyle = st.glow || (isNight ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)');
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath(); ctx.moveTo(activeP.slingshotX, activeP.slingshotY); ctx.lineTo(window.mousePos.x, window.mousePos.y); ctx.stroke();
            ctx.setLineDash([]);
            
            // Power indicator
            let dx = activeP.slingshotX - window.mousePos.x;
            let dy = activeP.slingshotY - window.mousePos.y;
            let power = Math.min(Math.hypot(dx, dy) * POWER_MULT, 25);
            let powerPct = Math.round((power / 25) * 100);
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('Power: ' + powerPct + '%', window.mousePos.x + 15, window.mousePos.y - 10);
        }
        
        // Active projectile
        if (window.activeProjectile && window.activeProjectile.active) {
            window.activeProjectile.update();
            window.activeProjectile.draw();
        }
        
        // Sub projectiles (multi stone)
        for (let i = window.subProjectiles.length - 1; i >= 0; i--) {
            let sp = window.subProjectiles[i];
            if (sp.active) { sp.update(); sp.draw(); }
            else { window.subProjectiles.splice(i, 1); }
        }
        
        // Advance turn once all projectiles have finished
        if (window.nextTurnQueued && (!window.activeProjectile || !window.activeProjectile.active) && window.subProjectiles.length === 0 && window.gameActive) {
            window.nextTurnQueued = false;
            nextTurn();
        }
        
        // Particles
        for (let i = window.particles.length - 1; i >= 0; i--) {
            window.particles[i].update();
            window.particles[i].draw();
            if (window.particles[i].life <= 0) window.particles.splice(i, 1);
        }
        
        window.updateUI();
        requestAnimationFrame(loop);
    }


    // ─── CANVAS BUTTON HANDLING ───
    canvas.addEventListener('mousedown', (e) => {
        if (window.gameActive && !window.activeProjectile) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
            
            // Check if shop button clicked
            const shopX = canvas.width / 2 - 25;
            const shopY = canvas.height - 60;
            
            if (mouseX >= shopX && mouseX <= shopX + 50 && 
                mouseY >= shopY && mouseY <= shopY + 50) {
                // Open shop
                window.openShop();
            }
            
            // Check if control buttons clicked
            const controlX = canvas.width / 2 - 45;
            const controlY = 60;
            
            // Refresh button
            if (mouseX >= controlX && mouseX <= controlX + 30 && 
                mouseY >= controlY && mouseY <= controlY + 30) {
                // Force reset game state and reinitialize
                window.gameActive = true;
                window.currentPlayer = 1;
                window.isDragging = false;
                window.mousePos = { x: 0, y: 0 };
                window.birds = []; window.trees = [];
                window.particles = [];
                window.activeProjectile = null;
                window.subProjectiles = [];
                window.nextTurnQueued = false;
                
                // Re-initialize players based on mode
                initializePlayers();
                
                // Reset UI and environment
                window.updateUI();
                window.updateStoneSelector();
                initEnvironment();
                initAI();
            }
            
            // Back button
            if (mouseX >= controlX + 40 && mouseX <= controlX + 70 && 
                mouseY >= controlY && mouseY <= controlY + 30) {
                // Go back to main menu
                window.location.href = 'index.html';
            }
            
            // Mute button
            if (mouseX >= controlX + 80 && mouseX <= controlX + 110 && 
                mouseY >= controlY && mouseY <= controlY + 30) {
                // Toggle mute
                const audio = document.getElementById('game-audio');
                if (audio) {
                    audio.muted = !audio.muted;
                    // Update button text/icon
                    const btn = document.getElementById('mute-btn');
                    btn.textContent = audio.muted ? '🔇' : '🔊';
                    btn.title = audio.muted ? 'Unmute Sound' : 'Mute Sound';
                }
            }
        }
    });

    // ─── SHOP TRIGGER BUTTON HANDLING ───
    document.getElementById('shop-trigger').addEventListener('click', function() {
        window.openShop();
    });

    // ─── CONTROL BUTTONS HANDLING ───
    document.getElementById('refresh-btn').addEventListener('click', function() {
        // Force reset game state and reinitialize
        window.gameActive = true;
        window.currentPlayer = 1;
        window.isDragging = false;
        window.mousePos = { x: 0, y: 0 };
        window.birds = []; window.trees = [];
        window.particles = [];
        window.activeProjectile = null;
        window.subProjectiles = [];
        window.nextTurnQueued = false;
        
        // Re-initialize players based on mode
        initializePlayers();
        
        // Reset UI and environment
        window.updateUI();
        window.updateStoneSelector();
        initEnvironment();
        initAI();
    });

    document.getElementById('exit-btn').addEventListener('click', function() {
        // Go back to main menu
        window.location.href = 'index.html';
    });

    document.getElementById('mute-btn').addEventListener('click', function() {
        // Toggle mute
        const audio = document.getElementById('game-audio');
        if (audio) {
            audio.muted = !audio.muted;
            // Update button text/icon
            const btn = document.getElementById('mute-btn');
            btn.textContent = audio.muted ? '🔇' : '🔊';
            btn.title = audio.muted ? 'Unmute Sound' : 'Mute Sound';
        }
    });

    // ─── AUDIO CONTROL ───
    function playGameAudio() {
        const audio = document.getElementById('game-audio');
        if (audio) {
            audio.play().catch(e => console.log('Audio play prevented:', e));
        }
    }

    function pauseGameAudio() {
        const audio = document.getElementById('game-audio');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    // ─── INIT ───
    initEnvironment();
    updateStoneSelector();
    loop();

    // Start game audio when game starts
    playGameAudio();
});
