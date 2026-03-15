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
        this.multiHits = 0; // for tracking multi-stone hit counts per turn
        this.effects = { slow: 0, burn: 0, stun: 0 }; // for stone effects
        this.dead = false;
        this.falling = false;
        this.deathY = 0;
        this.deathVel = 0;
        this.jump = 0; // Jump animation for successful hits
        this.jumpVel = 0;
        this.happy = 0; // Happy reaction for successful hits
        this.reaction = ''; // 'happy', 'sad', 'angry'
        this.reactionTimer = 0;
    }

    updateEffects() {
        if (this.effects.slow > 0) this.effects.slow--;
        if (this.effects.burn > 0) {
            this.hp -= 5; // burn damage
            this.effects.burn--;
        }
        if (this.effects.stun > 0) this.effects.stun--;

        // Death fall animation
        if (this.hp <= 0 && !this.dead) {
            this.dead = true;
            this.falling = true;
            this.deathY = 0;
            this.deathVel = 0;
        }
        
        if (this.falling) {
            // Simple falling physics
            this.deathVel += 0.5; // gravity
            this.deathY += this.deathVel;
            // Stop falling when on ground
            if (this.deathY >= 100) { // Fall distance
                this.falling = false;
                this.deathY = 100; // Final position
                this.deathVel = 0;
            }
        }

        // Jump animation for successful hits
        if (this.jump > 0) {
            this.jump += this.jumpVel;
            this.jumpVel += 0.8; // gravity
            if (this.jump >= 0) {
                this.jump = 0;
                this.jumpVel = 0;
            }
        }
        
        // Happy reaction for successful hits
        if (this.happy > 0) {
            this.happy--;
        }
        
        // Reaction timer
        if (this.reactionTimer > 0) {
            this.reactionTimer--;
        } else {
            this.reaction = '';
        }
    }

    draw() {
        ctx.save();
        if (this.shake > 0) { ctx.translate(Math.random() * 6 - 3, 0); this.shake--; }

        // Apply jump animation
        let jumpOffset = this.jump;
        if (this.dead) {
            jumpOffset = this.deathY;
        }

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
        ctx.beginPath(); ctx.arc(this.x, this.y - 48 + jumpOffset, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = outlineColor; ctx.lineWidth = 1.5;
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#222';
        let eyeDir = this.id === 1 ? 1 : -1;
        ctx.beginPath(); ctx.arc(this.x + 3 * eyeDir, this.y - 50 + jumpOffset, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(this.x + 8 * eyeDir, this.y - 50 + jumpOffset, 2, 0, Math.PI * 2); ctx.fill();

        // Smile (changes based on happy reaction)
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
        ctx.beginPath();
        if (this.happy > 0) {
            // Big happy smile
            ctx.arc(this.x + 5 * eyeDir, this.y - 42 + jumpOffset, 5, 0, Math.PI);
        } else if (this.reaction === 'sad') {
            // Sad frown
            ctx.arc(this.x + 5 * eyeDir, this.y - 42 + jumpOffset, 5, Math.PI, 0);
        } else if (this.reaction === 'angry') {
            // Angry eyebrows and frown
            ctx.beginPath();
            ctx.arc(this.x + 3 * eyeDir, this.y - 52 + jumpOffset, 3, 0, Math.PI);
            ctx.arc(this.x + 8 * eyeDir, this.y - 52 + jumpOffset, 3, 0, Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x + 5 * eyeDir, this.y - 42 + jumpOffset, 5, Math.PI, 0);
        } else {
            // Small normal smile
            ctx.arc(this.x + 5 * eyeDir, this.y - 45 + jumpOffset, 4, 0, Math.PI);
        }
        ctx.stroke();
        
        // Draw reaction tooltip
        if (this.reaction && this.reactionTimer > 0) {
            let reactionText = '';
            let reactionColor = '#fff';
            
            if (this.reaction === 'happy') {
                reactionText = 'Nice hit! 😄';
                reactionColor = '#f1c40f';
            } else if (this.reaction === 'sad') {
                reactionText = 'Ouch! 😞';
                reactionColor = '#3498db';
            } else if (this.reaction === 'angry') {
                reactionText = 'Rage! 😡';
                reactionColor = '#e74c3c';
            }
            
            // Draw tooltip background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(this.x - 40, this.y - 70 + jumpOffset, 80, 25);
            
            // Draw reaction text
            ctx.fillStyle = reactionColor;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(reactionText, this.x, this.y - 52 + jumpOffset);
            ctx.textAlign = 'left';
        }

        // Neck
        ctx.fillStyle = skinColor;
        ctx.fillRect(this.x - 3, this.y - 37 + jumpOffset, 6, 6);

        // Torso — athletic, V-shape, NOT fat
        ctx.fillStyle = this.id === 1 ? '#1565c0' : '#c62828'; // shirt color
        ctx.beginPath();
        ctx.moveTo(this.x - 14, this.y - 31 + jumpOffset); // left shoulder
        ctx.lineTo(this.x + 14, this.y - 31 + jumpOffset); // right shoulder
        ctx.lineTo(this.x + 10, this.y + 2 + jumpOffset);  // right hip (narrower)
        ctx.lineTo(this.x - 10, this.y + 2 + jumpOffset);  // left hip (narrower)
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
        ctx.moveTo(this.x - 14, this.y - 28 + jumpOffset);
        ctx.lineTo(this.x - 22, this.y - 10 + jumpOffset);
        ctx.stroke();
        // Right arm
        ctx.beginPath();
        ctx.moveTo(this.x + 14, this.y - 28 + jumpOffset);
        ctx.lineTo(this.x + 22, this.y - 10 + jumpOffset);
        ctx.stroke();

        // Hands (small circles)
        ctx.fillStyle = skinColor;
        ctx.beginPath(); ctx.arc(this.x - 22, this.y - 9 + jumpOffset, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(this.x + 22, this.y - 9 + jumpOffset, 4, 0, Math.PI * 2); ctx.fill();

        // Legs (athletic)
        ctx.fillStyle = '#37474f'; // pants
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#37474f';
        ctx.beginPath();
        ctx.moveTo(this.x - 6, this.y + 2 + jumpOffset);
        ctx.lineTo(this.x - 12, this.y + 30 + jumpOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x + 6, this.y + 2 + jumpOffset);
        ctx.lineTo(this.x + 12, this.y + 30 + jumpOffset);
        ctx.stroke();

        // Shoes
        ctx.fillStyle = '#222';
        ctx.beginPath(); ctx.ellipse(this.x - 12, this.y + 32 + jumpOffset, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(this.x + 12, this.y + 32 + jumpOffset, 7, 4, 0, 0, Math.PI * 2); ctx.fill();

        // Slingshot
        ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 5;
        let slY = this.groundY;
        ctx.beginPath(); ctx.moveTo(this.slingshotX, slY); ctx.lineTo(this.slingshotX, this.slingshotY); ctx.stroke();
        // Fork
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(this.slingshotX - 8, this.slingshotY - 12); ctx.lineTo(this.slingshotX, this.slingshotY); ctx.lineTo(this.slingshotX + 8, this.slingshotY - 12); ctx.stroke();

        // Draw dead state
        if (this.dead) {
            // Draw a tombstone or fallen character
            ctx.fillStyle = '#555';
            ctx.fillRect(this.x - 10, this.y + 30 + jumpOffset, 20, 10); // tombstone base
            ctx.beginPath(); ctx.arc(this.x, this.y + 30 + jumpOffset, 10, 0, Math.PI); ctx.fill(); // tombstone top
        }

        ctx.restore();
    }
}