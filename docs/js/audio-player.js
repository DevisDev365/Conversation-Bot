class AudioPlayer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.isPlaying = false;
        this.animationId = null;
        this.accentColor = '#4A9EFF';
        
        // Handle resize
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
    
    async playBase64(base64Audio) {
        try {
            const binary = atob(base64Audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            
            const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            return new Promise(resolve => {
                source.onended = () => { 
                    this.isPlaying = false; 
                    this.drawIdle(); 
                    resolve(); 
                };
                this.isPlaying = true;
                source.start();
                this.drawWaveform();
            });
        } catch (e) {
            console.error("Audio playback error:", e);
        }
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
    
    drawListening() {
        this.stop();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const time = Date.now() * 0.003;
        const radius = 20 + Math.sin(time) * 10;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ef4444'; // Red for listening
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
        
        this.animationId = requestAnimationFrame(() => this.drawListening());
    }
}
