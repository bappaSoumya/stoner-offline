// ─── PLAYER ───
class Player {
    constructor(x, groundY, color, id) {
        this.baseX = x;
        this.groundY = groundY;
        this.x = x;
        this.y = groundY - 35;
        this.color = color;
        this.hp = MAX_HP;
        this.points = 0;
        this.id = id;
        this.shake = 0;
        this.slingshotX = id === 1 ? x + 45 : x - 45;
        this.slingshotY = this.y - 5;
        // Stone inventory: unlimited rock, others start at 0
        this.stones = { rock: Infinity, ice: 0, fire: 0, thunder: 0, multi: 0 };
        this.selectedStone = 'rock';
        this.effects = { slow: 0, burn: 0, stun: 0 }; // for stone effects
    }

    updateEffects() {
        if (this.effects.slow > 0) this.effects.slow--;
        if (this.effects.burn > 0) {
            this.hp -= 5; // burn damage
            this.effects.burn--;
        }
        if (this.effects.stun > 0) this.effects.stun--;
    }

    draw() {
        ctx.save();
        if (this.shake > 0) { ctx.translate(Math.random() * 6 - 3, 0); this.shake--; }

        // Turn Indicator Arrow
        if (currentPlayer === this.id && gameActive && !activeProjectile) {
            let bounce = Math.sin(Date.now() / 200) * 8;
            ctx.fillStyle = "#ffeb3b";
            ctx.beginPath();
            ctx.moveTo(this.x - 10, this.y - 85 + bounce);
            ctx.lineTo(this.x + 10, this.y - 85 + bounce);
            ctx.lineTo(this.x, this.y - 68 + bounce);
            ctx.fill();
        }

        let skinColor = '#d4a574';
        let outlineColor = isNight ? '#ddd' : '#333';

        // --- HEALTHY ATHLETIC CHARACTER ---

        // Head
        ctx.fillStyle = skinColor;
        ctx.beginPath(); ctx.arc(this.x, this.y - 48, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = outlineColor; ctx.lineWidth = 1.5;
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#222';
        let eyeDir = this.id === 1 ? 1 : -1;
        ctx.beginPath(); ctx.arc(this.x + 3 * eyeDir, this.y - 50, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(this.x + 8 * eyeDir, this.y - 50, 2, 0, Math.PI * 2); ctx.fill();

        // Small smile
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x + 5 * eyeDir, this.y - 45, 4, 0, Math.PI);
        ctx.stroke();

        // Neck
        ctx.fillStyle = skinColor;
        ctx.fillRect(this.x - 3, this.y - 37, 6, 6);

        // Torso — athletic, V-shape, NOT fat
        ctx.fillStyle = this.id === 1 ? '#1565c0' : '#c62828'; // shirt color
        ctx.beginPath();
        ctx.moveTo(this.x - 14, this.y - 31); // left shoulder
        ctx.lineTo(this.x + 14, this.y - 31); // right shoulder
        ctx.lineTo(this.x + 10, this.y + 2);  // right hip (narrower)
        ctx.lineTo(this.x - 10, this.y + 2);  // left hip (narrower)
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = outlineColor; ctx.lineWidth = 1;
        ctx.stroke();

        // Arms (muscular but lean)
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.strokeStyle = skinColor;

        // Left arm
        ctx.beginPath();
        ctx.moveTo(this.x - 14, this.y - 28);
        ctx.lineTo(this.x - 22, this.y - 10);
        ctx.stroke();
        // Right arm
        ctx.beginPath();
        ctx.moveTo(this.x + 14, this.y - 28);
        ctx.lineTo(this.x + 22, this.y - 10);
        ctx.stroke();

        // Hands (small circles)
        ctx.fillStyle = skinColor;
        ctx.beginPath(); ctx.arc(this.x - 22, this.y - 9, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(this.x + 22, this.y - 9, 4, 0, Math.PI * 2); ctx.fill();

        // Legs (athletic)
        ctx.fillStyle = '#37474f'; // pants
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#37474f';
        ctx.beginPath();
        ctx.moveTo(this.x - 6, this.y + 2);
        ctx.lineTo(this.x - 12, this.y + 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x + 6, this.y + 2);
        ctx.lineTo(this.x + 12, this.y + 30);
        ctx.stroke();

        // Shoes
        ctx.fillStyle = '#222';
        ctx.beginPath(); ctx.ellipse(this.x - 12, this.y + 32, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(this.x + 12, this.y + 32, 7, 4, 0, 0, Math.PI * 2); ctx.fill();

        // Slingshot
        ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 5;
        let slY = this.groundY;
        ctx.beginPath(); ctx.moveTo(this.slingshotX, slY); ctx.lineTo(this.slingshotX, this.slingshotY); ctx.stroke();
        // Fork
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(this.slingshotX - 8, this.slingshotY - 12); ctx.lineTo(this.slingshotX, this.slingshotY); ctx.lineTo(this.slingshotX + 8, this.slingshotY - 12); ctx.stroke();

        ctx.restore();
    }
}