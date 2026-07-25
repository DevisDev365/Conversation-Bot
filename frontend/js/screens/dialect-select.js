document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.dialect-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const dialect = card.getAttribute('data-dialect');
            AppState.dialect = dialect;
            
            // Highlight selected card
            cards.forEach(c => c.style.borderColor = '');
            card.style.borderColor = dialect === 'uk' ? 'var(--color-uk)' : 'var(--color-in)';
            
            applyAccentTheme(dialect);
            
            // Small delay for visual feedback before opening modal
            setTimeout(() => {
                navigateTo('voice');
            }, 300);
        });
    });
});
