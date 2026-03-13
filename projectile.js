// ─── PROJECTILE ───
class Projectile {
    constructor(x, y, vx, vy, stoneType, ownerId) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.active = true;
        this.stoneType = stoneType;
        this.ownerId = ownerId;
        this.trailTimer = 0;
        this.st = STONE_TYPES[stoneType];
        this.bought = stoneType !== 'rock'; // assume bought if not rock
        this.multiHits = 0; // for multi stone
    }
    update() {
        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;
        // Trail particles
        this.trailTimer++;
        if (this.trailTimer % 2 === 0) {
            particles.push(new Particle(this.x, this.y, this.st.trail || '#888', (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 15));
        }
        // For multi stone, break in mid-air after some distance
        if (this.stoneType === 'multi' && Math.hypot(this.vx, this.vy) < 5) { // slow enough
            this.explode(false);
            return;
        }
        // Ground hit
        if (this.y > getGroundY(this.x)) {
            this.explode(false);
            return;
        }
        // Player hit
        [p1, p2].forEach(p => {
            if (Math.hypot(this.x - p.x, this.y - (p.y - 15)) < 32) {
                let dmg = this.st.dmg;
                p.hp = Math.max(0, p.hp - dmg);
                p.shake = 20;
                // Effects
                if (this.stoneType === 'ice') p.effects.slow = 3; // slow for 3 turns
                if (this.stoneType === 'fire') p.effects.burn = 3; // burn for 3 turns
                if (this.stoneType === 'thunder') p.effects.stun = 1; // stun for 1 turn
                // Points
                let attacker = this.ownerId === 1 ? p1 : p2;
                if (p.id !== this.ownerId) {
                    attacker.points += dmg;
                    if (this.bought) {
                        p.points = Math.max(0, p.points - this.st.cost);
                    }
                }
                spawnHitParticles(this.x, this.y, this.st.color, 12);
                updateUI();
                this.explode(true);
            }
        });
        if (this.x < -20 || this.x > 1020) this.explode(false);
    }
    explode(hit) {
        if (!this.active) return;
        this.active = false;
        // Multi stone splits
        if (this.stoneType === 'multi' && hit === false) {
            // Split into 3
            for (let i = -1; i <= 1; i++) {
                let sp = new Projectile(this.x, this.y - 5, this.vx * 0.5 + i * 2, -4, 'rock', this.ownerId);
                sp.st = { ...STONE_TYPES.rock, dmg: 15 }; // 15 per particle
                sp.bought = true; // since multi was bought
                sp.multiParent = this; // reference to parent
                subProjectiles.push(sp);
            }
        }
        if (subProjectiles.length === 0) {
            setTimeout(nextTurn, 500);
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        if (this.st.glow) {
            ctx.shadowColor = this.st.glow;
            ctx.shadowBlur = 15;
        }
        ctx.fillStyle = this.st.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.st.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}