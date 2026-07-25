let recorder = null;
let audioPlayer = null;
let timerInterval = null;

function appendMessage(role, text) {
    const area = document.getElementById('transcript-area');
    const msg = document.createElement('div');
    msg.className = `message ${role}`;
    msg.textContent = text;
    area.appendChild(msg);
    area.scrollTop = area.scrollHeight;
    
    AppState.conversationHistory.push({
        role,
        content: text,
        timestamp: new Date().toISOString()
    });
}

function updateStatus(state) {
    const textEl = document.getElementById('conv-status-text');
    const dotEl = document.querySelector('.status-dot');
    
    switch(state) {
        case 'LISTENING':
            textEl.textContent = 'Listening...';
            dotEl.style.backgroundColor = '#ef4444'; // Red for recording
            dotEl.classList.add('pulsing');
            audioPlayer?.drawListening();
            break;
        case 'PROCESSING':
            textEl.textContent = 'Processing...';
            dotEl.style.backgroundColor = '#eab308'; // Yellow for processing
            dotEl.classList.add('pulsing');
            audioPlayer?.drawIdle();
            break;
        case 'SPEAKING':
            textEl.textContent = 'Speaking...';
            dotEl.style.backgroundColor = AppState.accentColor; // Theme color for speaking
            dotEl.classList.add('pulsing');
            // Waveform handled by audio player
            break;
        case 'IDLE':
        default:
            textEl.textContent = 'Ready';
            dotEl.style.backgroundColor = '#22c55e'; // Green for ready
            dotEl.classList.remove('pulsing');
            audioPlayer?.drawIdle();
            break;
    }
}

function startTimer() {
    AppState.sessionStartTime = new Date().toISOString();
    AppState.sessionDuration = 0;
    
    timerInterval = setInterval(() => {
        AppState.sessionDuration++;
        
        if (AppState.sessionDuration >= CONFIG.MAX_SESSION_DURATION) {
            endConversation();
        }
    }, 1000);
}

async function handleSpeechEnd(blob) {
    if (recorder) recorder.pause();
    updateStatus('PROCESSING');
    
    // Simulate API call for now (or make actual call if backend available)
    try {
        const formData = new FormData();
        formData.append('file', blob, 'audio.webm');
        formData.append('dialect', AppState.dialect);
        formData.append('voice_gender', AppState.voiceGender);
        
        // Ensure we only send max turns
        const recentHistory = AppState.conversationHistory.slice(-CONFIG.MAX_HISTORY_TURNS * 2);
        formData.append('history', JSON.stringify(recentHistory));
        
        const res = await fetch(`${CONFIG.BACKEND_URL}/api/converse`, {
            method: 'POST',
            body: formData
        });
        
        if (res.ok) {
            const data = await res.json();
            appendMessage('user', data.transcript || "...");
            appendMessage('assistant', data.response_text || "...");
            
            updateStatus('SPEAKING');
            if (data.audio_base64) {
                await audioPlayer.playBase64(data.audio_base64);
            }
        } else {
            console.error("Backend error");
            appendMessage('user', "(Audio sent)");
            appendMessage('assistant', "I'm having trouble connecting to the server.");
            await new Promise(r => setTimeout(r, 2000));
        }
    } catch (err) {
        console.error("Converse API error", err);
        appendMessage('user', "(Audio sent)");
        appendMessage('assistant', "Hmm, I couldn't process that right now.");
        await new Promise(r => setTimeout(r, 2000));
    }
    
    if (recorder) recorder.resume();
    updateStatus('LISTENING');
}

function endConversation() {
    if (timerInterval) clearInterval(timerInterval);
    if (recorder) recorder.destroy();
    if (audioPlayer) audioPlayer.stop();
    navigateTo('thankyou');
}

window.addEventListener('screenChanged', async (e) => {
    if (e.detail === 'conversation') {
        // Init Player
        audioPlayer = new AudioPlayer('waveform-canvas');
        audioPlayer.setAccentColor(AppState.accentColor);
        audioPlayer.drawIdle();
        
        // Init Recorder
        recorder = new VoiceRecorder(handleSpeechEnd);
        await recorder.init();
        
        // Start UI
        startTimer();
        
        // Fetch greeting
        if (recorder) recorder.pause();
        updateStatus('PROCESSING');
        try {
            const greetFormData = new FormData();
            greetFormData.append('dialect', AppState.dialect);
            greetFormData.append('voice_gender', AppState.voiceGender);
            const res = await fetch(`${CONFIG.BACKEND_URL}/api/greeting`, {
                method: 'POST',
                body: greetFormData
            });
            if (res.ok) {
                const data = await res.json();
                appendMessage('assistant', data.response_text);
                updateStatus('SPEAKING');
                if (data.audio_base64) {
                    await audioPlayer.playBase64(data.audio_base64);
                }
            } else {
                appendMessage('assistant', "Hello! I'm ready to chat.");
                await new Promise(r => setTimeout(r, 2000));
            }
        } catch (err) {
            console.error("Greeting API error", err);
            appendMessage('assistant', "Hello! I'm ready to chat.");
            await new Promise(r => setTimeout(r, 2000));
        }
        
        if (recorder) recorder.resume();
        updateStatus('LISTENING');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const btnEnd = document.getElementById('btn-end-conversation');
    if (btnEnd) {
        btnEnd.addEventListener('click', endConversation);
    }
});
