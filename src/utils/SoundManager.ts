// Sound Manager for typer.world
// Uses Web Audio API for low-latency audio playback

class SoundManagerClass {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = false;
    private volume: number = 0.5;
    private initialized: boolean = false;

    async init() {
        if (this.initialized) return;

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) {
                console.warn('Web Audio API not supported');
                return;
            }
            this.audioContext = new AudioContextClass();
            await this.loadSounds();
            this.initialized = true;
        } catch (e) {
            console.error('Failed to initialize audio:', e);
            this.audioContext = null;
        }
    }

    private async loadSounds() {
        // Generate simple sounds using oscillator (no external files needed)
        // This creates synthetic key click sounds
    }

    private createClickSound(): AudioBuffer | null {
        if (!this.audioContext) return null;

        try {
            const sampleRate = this.audioContext.sampleRate;
            const duration = 0.05; // 50ms
            const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < data.length; i++) {
                // Quick decay click sound
                const t = i / sampleRate;
                data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 80);
            }

            return buffer;
        } catch (e) {
            console.error('Failed to create click sound:', e);
            return null;
        }
    }

    private createErrorSound(): AudioBuffer | null {
        if (!this.audioContext) return null;

        try {
            const sampleRate = this.audioContext.sampleRate;
            const duration = 0.1;
            const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Lower frequency for error
                data[i] = Math.sin(2 * Math.PI * 300 * t) * Math.exp(-t * 30);
            }

            return buffer;
        } catch (e) {
            console.error('Failed to create error sound:', e);
            return null;
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (enabled && !this.initialized) {
            this.init().catch(() => { });
        }
    }

    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    async playKey() {
        if (!this.enabled || !this.audioContext) return;

        try {
            // Resume context if suspended (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const buffer = this.createClickSound();
            if (!buffer) return;

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = buffer;
            gainNode.gain.value = this.volume * 0.3;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            source.start();
        } catch (e) {
            // Silently fail - audio is non-critical
        }
    }

    async playError() {
        if (!this.enabled || !this.audioContext) return;

        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const buffer = this.createErrorSound();
            if (!buffer) return;

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = buffer;
            gainNode.gain.value = this.volume * 0.4;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            source.start();
        } catch (e) {
            // Silently fail - audio is non-critical
        }
    }

    async playSuccess() {
        if (!this.enabled || !this.audioContext) return;

        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Higher pitch success sound
            const sampleRate = this.audioContext.sampleRate;
            const duration = 0.15;
            const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                data[i] = (Math.sin(2 * Math.PI * 523 * t) + Math.sin(2 * Math.PI * 659 * t)) * 0.5 * Math.exp(-t * 15);
            }

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = buffer;
            gainNode.gain.value = this.volume * 0.3;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            source.start();
        } catch (e) {
            // Silently fail - audio is non-critical
        }
    }

    dispose() {
        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (e) {
                // Ignore cleanup errors
            }
            this.audioContext = null;
        }
        this.initialized = false;
    }
}

export const SoundManager = new SoundManagerClass();
