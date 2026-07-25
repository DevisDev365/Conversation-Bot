document.addEventListener('DOMContentLoaded', () => {
    const btnBegin = document.getElementById('btn-begin');
    if (btnBegin) {
        btnBegin.addEventListener('click', () => {
            navigateTo('consent');
        });
    }
});
