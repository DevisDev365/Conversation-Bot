class VoiceRecorder {
    constructor(onSpeechEnd) {
        this.onSpeechEnd = onSpeechEnd; // callback with audio Blob
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.myVad = null;
        this.stream = null;
    }
    
    async init() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Initialize VAD using the global vad object from CDN
            this.myVad = await vad.MicVAD.new({
                onSpeechStart: () => {
                    console.log("VAD: Speech start");
                    this.startRecording();
                },
                onSpeechEnd: (audio) => {
                    console.log("VAD: Speech end");
                    this.stopRecording();
                },
                positiveSpeechThreshold: 0.8,
                negativeSpeechThreshold: 0.3,
                minSpeechFrames: 5,
                ortWasmUrl: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort-wasm.wasm",
                ortWasmSimdUrl: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort-wasm-simd.wasm",
                workletURL: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.30/dist/vad.worklet.bundle.min.js",
                modelURL: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.30/dist/silero_vad.onnx"
            });
            this.myVad.start();
        } catch (e) {
            console.error("VAD Init Error", e);
        }
    }
    
    startRecording() {
        this.audioChunks = [];
        if (!this.stream) return;
        this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/webm' });
        this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
            if (this.onSpeechEnd) {
                this.onSpeechEnd(blob);
            }
        };
        this.mediaRecorder.start();
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
    }
    
    pause() { 
        if(this.myVad) this.myVad.pause(); 
    }
    
    resume() { 
        if(this.myVad) this.myVad.start(); 
    }
    
    destroy() { 
        if(this.myVad) {
            try { this.myVad.destroy(); } catch(e){}
        }
        if(this.stream) {
            this.stream.getTracks().forEach(t => t.stop()); 
        }
    }
}
