// ─── AI LOGIC ───
class AI {
    constructor(player) {
        this.player = player;
        this.target = player.id === 1 ? p1 : p2; // Fixed targeting logic
        this.isThinking = false;
        this.thinkTimer = 0;
        this.shotPower = 0;
        this.aimAngle = 0;
    }

    think() {
        if (this.isThinking || !gameActive) return;

        this.isThinking = true;
        this.thinkTimer = Date.now() + Math.random() * 1000 + 500; // 0.5-1.5s thinking time

        // Calculate aim angle and power
        const dx = this.target.x - this.player.x;
        const dy = this.target.y - this.player.y;
        this.aimAngle = Math.atan2(dy, dx);

        // Calculate distance for power
        const distance = Math.hypot(dx, dy);
        this.shotPower = Math.min(distance * 0.05, 0.8); // Scale power based on distance

        // Add some randomness
        this.aimAngle += (Math.random() - 0.5) * 0.2; // ±0.1 radians
        this.shotPower *= 0.8 + Math.random() * 0.4; // 0.8-1.2x power
    }

    update() {
        if (!this.isThinking || !gameActive) return;

        if (Date.now() < this.thinkTimer) return;

        // Execute the shot
        const powerMult = 25; // Match the POWER_MULT from game.js
        const slingshotX = this.player.slingshotX;
        const slingshotY = this.player.slingshotY;

        const dx = Math.cos(this.aimAngle) * this.shotPower * powerMult;
        const dy = Math.sin(this.aimAngle) * this.shotPower * powerMult;

        // Create projectile
        activeProjectile = new Projectile(
            slingshotX, slingshotY,
            dx, dy,
            this.player.selectedStone,
            this.player.id
        );

        this.isThinking = false;
        nextTurnQueued = true;
    }
}

// Global AI instances
let aiPlayer1 = null;
let aiPlayer2 = null;

// Initialize AI based on game mode
function initAI() {
    const gameMode = document.getElementById('gameMode').value;
    if (gameMode === 'single') {
        // Player 1 is human, Player 2 is AI
        aiPlayer2 = new AI(p2);
        // Hide Player 2 controls
       // document.getElementById('multiplayer-controls').style.display = 'none';
    } else {
        // Both players are human
        aiPlayer1 = null;
        aiPlayer2 = null;
        // Show Player 2 controls
       // document.getElementById('multiplayer-controls').style.display = 'block';
    }
}

// Handle game mode change
document.getElementById('gameMode').addEventListener('change', function() {
    resetGame();
    initAI();
});

// Override handleRelease for AI
function handleRelease() {
    if (!isDragging) return;
    isDragging = false;

    if (aiPlayer2 && currentPlayer === 2) {
        // Don't allow human input when AI is playing
        return;
    }

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

// Override reset button to also reset AI
document.getElementById('reset-btn').onclick = function() {
    resetGame();
    initAI();
    // location.reload(); // Removed - no longer needed
};
function resetGame() {
    // Reset game state
    gameActive = true;
    currentPlayer = 1;
    isDragging = false;
    mousePos = { x: 0, y: 0 };
    birds = []; trees = [];
    particles = [];
    activeProjectile = null;
    subProjectiles = [];
    nextTurnQueued = false;

    // Reset players
    p1GroundY = getGroundY(160);
    p2GroundY = getGroundY(840);
    p1 = new Player(160, p1GroundY, '#1565c0', 1);
    p2 = new Player(840, p2GroundY, '#c62828', 2);

    // Reset UI
    updateUI();
    updateStoneSelector();
    initEnvironment();
}