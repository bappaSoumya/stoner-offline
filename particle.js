// ─── PARTICLES ───
class Particle {
    constructor(x, y, color, vx, vy, life) {
        this.x = x; this.y = y; this.color = color;
        this.vx = vx; this.vy = vy;
        this.life = life; this.maxLife = life;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.vy += 0.08;
        this.life--;
    }
    draw() {
        let alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Enhanced explosion particles for different stone types
class ExplosionParticle {
    constructor(x, y, color, type) {
        this.x = x; this.y = y;
        this.color = color;
        this.type = type; // 'fire', 'ice', 'thunder', 'rock'
        
        // Different behaviors based on stone type
        if (type === 'fire') {
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = (Math.random() - 0.5) * 8;
            this.life = 40 + Math.random() * 20;
            this.size = 2 + Math.random() * 4;
            this.glow = true;
        } else if (type === 'ice') {
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4;
            this.life = 30 + Math.random() * 20;
            this.size = 3 + Math.random() * 3;
            this.glow = false;
        } else if (type === 'thunder') {
            this.vx = (Math.random() - 0.5) * 6;
            this.vy = (Math.random() - 0.5) * 6;
            this.life = 25 + Math.random() * 15;
            this.size = 2 + Math.random() * 2;
            this.glow = true;
            this.sparkle = Math.random() > 0.5;
        } else {
            // rock/default
            this.vx = (Math.random() - 0.5) * 5;
            this.vy = (Math.random() - 0.5) * 5;
            this.life = 25 + Math.random() * 15;
            this.size = 2 + Math.random() * 3;
            this.glow = false;
        }
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life--;
        
        // Special effects
        if (this.type === 'fire') {
            this.size *= 0.95; // shrink over time
        }
        if (this.type === 'thunder' && this.sparkle) {
            this.life -= 0.5; // sparkle particles fade faster
        }
    }
    
    draw() {
        let alpha = this.life / (this.type === 'fire' ? 60 : 45);
        ctx.globalAlpha = alpha;
        
        if (this.glow) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
        }
        
        ctx.fillStyle = this.color;
        
        if (this.type === 'thunder') {
            // Draw lightning bolt shape
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + 3, this.y + 6);
            ctx.lineTo(this.x - 3, this.y + 6);
            ctx.lineTo(this.x, this.y + 12);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

function spawnHitParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color, (Math.random() - 0.5) * 5, -Math.random() * 4, 20 + Math.random() * 20));
    }
}

// New function for stone-specific explosions
function spawnExplosionParticles(x, y, stoneType, count = 20) {
    for (let i = 0; i < count; i++) {
        particles.push(new ExplosionParticle(x, y, getExplosionColor(stoneType), stoneType));
    }
}

// Helper function to get explosion colors
function getExplosionColor(stoneType) {
    switch(stoneType) {
        case 'fire': return '#ff4444';
        case 'ice': return '#44ffff';
        case 'thunder': return '#ffff44';
        case 'rock': return '#888888';
        default: return '#888888';
    }
}

// Thunder strike effect
function spawnThunderStrike(x, y) {
    // Main lightning bolt
    ctx.strokeStyle = '#ffff44';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Secondary branches
    for (let i = 0; i < 3; i++) {
        let offsetX = (Math.random() - 0.5) * 20;
        ctx.beginPath();
        ctx.moveTo(x, y - 20 + i * 10);
        ctx.lineTo(x + offsetX, y + 10 + i * 10);
        ctx.stroke();
    }
    
    // Thunder particles
    spawnExplosionParticles(x, y, 'thunder', 15);
}

// Frost effect for ice stones
function spawnFrostEffect(x, y) {
    // Frost ring
    ctx.strokeStyle = '#44ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    // Frost particles
    spawnExplosionParticles(x, y, 'ice', 15);
}

// Fire explosion effect
function spawnFireExplosion(x, y) {
    // Fire burst
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Fire particles
    spawnExplosionParticles(x, y, 'fire', 25);
}
