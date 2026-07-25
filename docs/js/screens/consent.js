document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.getElementById('consent-checkbox');
    const btnContinue = document.getElementById('btn-consent-continue');
    
    if (checkbox && btnContinue) {
        checkbox.addEventListener('change', (e) => {
            btnContinue.disabled = !e.target.checked;
        });
        
        btnContinue.addEventListener('click', () => {
            AppState.participantId = generateParticipantId();
            navigateTo('demographics');
        });
    }
});
