// ─── STONE SELECTOR UI ───
function updateStoneSelector() {
    let container = document.getElementById('stone-selector');
    let cp = currentPlayer === 1 ? p1 : p2;
    if (!gameActive || activeProjectile) { container.style.display = 'none'; return; }
    container.style.display = 'flex';
    // Position based on player
    if (currentPlayer === 1) {
        container.style.left = '10px';
        container.style.right = 'auto';
        container.style.transform = 'none';
    } else {
        container.style.left = 'auto';
        container.style.right = '10px';
        container.style.transform = 'none';
    }
    // Smaller size
    let size = Math.min(15, canvas.width / 65); // adjust
    container.innerHTML = '';
    Object.keys(STONE_TYPES).forEach(key => {
        let st = STONE_TYPES[key];
        let count = cp.stones[key];
        if (count <= 0 && key !== 'rock') return;
        let btn = document.createElement('div');
        btn.className = 'stone-sel-btn' + (cp.selectedStone === key ? ' active' : '');
        btn.style.background = st.color;
        btn.style.width = size + 'px';
        btn.style.height = size + 'px';
        btn.title = st.name + ' — ' + st.desc;
        if (key !== 'rock') {
            let badge = document.createElement('span');
            badge.className = 'stone-count';
            badge.textContent = count === Infinity ? '∞' : count;
            badge.style.fontSize = (size / 4) + 'px';
            badge.style.width = (size / 2) + 'px';
            badge.style.height = (size / 2) + 'px';
            btn.appendChild(badge);
        }
        btn.onclick = () => { cp.selectedStone = key; updateStoneSelector(); };
        container.appendChild(btn);
    });
}

// ─── SHOP ───
function openShop() {
    if (!gameActive || activeProjectile) return;
    let cp = currentPlayer === 1 ? p1 : p2;
    document.getElementById('shop-player').textContent = 'P' + cp.id;
    document.getElementById('shop-pts').textContent = cp.points;
    let itemsDiv = document.getElementById('shop-items');
    itemsDiv.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
        let row = document.createElement('div');
        row.className = 'shop-row';
        let canBuy = cp.points >= item.cost;
        if (item.type === 'heal' && cp.hp >= MAX_HP) canBuy = false;
        let btnColor = '#4CAF50';
        if (item.type === 'stone') {
            btnColor = STONE_TYPES[item.stone].color;
        }
        row.innerHTML = `
            <span>${item.label}</span>
            <button class="shop-btn" style="background:${btnColor}" ${!canBuy ? 'disabled' : ''} data-id="${item.id}">${item.cost} pts</button>
        `;
        row.querySelector('button').onclick = () => buyItem(item);
        itemsDiv.appendChild(row);
    });
    document.getElementById('shop-overlay').classList.add('open');
}

function buyItem(item) {
    let cp = currentPlayer === 1 ? p1 : p2;
    if (cp.points < item.cost) return;
    if (item.type === 'heal' && cp.hp >= MAX_HP) return;
    cp.points -= item.cost;
    if (item.type === 'heal') {
        cp.hp = Math.min(MAX_HP, cp.hp + item.amount);
    } else if (item.type === 'stone') {
        cp.stones[item.stone] = (cp.stones[item.stone] || 0) + 3;
    }
    updateUI();
    openShop(); // refresh
    updateStoneSelector();
}

document.getElementById('shop-trigger').onclick = openShop;
document.getElementById('shop-close-btn').onclick = () => {
    document.getElementById('shop-overlay').classList.remove('open');
};