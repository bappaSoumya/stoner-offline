// Background music setup
const backgroundMusic = new Audio();
backgroundMusic.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Copyright-free music
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3; // Lower volume for background music

// Game initialization logic
document.addEventListener('DOMContentLoaded', function() {
    // Control buttons functionality
    const refreshBtn = document.getElementById('refresh-btn');
    const exitBtn = document.getElementById('exit-btn');
    const muteBtn = document.getElementById('mute-btn');
    const modeSelector = document.getElementById('mode-selector');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            // Reset game
            resetGame();
        });
    }
    
    if (exitBtn) {
        exitBtn.addEventListener('click', function() {
            // Exit to menu
            window.location.href = '../index.html';
            // Stop background music
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        });
    }
    
    if (muteBtn) {
        muteBtn.addEventListener('click', function() {
            // Toggle sound
            backgroundMusic.muted = !backgroundMusic.muted;
            muteBtn.textContent = backgroundMusic.muted ? '🔇' : '🔊';
        });
    }
    
    // Toggle mode selector drawer on mobile
    if (modeSelector) {
        // Toggle drawer when clicking on the mode selector
        modeSelector.addEventListener('click', function() {
            if (window.innerWidth <= 600) {
                this.classList.toggle('active');
            }
        });
        
        // Close drawer when selecting an option
        const gameModeSelect = document.getElementById('gameMode');
        if (gameModeSelect) {
            gameModeSelect.addEventListener('change', function() {
                if (window.innerWidth <= 600 && modeSelector) {
                    modeSelector.classList.remove('active');
                }
            });
        }
        
        // Close drawer when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 600 && modeSelector && !modeSelector.contains(e.target)) {
                modeSelector.classList.remove('active');
            }
        });
    }
    
    // Multiplayer controls functionality
    const multiplayerControls = document.getElementById('multiplayer-controls');
    if (multiplayerControls) {
        // Add click event to toggle accordion
        multiplayerControls.addEventListener('click', function() {
            multiplayerControls.classList.toggle('collapsed');
        });
        
        // Auto-collapse when switching to single player mode
        const gameModeSelect = document.getElementById('gameMode');
        if (gameModeSelect) {
            gameModeSelect.addEventListener('change', function() {
                if (this.value === 'single') {
                    multiplayerControls.classList.add('collapsed');
                } else {
                    multiplayerControls.classList.remove('collapsed');
                }
            });
        }
    }
    
    // Start background music when game loads
    backgroundMusic.play().catch(e => console.log('Music autoplay prevented:', e));
});

// Service Worker registration (only works on HTTP/HTTPS, not file://)
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker failed:', err));
    });
}
