// ─── AI LOGIC ───
class AI {
    constructor(player) {
        this.player = player;
        this.target = player.id === 1 ? p2 : p1; // AI targets the opponent
        this.isThinking = false;
        this.thinkTimer = 0;
        this.shotPower = 0;
        this.aimAngle = 0;
    }

    think() {
        if (this.isThinking || !gameActive) return;

        this.isThinking = true;
        this.thinkTimer = Date.now() + Math.random() * 1000 + 500; // 0.5-1.5s thinking time

        // Buy items if possible (prioritize better stones)
        const multiItem = SHOP_ITEMS.find(item => item.id === 'multi');
        const thunderItem = SHOP_ITEMS.find(item => item.id === 'thunder');
        const fireItem = SHOP_ITEMS.find(item => item.id === 'fire');
        const iceItem = SHOP_ITEMS.find(item => item.id === 'ice');

        if (this.player.points >= multiItem.cost && this.player.stones.multi === 0) {
            this.player.stones.multi = 1;
            this.player.points -= multiItem.cost;
            this.player.selectedStone = 'multi';
        } else if (this.player.points >= thunderItem.cost && this.player.stones.thunder === 0) {
            this.player.stones.thunder = 1;
            this.player.points -= thunderItem.cost;
            this.player.selectedStone = 'thunder';
        } else if (this.player.points >= fireItem.cost && this.player.stones.fire === 0) {
            this.player.stones.fire = 1;
            this.player.points -= fireItem.cost;
            this.player.selectedStone = 'fire';
        } else if (this.player.points >= iceItem.cost && this.player.stones.ice === 0) {
            this.player.stones.ice = 1;
            this.player.points -= iceItem.cost;
            this.player.selectedStone = 'ice';
        } else {
            this.player.selectedStone = 'rock';
        }

        // Calculate accurate aim and power
        const dx = this.target.x - this.player.x;
        const dy = this.target.y - this.player.y;
        this.aimAngle = Math.atan2(dy, dx);

        // Set consistent power for accuracy
        const distance = Math.hypot(dx, dy);
        this.shotPower = Math.min(distance * 0.05, 0.8);
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
    // currentPlayer will be set by initializePlayers
    isDragging = false;
    mousePos = { x: 0, y: 0 };
    birds = []; trees = [];
    particles = [];
    activeProjectile = null;
    subProjectiles = [];
    nextTurnQueued = false;

    // Re-initialize players based on mode
    initializePlayers();

    // Reset UI
    updateUI();
    updateStoneSelector();
    initEnvironment();
}