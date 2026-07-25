document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.voice-card');
    const btnBack = document.getElementById('btn-voice-back');
    const btnStart = document.getElementById('btn-start-conversation');
    const btnPreviews = document.querySelectorAll('.btn-preview');
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-preview')) return;
            
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            AppState.voiceGender = card.getAttribute('data-voice');
            btnStart.disabled = false;
        });
    });
    
    btnPreviews.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const voice = btn.getAttribute('data-preview-voice');
            const originalText = btn.innerHTML;
            btn.innerHTML = '⏳ Loading...';
            
            // TODO: Call backend /api/greeting with dialect and voice to get preview
            // For now, simple fallback beep
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                osc.connect(ctx.destination);
                osc.start();
                setTimeout(() => osc.stop(), 200);
            } catch (err) {
                console.error("Audio preview error", err);
            }
            
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 500);
        });
    });
    
    btnBack.addEventListener('click', () => {
        document.getElementById('screen-voice').classList.remove('active');
    });
    
    btnStart.addEventListener('click', () => {
        if (AppState.voiceGender) {
            navigateTo('conversation');
        }
    });
});
