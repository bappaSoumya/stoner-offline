// ─── CONSTANTS ───
const GRAVITY = 0.22;
const POWER_MULT = 0.15;
const MAX_HP = 200;
const MAX_PTS = 200; // Points bar max display

// ─── STONE TYPES ───
const STONE_TYPES = {
    rock:     { name: 'Rock',       color: '#555',    glow: null,         dmg: 15, radius: 8,  cost: 0,  trail: '#888',    desc: 'Basic stone' },
    ice:      { name: 'Ice Stone',  color: '#00bcd4', glow: '#80deea',    dmg: 20, radius: 9,  cost: 25, trail: '#b2ebf2',  desc: '20 dmg, slows' },
    fire:     { name: 'Fire Stone', color: '#ff5722', glow: '#ff8a65',    dmg: 30, radius: 10, cost: 40, trail: '#ffab91',  desc: '30 dmg, burns' },
    thunder:  { name: 'Thunder',    color: '#ffc107', glow: '#fff176',    dmg: 25, radius: 9,  cost: 35, trail: '#fff9c4',  desc: '25 dmg, shock' },
    multi:    { name: 'Multi Stone',color: '#9c27b0', glow: '#ce93d8',    dmg: 12, radius: 7,  cost: 50, trail: '#e1bee7',  desc: 'Splits into 3!' },
};

// ─── SHOP ITEMS ───
const SHOP_ITEMS = [
    { id: 'heal',    label: '❤️ Heal +20 HP',       cost: 15, type: 'heal',  amount: 20 },
    { id: 'ice',     label: '🧊 Ice Stone',          cost: 25, type: 'stone', stone: 'ice' },
    { id: 'fire',    label: '🔥 Fire Stone',         cost: 40, type: 'stone', stone: 'fire' },
    { id: 'thunder', label: '⚡ Thunder Stone',      cost: 35, type: 'stone', stone: 'thunder' },
    { id: 'multi',   label: '💎 Multi Stone (x3)',   cost: 50, type: 'stone', stone: 'multi' },
];