function createSparkles() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = (50 + Math.random() * 50) + '%';
        
        const duration = 1 + Math.random() * 2;
        const delay = Math.random() * 2;
        
        sparkle.style.animation = `flyUp ${duration}s ${delay}s ease-out forwards`;
        container.appendChild(sparkle);
    }
}

window.addEventListener('screenChanged', (e) => {
    if (e.detail === 'thankyou') {
        const pidEl = document.getElementById('display-participant-id');
        if (pidEl) {
            pidEl.textContent = AppState.participantId || 'ERROR-MISSING-ID';
        }
        createSparkles();
    }
});
