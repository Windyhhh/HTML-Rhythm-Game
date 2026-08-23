// 主应用程序

class RhythmApp {
    constructor() {
        this.audioEngine = new AudioEngine();

        // 数据模型
        this.percussions = {
            snare: { name: '小鼓', emoji: '🥁' },
            woodblock: { name: '木鱼', emoji: '🪵' },
            cymbal: { name: '钹', emoji: '🔔' },
            bells: { name: '串铃', emoji: '🔗' },
            triangle: { name: '三角铁', emoji: '△' }
        };

        this.notes = {
            quarter: { name: '四分音符', duration: 0.5, emoji: '♩' },
            eighth: { name: '八分音符', duration: 0.25, emoji: '♪' },
            sixteenth: { name: '十六分音符', duration: 0.125, emoji: '𝅘𝅥𝅰' },
            half: { name: '二分音符', duration: 1, emoji: '𝅗𝅥' },
            whole: { name: '全音符', duration: 2, emoji: '𝅝' }
        };

        // 节拍规范：4/4拍制
        this.timeSignature = { beats: 4, beatValue: 0.5 }; // 4拍，每拍0.5秒
        this.beatsPerMeasure = 4; // 每小节4拍
        this.beatDuration = 0.5; // 每拍的时长（秒）

        this.presetTemplates = {
            simple: { name: '简单节奏', notes: ['quarter', 'quarter', 'quarter'] },
            medium: { name: '中等节奏', notes: ['quarter', 'eighth', 'eighth', 'quarter'] },
            complex: { name: '复杂节奏', notes: ['eighth', 'eighth', 'sixteenth', 'sixteenth', 'eighth'] },
            fast: { name: '快速节奏', notes: ['sixteenth', 'sixteenth', 'sixteenth', 'sixteenth'] },
            mixed: { name: '混合节奏', notes: ['quarter', 'eighth', 'sixteenth', 'eighth'] },
            triplet: { name: '三连音节奏', notes: ['quarter', 'quarter', 'eighth', 'eighth', 'eighth'] },
            quadruplet: { name: '四连音节奏', notes: ['quarter', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth'] }
        };

        this.selectedPercussion = 'snare';
        this.selectedNotes = [];
        this.selectedNotesWithTuplets = []; // 带连音信息的音符
        this.isPlaying = false;
        this.uploadedAudio = null;
        this.interactionStartTime = null;
        this.interactionTimings = [];
        this.currentRhythmTimings = [];
        this.practiceStats = {
            totalAttempts: 0,
            totalScore: 0,
            bestScore: 0,
            averageScore: 0
        };

        this.init();
    }

    init() {
        this.setupUI();
        this.attachEventListeners();
    }

    setupUI() {
        // 生成音色按钮
        const percussionSelector = document.getElementById('percussionSelector');
        Object.entries(this.percussions).forEach(([key, value]) => {
            const btn = document.createElement('button');
            btn.className = 'percussion-btn';
            btn.textContent = `${value.emoji}\n${value.name}`;
            btn.dataset.percussion = key;
            if (key === 'snare') btn.classList.add('active');
            btn.addEventListener('click', () => this.selectPercussion(key, btn));
            percussionSelector.appendChild(btn);
        });

        // 生成预设模板按钮
        const presetButtons = document.getElementById('presetButtons');
        Object.entries(this.presetTemplates).forEach(([key, value]) => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.textContent = value.name;
            btn.addEventListener('click', () => this.applyPreset(key));
            presetButtons.appendChild(btn);
        });

        // 生成音符按钮
        const noteSelector = document.getElementById('noteSelector');
        Object.entries(this.notes).forEach(([key, value]) => {
            const btn = document.createElement('button');
            btn.className = 'note-btn';
            btn.textContent = `${value.emoji}\n${value.name}`;
            btn.dataset.note = key;
            btn.addEventListener('click', () => this.selectNote(key, btn));
            noteSelector.appendChild(btn);
        });
    }

    attachEventListeners() {
        document.getElementById('playBtn').addEventListener('click', () => this.playSelectedRhythm());
        document.getElementById('clearNotesBtn').addEventListener('click', () => this.clearNotes());
        document.getElementById('interactBtn').addEventListener('click', () => this.recordInteraction());
        document.getElementById('uploadBtn').addEventListener('click', () => this.uploadMusic());
        document.getElementById('playMusicBtn').addEventListener('click', () => this.playUploadedMusic());
        document.getElementById('stopMusicBtn').addEventListener('click', () => this.stopUploadedMusic());

        // 背景音乐选择
        const bgMusicSelect = document.getElementById('backgroundMusicSelect');
        if (bgMusicSelect) {
            bgMusicSelect.addEventListener('change', (e) => this.selectBackgroundMusic(e.target.value));
        }

        // 空格键快捷键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.recordInteraction();
            }
        });
    }

    selectPercussion(key, btn) {
        document.querySelectorAll('.percussion-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedPercussion = key;
    }

    selectNote(key, btn) {
        btn.classList.toggle('selected');
        if (btn.classList.contains('selected')) {
            this.selectedNotes.push(key);
        } else {
            this.selectedNotes = this.selectedNotes.filter(n => n !== key);
        }
        this.updateSelectedNotesDisplay();
    }

    updateSelectedNotesDisplay() {
        const display = document.getElementById('selectedNotes');
        if (this.selectedNotes.length === 0) {
            display.innerHTML = '<span class="empty-state">未选择音符</span>';
            this.updateRhythmPreview();
            return;
        }

        display.innerHTML = this.selectedNotes.map((noteKey, index) => {
            const note = this.notes[noteKey];
            return `<div class="note-tag">${note.emoji} ${note.name}<span class="remove" onclick="app.removeNote(${index})">×</span></div>`;
        }).join('');

        // 更新节奏提示框
        this.updateRhythmPreview();
    }

    // 检测连音线（Tuplet）- 三连音、四连音等
    detectTuplets(notes) {
        const tuplets = [];
        let i = 0;

        while (i < notes.length) {
            // 检测三连音：3个八分音符占1拍
            if (i + 2 < notes.length &&
                notes[i] === 'eighth' && notes[i + 1] === 'eighth' && notes[i + 2] === 'eighth') {
                tuplets.push({
                    start: i,
                    end: i + 2,
                    type: 'triplet',
                    count: 3,
                    label: '3'
                });
                i += 3;
            }
            // 检测四连音：4个十六分音符占1拍
            else if (i + 3 < notes.length &&
                notes[i] === 'sixteenth' && notes[i + 1] === 'sixteenth' &&
                notes[i + 2] === 'sixteenth' && notes[i + 3] === 'sixteenth') {
                tuplets.push({
                    start: i,
                    end: i + 3,
                    type: 'quadruplet',
                    count: 4,
                    label: '4'
                });
                i += 4;
            }
            else {
                i++;
            }
        }

        return tuplets;
    }

    // 验证节拍规范（4/4拍制）
    validateTimeSignature(notes) {
        let totalDuration = 0;
        notes.forEach(noteKey => {
            totalDuration += this.notes[noteKey].duration;
        });

        // 计算总拍数
        const totalBeats = totalDuration / this.beatDuration;

        return {
            isValid: totalBeats <= this.beatsPerMeasure,
            totalBeats: totalBeats,
            maxBeats: this.beatsPerMeasure,
            remainingBeats: this.beatsPerMeasure - totalBeats
        };
    }

    // 获取正确的音符符号，考虑符杆连接规则
    getCorrectNoteSymbol(noteKey, index, allNotes) {
        const note = this.notes[noteKey];

        // 四分音符、二分音符、全音符不需要连接
        if (noteKey === 'quarter' || noteKey === 'half' || noteKey === 'whole') {
            return note.emoji;
        }

        // 八分音符和十六分音符需要考虑连接规则
        if (noteKey === 'eighth') {
            const prevNote = index > 0 ? allNotes[index - 1] : null;
            const nextNote = index < allNotes.length - 1 ? allNotes[index + 1] : null;

            // 检查是否需要连接
            const connectPrev = prevNote === 'eighth' || prevNote === 'sixteenth';
            const connectNext = nextNote === 'eighth' || nextNote === 'sixteenth';

            // 单独的八分音符（有一根尾巴）
            if (!connectPrev && !connectNext) {
                return '♪';
            }
            // 连接的八分音符（无尾巴，由连接线显示）
            return '♩'; // 使用四分音符符号作为基础，由CSS添加连接线
        }

        if (noteKey === 'sixteenth') {
            const prevNote = index > 0 ? allNotes[index - 1] : null;
            const nextNote = index < allNotes.length - 1 ? allNotes[index + 1] : null;

            // 检查是否需要连接
            const connectPrev = prevNote === 'sixteenth' || prevNote === 'eighth';
            const connectNext = nextNote === 'sixteenth' || nextNote === 'eighth';

            // 单独的十六分音符（有两个尾巴）
            if (!connectPrev && !connectNext) {
                return '𝅘𝅥𝅰';
            }
            // 连接的十六分音符（无尾巴，由连接线显示）
            return '♩'; // 使用四分音符符号作为基础，由CSS添加连接线
        }

        return note.emoji;
    }

    // 检查是否需要符杆连接
    shouldBeamWithNext(index, allNotes) {
        if (index >= allNotes.length - 1) return false;
        const currentNote = allNotes[index];
        const nextNote = allNotes[index + 1];

        // 八分音符和十六分音符可以连接
        if ((currentNote === 'eighth' || currentNote === 'sixteenth') &&
            (nextNote === 'eighth' || nextNote === 'sixteenth')) {
            return true;
        }
        return false;
    }

    // 获取符杆连接的 CSS 类
    getBeamingClass(index, allNotes) {
        const prevNote = index > 0 ? allNotes[index - 1] : null;
        const nextNote = index < allNotes.length - 1 ? allNotes[index + 1] : null;

        let beamClass = '';

        // 检查是否与前一个音符连接
        if (prevNote === 'eighth' || prevNote === 'sixteenth') {
            beamClass += ' beam-connected-left';
        }

        // 检查是否与后一个音符连接
        if (nextNote === 'eighth' || nextNote === 'sixteenth') {
            beamClass += ' beam-connected-right';
        }

        return beamClass;
    }

    // 检测符尾束（相邻的八分音符或十六分音符）
    detectBeamGroups(notes) {
        const beamGroups = [];
        let i = 0;

        while (i < notes.length) {
            const currentNote = notes[i];

            // 检查是否是八分音符或十六分音符
            if (currentNote === 'eighth' || currentNote === 'sixteenth') {
                let groupStart = i;
                let groupEnd = i;

                // 找到连续的八分音符或十六分音符
                while (groupEnd + 1 < notes.length &&
                       (notes[groupEnd + 1] === 'eighth' || notes[groupEnd + 1] === 'sixteenth')) {
                    groupEnd++;
                }

                // 如果有至少2个相邻的八分/十六分音符，记录为一个符尾束
                if (groupEnd > groupStart) {
                    beamGroups.push({
                        start: groupStart,
                        end: groupEnd,
                        type: currentNote === 'sixteenth' ? 'sixteenth' : 'eighth'
                    });
                }

                i = groupEnd + 1;
            } else {
                i++;
            }
        }

        return beamGroups;
    }

    // 使用SVG绘制专业的音乐记谱
    drawRhythmNotation() {
        const canvas = document.getElementById('rhythmCanvas');
        const rhythmInfo = document.getElementById('rhythmInfo');

        if (!canvas || this.selectedNotes.length === 0) {
            if (rhythmInfo) {
                rhythmInfo.innerHTML = '<span class="empty-state">选择音符后显示节奏</span>';
            }
            return;
        }

        try {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制背景
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 绘制五线谱
            this.drawStaff(ctx);

            // 绘制音符
            this.drawNotes(ctx);

            // 绘制符尾束
            this.drawBeams(ctx);

            // 显示节拍信息
            const timeValidation = this.validateTimeSignature(this.selectedNotes);
            let infoHTML = `<div class="beat-info">
                <span class="beat-count">总拍数: ${timeValidation.totalBeats.toFixed(1)}/4</span>
                <span class="beat-status ${timeValidation.isValid ? 'valid' : 'invalid'}">
                    ${timeValidation.isValid ? '✓ 符合规范' : '✗ 超出规范'}
                </span>
            </div>`;
            rhythmInfo.innerHTML = infoHTML;

        } catch (error) {
            console.error('绘制错误:', error);
            if (rhythmInfo) {
                rhythmInfo.innerHTML = '<span class="error-state">绘制失败: ' + error.message + '</span>';
            }
        }
    }

    // 绘制五线谱
    drawStaff(ctx) {
        const staffTop = 50;
        const lineSpacing = 10;
        const staffLeft = 50;
        const staffWidth = 700;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        // 绘制5条线
        for (let i = 0; i < 5; i++) {
            const y = staffTop + i * lineSpacing;
            ctx.beginPath();
            ctx.moveTo(staffLeft, y);
            ctx.lineTo(staffLeft + staffWidth, y);
            ctx.stroke();
        }

        // 绘制高音谱号
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText('𝄞', staffLeft + 10, staffTop + 25);

        // 绘制4/4拍号
        ctx.font = 'bold 30px Arial';
        ctx.fillText('4', staffLeft + 50, staffTop + 10);
        ctx.fillText('4', staffLeft + 50, staffTop + 35);
    }

    // 绘制音符
    drawNotes(ctx) {
        const staffTop = 50;
        const lineSpacing = 10;
        const staffLeft = 120;
        const noteSpacing = 60;

        const beamGroups = this.detectBeamGroups(this.selectedNotes);
        const tuplets = this.detectTuplets(this.selectedNotes);

        this.selectedNotes.forEach((noteKey, index) => {
            const x = staffLeft + index * noteSpacing;
            const note = this.notes[noteKey];

            // 确定音符的Y位置（中音C）
            const y = staffTop + 40;

            // 绘制音符头
            ctx.fillStyle = note.color;
            ctx.beginPath();
            ctx.ellipse(x, y, 8, 6, -0.3, 0, 2 * Math.PI);
            ctx.fill();

            // 绘制音符杆
            ctx.strokeStyle = note.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 8, y - 8);
            ctx.lineTo(x + 8, y - 35);
            ctx.stroke();

            // 绘制音符尾（如果需要）
            const beamGroup = beamGroups.find(b => index >= b.start && index <= b.end);
            if (!beamGroup && (noteKey === 'eighth' || noteKey === 'sixteenth')) {
                // 单独的八分或十六分音符
                const tailCount = noteKey === 'sixteenth' ? 2 : 1;
                for (let i = 0; i < tailCount; i++) {
                    ctx.beginPath();
                    ctx.moveTo(x + 8, y - 35 + i * 4);
                    ctx.lineTo(x + 20, y - 30 + i * 4);
                    ctx.stroke();
                }
            }

            // 绘制连音线标记
            const tuplet = tuplets.find(t => index >= t.start && index <= t.end);
            if (tuplet && index === tuplet.start) {
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = tuplet.type === 'eighth' ? '#9370DB' : '#FF6B6B';
                ctx.fillText(tuplet.label, x - 5, y - 50);
            }
        });
    }

    // 绘制符尾束
    drawBeams(ctx) {
        const staffTop = 50;
        const staffLeft = 120;
        const noteSpacing = 60;
        const beamGroups = this.detectBeamGroups(this.selectedNotes);

        beamGroups.forEach(group => {
            const startX = staffLeft + group.start * noteSpacing + 8;
            const endX = staffLeft + group.end * noteSpacing + 8;
            const y = 50 + 40 - 35; // 音符杆顶部

            const note = this.notes[this.selectedNotes[group.start]];
            ctx.strokeStyle = note.color;
            ctx.lineWidth = 3;

            // 绘制符尾束线
            const beamCount = group.type === 'sixteenth' ? 2 : 1;
            for (let i = 0; i < beamCount; i++) {
                ctx.beginPath();
                ctx.moveTo(startX, y + i * 4);
                ctx.lineTo(endX, y + i * 4);
                ctx.stroke();
            }
        });
    }

    updateRhythmPreview() {
        if (this.selectedNotes.length === 0) {
            const rhythmInfo = document.getElementById('rhythmInfo');
            if (rhythmInfo) {
                rhythmInfo.innerHTML = '<span class="empty-state">选择音符后显示节奏</span>';
            }
            const canvas = document.getElementById('rhythmCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        // 使用VexFlow绘制
        this.drawRhythmNotation();
    }

    removeNote(index) {
        const noteKey = this.selectedNotes[index];
        this.selectedNotes.splice(index, 1);
        document.querySelectorAll('.note-btn').forEach(btn => {
            if (btn.dataset.note === noteKey) {
                btn.classList.remove('selected');
            }
        });
        this.updateSelectedNotesDisplay();
    }

    clearNotes() {
        this.selectedNotes = [];
        document.querySelectorAll('.note-btn').forEach(btn => btn.classList.remove('selected'));
        this.updateSelectedNotesDisplay();
    }

    applyPreset(presetKey) {
        const preset = this.presetTemplates[presetKey];
        if (!preset) return;

        // 清空当前选择
        this.clearNotes();

        // 应用预设
        preset.notes.forEach(noteKey => {
            this.selectedNotes.push(noteKey);
            const btn = document.querySelector(`.note-btn[data-note="${noteKey}"]`);
            if (btn) btn.classList.add('selected');
        });

        this.updateSelectedNotesDisplay();
    }

    async playSelectedRhythm() {
        if (this.selectedNotes.length === 0) {
            alert('请先选择音符');
            return;
        }

        this.isPlaying = true;
        document.getElementById('playBtn').disabled = true;

        const notes = this.selectedNotes.map(key => ({
            duration: this.notes[key].duration
        }));

        // 同步节奏提示
        this.syncRhythmIndicator(notes);

        // 播放音效并获取时间信息
        this.currentRhythmTimings = await this.audioEngine.playRhythmWithTiming(this.selectedPercussion, notes);

        this.isPlaying = false;
        document.getElementById('playBtn').disabled = false;
    }

    syncRhythmIndicator(notes) {
        const indicator = document.getElementById('rhythmIndicator');
        const petals = indicator.querySelectorAll('.petal');
        let currentTime = 0;

        notes.forEach((note, index) => {
            setTimeout(() => {
                petals.forEach((petal, petalIndex) => {
                    petal.classList.add('active');
                    petal.style.setProperty('--rotation', `${petalIndex * 60}deg`);
                });
                
                setTimeout(() => {
                    petals.forEach(petal => petal.classList.remove('active'));
                }, note.duration * 1000 * 0.8);
            }, currentTime * 1000);

            currentTime += note.duration;
        });
    }

    recordInteraction() {
        if (this.selectedNotes.length === 0) {
            alert('请先选择音符');
            return;
        }

        const now = Date.now();
        if (!this.interactionStartTime) {
            this.interactionStartTime = now;
            this.interactionTimings = [];
        }

        const timeSinceStart = now - this.interactionStartTime;
        this.interactionTimings.push(timeSinceStart);

        // 播放音效
        this.audioEngine.playPercussion(this.selectedPercussion, 0.2);

        // 计算评分
        this.calculateScore();
    }

    calculateScore() {
        if (this.interactionTimings.length === 0 || this.currentRhythmTimings.length === 0) return;

        const lastInteractionTime = this.interactionTimings[this.interactionTimings.length - 1];
        const lastRhythmTiming = this.currentRhythmTimings[this.currentRhythmTimings.length - 1];

        // 计算时间差（毫秒）
        const timeDiff = Math.abs(lastInteractionTime - (lastRhythmTiming.endTime * 1000));

        // 根据时间差计算准确度（允许误差范围：±200ms）
        const tolerance = 200;
        let accuracy = 100 - (timeDiff / tolerance * 100);
        accuracy = Math.max(0, Math.min(100, accuracy));

        // 更新统计数据
        this.practiceStats.totalAttempts++;
        this.practiceStats.totalScore += accuracy;
        this.practiceStats.bestScore = Math.max(this.practiceStats.bestScore, accuracy);
        this.practiceStats.averageScore = this.practiceStats.totalScore / this.practiceStats.totalAttempts;

        const scoreDisplay = document.getElementById('scoreDisplay');
        const scoreValue = Math.round(accuracy);
        let feedback = '再试试';
        let emoji = '😅';

        if (accuracy >= 90) {
            feedback = '很棒！🌟';
            emoji = '🌟';
        } else if (accuracy >= 75) {
            feedback = '不错！👍';
            emoji = '👍';
        } else if (accuracy >= 60) {
            feedback = '继续加油！💪';
            emoji = '💪';
        }

        scoreDisplay.innerHTML = `<div class="score-value">${scoreValue}</div><div class="score-feedback">${emoji} ${feedback}</div>`;

        // 更新统计显示
        this.updateStatsDisplay();

        // 重置
        if (this.interactionTimings.length >= this.selectedNotes.length) {
            this.interactionStartTime = null;
            this.interactionTimings = [];
        }
    }

    updateStatsDisplay() {
        document.getElementById('totalAttempts').textContent = this.practiceStats.totalAttempts;
        document.getElementById('bestScore').textContent = Math.round(this.practiceStats.bestScore);
        document.getElementById('averageScore').textContent = Math.round(this.practiceStats.averageScore);
    }

    uploadMusic() {
        const fileInput = document.getElementById('musicUpload');
        const file = fileInput.files[0];

        if (!file) {
            alert('请选择音乐文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.audioEngine.audioContext.decodeAudioData(e.target.result, (buffer) => {
                this.uploadedAudio = buffer;
                document.getElementById('musicInfo').innerHTML = `<span>✓ 已上传: ${file.name}</span>`;
                document.getElementById('playMusicBtn').disabled = false;
            });
        };
        reader.readAsArrayBuffer(file);
    }

    playUploadedMusic() {
        if (!this.uploadedAudio) return;

        const source = this.audioEngine.audioContext.createBufferSource();
        source.buffer = this.uploadedAudio;
        source.connect(this.audioEngine.masterGain);
        source.start(0);

        this.currentMusicSource = source;
        document.getElementById('stopMusicBtn').disabled = false;
    }

    stopUploadedMusic() {
        if (this.currentMusicSource) {
            this.currentMusicSource.stop();
            document.getElementById('stopMusicBtn').disabled = true;
        }
    }

    selectBackgroundMusic(musicType) {
        // 背景音乐选择处理
        // 目前为占位符，可以扩展为实际的背景音乐播放功能
        console.log('选择背景音乐:', musicType);

        // 可以在这里添加实际的背景音乐播放逻辑
        // 例如：生成不同的背景音乐或加载预设音乐
        if (musicType === 'none') {
            // 停止背景音乐
            if (this.backgroundMusicSource) {
                this.backgroundMusicSource.stop();
                this.backgroundMusicSource = null;
            }
        } else {
            // 这里可以添加生成或播放背景音乐的逻辑
            // 例如：根据 musicType 生成不同的背景音乐
        }
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new RhythmApp();
});

