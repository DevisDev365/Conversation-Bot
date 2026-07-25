class AudioStreamPlayer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.connect(this.audioContext.destination);
        
        this.isPlaying = false;
        this.animationId = null;
        this.accentColor = '#4A9EFF';
        
        this.nextPlayTime = 0;
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }
    
    resize() {
        if (this.canvas) {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width - 40;
            this.canvas.height = 200;
        }
    }
    
    setAccentColor(color) { 
        this.accentColor = color; 
    }
    
    async init() {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    playPCMChunk(pcm16Buffer) {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.drawWaveform();
        }

        // Convert ArrayBuffer of Int16 to Float32
        const int16Array = new Int16Array(pcm16Buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
        }

        const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, 16000);
        audioBuffer.getChannelData(0).set(float32Array);

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.analyser);

        const currentTime = this.audioContext.currentTime;
        if (this.nextPlayTime < currentTime) {
            this.nextPlayTime = currentTime + 0.05; // 50ms buffer
        }

        source.start(this.nextPlayTime);
        this.nextPlayTime += audioBuffer.duration;
        
        // When this specific chunk ends, check if we're done playing all chunks
        source.onended = () => {
            if (this.audioContext.currentTime >= this.nextPlayTime) {
                this.isPlaying = false;
                this.drawIdle();
            }
        };
    }
    
    stop() {
        this.isPlaying = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
    
    drawWaveform() {
        if (!this.isPlaying) return;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const barWidth = (this.canvas.width / bufferLength) * 2.5;
        let x = 0;
        
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.accentColor;
        this.ctx.fillStyle = this.accentColor;
        
        for(let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * this.canvas.height * 0.8;
            const y = (this.canvas.height - barHeight) / 2;
            this.ctx.fillRect(x, y, barWidth - 1, barHeight);
            x += barWidth;
        }
        
        this.ctx.shadowBlur = 0;
        this.animationId = requestAnimationFrame(() => this.drawWaveform());
    }
    
    drawIdle() {
        this.stop();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        
        for(let i = 0; i < this.canvas.width; i++) {
            this.ctx.lineTo(i, this.canvas.height / 2 + Math.sin(i * 0.05 + Date.now() * 0.002) * 10);
        }
        
        this.ctx.strokeStyle = this.accentColor;
        this.ctx.globalAlpha = 0.5;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
        
        this.animationId = requestAnimationFrame(() => this.drawIdle());
    }
}
