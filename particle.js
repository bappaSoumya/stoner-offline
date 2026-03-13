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

function spawnHitParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color, (Math.random() - 0.5) * 5, -Math.random() * 4, 20 + Math.random() * 20));
    }
}