// Configuration
const CONFIG = {
    BACKEND_URL: 'https://conversation-bot-kmel.onrender.com',  // Change for production
    MAX_SESSION_DURATION: 480,  // 8 minutes in seconds
    MAX_HISTORY_TURNS: 3
};

// Application State
const AppState = {
    currentScreen: 'dialect',
    participantId: null,
    dialect: null,       // 'uk' or 'in'
    voiceGender: null,   // 'male' or 'female'
    demographics: {},
    conversationHistory: [],  // {role, content, timestamp}
    sessionStartTime: null,
    sessionDuration: 0,
    surveyResponses: {},
    accentColor: null    // CSS color value based on dialect
};

// Generate UUID for participant
function generateParticipantId() {
    return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Screen navigation
function navigateTo(screenId) {
    const currentEl = document.getElementById(`screen-${AppState.currentScreen}`);
    const nextEl = document.getElementById(`screen-${screenId}`);
    
    if (currentEl && nextEl) {
        // Special case for modal
        if (screenId === 'voice') {
            nextEl.classList.add('active');
            return;
        }
        
        if (AppState.currentScreen === 'voice') {
            document.getElementById('screen-voice').classList.remove('active');
            // We also need to transition out from dialect
            const dialectEl = document.getElementById('screen-dialect');
            dialectEl.classList.add('exiting');
            setTimeout(() => {
                dialectEl.classList.remove('active', 'exiting');
                nextEl.classList.add('active');
                
                // Trigger any specific screen initialization
                window.dispatchEvent(new CustomEvent('screenChanged', { detail: screenId }));
            }, 400);
            AppState.currentScreen = screenId;
            return;
        }

        currentEl.classList.add('exiting');
        
        setTimeout(() => {
            currentEl.classList.remove('active', 'exiting');
            nextEl.classList.add('active');
            AppState.currentScreen = screenId;
            
            // Trigger any specific screen initialization
            window.dispatchEvent(new CustomEvent('screenChanged', { detail: screenId }));
        }, 400); // matches CSS animation duration
    } else if (!currentEl && nextEl) {
        // Initial load
        nextEl.classList.add('active');
        AppState.currentScreen = screenId;
    }
}

// Apply accent color theme based on dialect
function applyAccentTheme(dialect) {
    const color = dialect === 'uk' ? '#4A9EFF' : '#FF8C42';
    document.documentElement.style.setProperty('--color-accent', color);
    
    // Update CSS variables for specific AI message backgrounds
    const aiBg = dialect === 'uk' ? 'rgba(74, 158, 255, 0.1)' : 'rgba(255, 140, 66, 0.1)';
    const aiBorder = dialect === 'uk' ? 'rgba(74, 158, 255, 0.2)' : 'rgba(255, 140, 66, 0.2)';
    
    const style = document.createElement('style');
    style.innerHTML = `
        .message.assistant {
            background: ${aiBg} !important;
            border-color: ${aiBorder} !important;
        }
    `;
    document.head.appendChild(style);
    
    AppState.accentColor = color;
}

// Initialize app
function initApp() {
    navigateTo('welcome');
}

document.addEventListener('DOMContentLoaded', initApp);
