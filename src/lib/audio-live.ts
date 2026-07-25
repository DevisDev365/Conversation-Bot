// Utility class for PCM Audio Input capture (16kHz) and Output playback (24kHz)

export class LiveAudioEngine {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private mediaSource: MediaStreamAudioSourceNode | null = null;

  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private analyserNode: AnalyserNode | null = null;

  private onAudioInputCallback: ((base64Pcm16: string) => void) | null = null;
  private onVolumeChangeCallback: ((volume: number, isAiSpeaking: boolean) => void) | null = null;

  private isAiSpeaking = false;
  private animFrameId: number | null = null;

  constructor() {}

  // Initialize Mic audio input capture at 16,000 Hz
  async startRecording(onAudioChunk: (base64Pcm16: string) => void): Promise<boolean> {
    try {
      this.onAudioInputCallback = onAudioChunk;
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      this.inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      this.analyserNode = this.inputAudioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;

      this.mediaSource = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
      // Create ScriptProcessor with buffer size 4096 (approx 256ms chunk)
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

      this.mediaSource.connect(this.analyserNode);
      this.analyserNode.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioCtx.destination);

      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.onAudioInputCallback) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16Base64 = this.float32ToPcm16Base64(inputData);
        if (pcm16Base64) {
          this.onAudioInputCallback(pcm16Base64);
        }
      };

      this.startVolumeMonitoring();
      return true;
    } catch (err) {
      console.error("Failed to access microphone:", err);
      return false;
    }
  }

  // Stop recording mic
  stopRecording() {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor = null;
    }
    if (this.mediaSource) {
      this.mediaSource.disconnect();
      this.mediaSource = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.inputAudioCtx) {
      this.inputAudioCtx.close();
      this.inputAudioCtx = null;
    }
    this.stopVolumeMonitoring();
  }

  // Prepare Output AudioContext at 24,000 Hz for Gemini Live audio playback
  private getOutputAudioContext(): AudioContext {
    if (!this.outputAudioCtx || this.outputAudioCtx.state === "closed") {
      this.outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
    if (this.outputAudioCtx.state === "suspended") {
      this.outputAudioCtx.resume();
    }
    return this.outputAudioCtx;
  }

  // Play a base64 encoded 24kHz 16-bit PCM audio chunk received from AI
  playAudioChunk(base64Pcm: string) {
    try {
      const ctx = this.getOutputAudioContext();
      const pcm16 = this.base64ToUint8Array(base64Pcm);
      const float32 = this.pcm16ToFloat32(pcm16);

      if (float32.length === 0) return;

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      if (this.nextStartTime < now) {
        this.nextStartTime = now;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.activeSources.push(source);
      this.isAiSpeaking = true;

      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
        if (this.activeSources.length === 0) {
          this.isAiSpeaking = false;
        }
      };
    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  }

  // Interrupt AI playback immediately
  interrupt() {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // source may already be stopped
      }
    });
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
    this.isAiSpeaking = false;
  }

  // Set volume monitoring callback
  setVolumeCallback(cb: (vol: number, isAiSpeaking: boolean) => void) {
    this.onVolumeChangeCallback = cb;
  }

  private startVolumeMonitoring() {
    const dataArray = new Uint8Array(128);
    const update = () => {
      let volume = 0;
      if (this.analyserNode) {
        this.analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        volume = sum / dataArray.length / 255;
      }
      if (this.onVolumeChangeCallback) {
        this.onVolumeChangeCallback(volume, this.isAiSpeaking);
      }
      this.animFrameId = requestAnimationFrame(update);
    };
    update();
  }

  private stopVolumeMonitoring() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  // Convert Float32Array to PCM 16-bit Little Endian Base64
  private float32ToPcm16Base64(float32Data: Float32Array): string {
    const buffer = new ArrayBuffer(float32Data.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Data.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Data[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return this.arrayBufferToBase64(buffer);
  }

  // Convert Base64 string to Uint8Array
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Convert 16-bit PCM Uint8Array to Float32Array
  private pcm16ToFloat32(bytes: Uint8Array): Float32Array {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const numSamples = Math.floor(bytes.length / 2);
    const float32 = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const int16 = view.getInt16(i * 2, true);
      float32[i] = int16 / (int16 < 0 ? 32768 : 32767);
    }
    return float32;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  cleanup() {
    this.stopRecording();
    this.interrupt();
    if (this.outputAudioCtx) {
      this.outputAudioCtx.close();
      this.outputAudioCtx = null;
    }
  }
}
