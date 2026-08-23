// 音频引擎 - 使用Web Audio API生成打击乐音效

class AudioEngine {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.3;
    }

    // 生成小鼓音效
    playSnare(duration = 0.2) {
        const now = this.audioContext.currentTime;
        
        // 白噪声
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        source.start(now);
        source.stop(now + duration);
    }

    // 生成木鱼音效
    playWoodblock(duration = 0.15) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + duration);
        
        gainNode.gain.setValueAtTime(1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    // 生成钹音效
    playCymbal(duration = 0.5) {
        const now = this.audioContext.currentTime;
        
        // 创建多个频率的振荡器
        const frequencies = [200, 400, 800, 1200];
        frequencies.forEach(freq => {
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            osc.frequency.value = freq;
            gainNode.gain.setValueAtTime(0.5, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            osc.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            osc.start(now);
            osc.stop(now + duration);
        });
    }

    // 生成串铃音效
    playBells(duration = 0.4) {
        const now = this.audioContext.currentTime;
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        frequencies.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            osc.frequency.value = freq;
            gainNode.gain.setValueAtTime(0.3, now + index * 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            osc.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            osc.start(now + index * 0.05);
            osc.stop(now + duration);
        });
    }

    // 生成三角铁音效
    playTriangle(duration = 0.3) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = 1000;
        
        gainNode.gain.setValueAtTime(1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    // 根据音色播放音效
    playPercussion(percussionType, duration = 0.2) {
        switch(percussionType) {
            case 'snare':
                this.playSnare(duration);
                break;
            case 'woodblock':
                this.playWoodblock(duration);
                break;
            case 'cymbal':
                this.playCymbal(duration);
                break;
            case 'bells':
                this.playBells(duration);
                break;
            case 'triangle':
                this.playTriangle(duration);
                break;
        }
    }

    // 播放节奏序列
    async playRhythm(percussionType, notes) {
        for (const note of notes) {
            this.playPercussion(percussionType, note.duration);
            await this.sleep(note.duration * 1000);
        }
    }

    // 播放节奏序列并返回时间信息
    async playRhythmWithTiming(percussionType, notes) {
        const timings = [];
        let currentTime = 0;

        for (const note of notes) {
            timings.push({
                startTime: currentTime,
                duration: note.duration,
                endTime: currentTime + note.duration
            });

            this.playPercussion(percussionType, note.duration);
            await this.sleep(note.duration * 1000);
            currentTime += note.duration;
        }

        return timings;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 导出到全局作用域
window.AudioEngine = AudioEngine;

