// UI functions that need to be accessible globally
window.updateStoneSelector = function() {
    let container = document.getElementById('stone-selector');
    let cp = window.currentPlayer === 1 ? window.p1 : window.p2;
    if (!window.gameActive || window.activeProjectile) { container.style.display = 'none'; return; }
    
    // In single-player mode, only show selector for human player
    if (document.getElementById('gameMode').value === 'single' && window.currentPlayer !== 1) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'flex';
    // Position based on player
    if (window.currentPlayer === 1) {
        container.style.left = '10px';
        container.style.right = 'auto';
        container.style.transform = 'none';
    } else {
        container.style.left = 'auto';
        container.style.right = '10px';
        container.style.transform = 'none';
    }
    // Smaller size
    let size = Math.min(15, window.canvas.width / 65); // adjust
    container.innerHTML = '';
    Object.keys(window.STONE_TYPES).forEach(key => {
        let st = window.STONE_TYPES[key];
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
        btn.onclick = () => { cp.selectedStone = key; window.updateStoneSelector(); };
        container.appendChild(btn);
    });
}

window.updateUI = function() {
    // Update progress bars
    let p1HpPercent = (window.p1.hp / window.MAX_HP) * 100;
    let p2HpPercent = (window.p2.hp / window.MAX_HP) * 100;
    
    document.getElementById('p1-hp-bar').style.width = p1HpPercent + '%';
    document.getElementById('p2-hp-bar').style.width = p2HpPercent + '%';
    
    // Update PTS progress bars
    let p1PtsPercent = (window.p1.points / 100) * 100; // Assuming max points is 100 for full bar
    let p2PtsPercent = (window.p2.points / 100) * 100;
    
    document.getElementById('p1-pts-bar').style.width = p1PtsPercent + '%';
    document.getElementById('p2-pts-bar').style.width = p2PtsPercent + '%';
    
    // Update shop points display
    let cp = window.currentPlayer === 1 ? window.p1 : window.p2;
    document.getElementById('shop-pts').textContent = cp.points;
}

window.openShop = function() {
    if (!window.gameActive || window.activeProjectile) return;
    // In single-player, only human can shop and only on their turn
    if (document.getElementById('gameMode').value === 'single' && window.currentPlayer !== 1) return;
    let cp = window.currentPlayer === 1 ? window.p1 : window.p2;
    document.getElementById('shop-player').textContent = 'P' + cp.id;
    document.getElementById('shop-pts').textContent = cp.points;
    let itemsDiv = document.getElementById('shop-items');
    itemsDiv.innerHTML = '';
    window.SHOP_ITEMS.forEach(item => {
        let row = document.createElement('div');
        row.className = 'shop-row';
        let canBuy = cp.points >= item.cost;
        if (item.type === 'heal' && cp.hp >= window.MAX_HP) canBuy = false;
        let btnColor = '#4CAF50';
        if (item.type === 'stone') {
            btnColor = window.STONE_TYPES[item.stone].color;
        }
        row.innerHTML = `
            <span>${item.label}</span>
            <button class="shop-btn" style="background:${btnColor}" ${!canBuy ? 'disabled' : ''} data-id="${item.id}">${item.cost} pts</button>
        `;
        row.querySelector('button').onclick = () => window.buyItem(item);
        itemsDiv.appendChild(row);
    });
    document.getElementById('shop-overlay').style.display = 'flex';
}

window.buyItem = function(item) {
    let cp = window.currentPlayer === 1 ? window.p1 : window.p2;
    if (cp.points < item.cost) return;
    if (item.type === 'heal' && cp.hp >= window.MAX_HP) return;
    cp.points -= item.cost;
    if (item.type === 'heal') {
        cp.hp = Math.min(window.MAX_HP, cp.hp + item.amount);
    } else if (item.type === 'stone') {
        cp.stones[item.stone] = (cp.stones[item.stone] || 0) + 3;
    }
    window.updateUI();
    window.openShop(); // refresh shop after purchase
    window.updateStoneSelector();
}

// Note: shop-trigger button was removed from HTML, shop is now accessed via canvas button
// The shop-close-btn functionality is still needed for the shop modal
document.getElementById('shop-close-btn').onclick = () => {
    document.getElementById('shop-overlay').style.display = 'none';
};
