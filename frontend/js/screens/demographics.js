document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('demographics-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            AppState.demographics = {
                age: document.getElementById('demo-age').value,
                gender: document.getElementById('demo-gender').value,
                nativeLanguage: document.getElementById('demo-language').value,
                englishProficiency: document.getElementById('demo-english').value
            };
            
            navigateTo('dialect');
        });
    }
});
