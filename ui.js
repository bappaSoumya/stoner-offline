// ─── STONE SELECTOR UI ───
function updateStoneSelector() {
    let container = document.getElementById('stone-selector');
    let cp = currentPlayer === 1 ? p1 : p2;
    if (!gameActive || activeProjectile) { container.style.display = 'none'; return; }
    
    // In single-player mode, only show selector for human player
    if (document.getElementById('gameMode').value === 'single' && currentPlayer !== 1) {
        container.style.display = 'none';
        return;
    }
    
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

// ─── UPDATE UI ───
function updateUI() {
    // Update progress bars
    let p1HpPercent = (p1.hp / MAX_HP) * 100;
    let p2HpPercent = (p2.hp / MAX_HP) * 100;
    
    document.getElementById('p1-hp-bar').style.width = p1HpPercent + '%';
    document.getElementById('p2-hp-bar').style.width = p2HpPercent + '%';
    
    // Update PTS progress bars
    let p1PtsPercent = (p1.points / 100) * 100; // Assuming max points is 100 for full bar
    let p2PtsPercent = (p2.points / 100) * 100;
    
    document.getElementById('p1-pts-bar').style.width = p1PtsPercent + '%';
    document.getElementById('p2-pts-bar').style.width = p2PtsPercent + '%';
    
    // Update shop points display
    let cp = currentPlayer === 1 ? p1 : p2;
    document.getElementById('shop-pts').textContent = cp.points;
}

// ─── SHOP ───
function openShop() {
    if (!gameActive || activeProjectile) return;
    // In single-player, only human can shop and only on their turn
    if (document.getElementById('gameMode').value === 'single' && currentPlayer !== 1) return;
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
    document.getElementById('shop-overlay').style.display = 'flex';
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
    openShop(); // refresh shop after purchase
    updateStoneSelector();
}

// Note: shop-trigger button was removed from HTML, shop is now accessed via canvas button
// The shop-close-btn functionality is still needed for the shop modal
document.getElementById('shop-close-btn').onclick = () => {
    document.getElementById('shop-overlay').style.display = 'none';
};
