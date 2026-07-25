let audioPlayer = null;
let ws = null;
let audioContext = null;
let mediaStream = null;
let processorNode = null;

function updateStatus(state) {
    const textEl = document.getElementById('conv-status-text');
    const dotEl = document.querySelector('.status-dot');
    
    switch(state) {
        case 'CONNECTED':
            textEl.textContent = 'Connected (Live)';
            dotEl.style.backgroundColor = '#22c55e'; // Green
            dotEl.classList.add('pulsing');
            break;
        case 'CONNECTING':
            textEl.textContent = 'Connecting...';
            dotEl.style.backgroundColor = '#eab308'; // Yellow
            dotEl.classList.add('pulsing');
            break;
        case 'DISCONNECTED':
        default:
            textEl.textContent = 'Disconnected';
            dotEl.style.backgroundColor = '#ef4444'; // Red
            dotEl.classList.remove('pulsing');
            audioPlayer?.drawIdle();
            break;
    }
}

async function startConversation() {
    updateStatus('CONNECTING');
    
    // Convert https to wss
    const wsUrl = CONFIG.BACKEND_URL.replace('http', 'ws') + '/ws/converse';
    ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    
    ws.onopen = () => {
        updateStatus('CONNECTED');
        // Send config
        ws.send(JSON.stringify({
            dialect: AppState.dialect,
            gender: AppState.voiceGender
        }));
        
        startMicrophone();
    };
    
    ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
            if (audioPlayer) {
                audioPlayer.playPCMChunk(event.data);
            }
        }
    };
    
    ws.onclose = () => {
        updateStatus('DISCONNECTED');
        stopMicrophone();
    };
    
    ws.onerror = (err) => {
        console.error("WebSocket error", err);
        updateStatus('DISCONNECTED');
        stopMicrophone();
    };
}

async function startMicrophone() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(mediaStream);
        
        // We use a ScriptProcessorNode for simplicity to capture raw PCM audio 
        // downsampled to 16kHz
        processorNode = audioContext.createScriptProcessor(4096, 1, 1);
        
        processorNode.onaudioprocess = (e) => {
            if (!ws || ws.readyState !== WebSocket.OPEN) return;
            
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert Float32 to Int16
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                // Clamp and convert
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            
            ws.send(pcm16.buffer);
        };
        
        source.connect(processorNode);
        processorNode.connect(audioContext.destination);
    } catch (e) {
        console.error("Microphone error", e);
        alert("Microphone access is required for the conversation.");
    }
}

function stopMicrophone() {
    if (processorNode) {
        processorNode.disconnect();
        processorNode = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
    }
}

function endConversation() {
    if (ws) {
        ws.close();
        ws = null;
    }
    stopMicrophone();
    if (audioPlayer) audioPlayer.stop();
    navigateTo('thankyou');
}

window.addEventListener('screenChanged', async (e) => {
    if (e.detail === 'conversation') {
        // Hide subtitles UI since we are Audio-to-Audio
        const transcriptArea = document.getElementById('transcript-area');
        if (transcriptArea) transcriptArea.style.display = 'none';
        
        // Init Player
        audioPlayer = new AudioStreamPlayer('waveform-canvas');
        audioPlayer.setAccentColor(AppState.accentColor);
        await audioPlayer.init();
        
        // Start WebSocket connection
        startConversation();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const btnEnd = document.getElementById('btn-end-conversation');
    if (btnEnd) {
        btnEnd.addEventListener('click', endConversation);
    }
});
