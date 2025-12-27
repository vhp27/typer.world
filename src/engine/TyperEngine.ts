import type { StatsCallback, KeyCallback, KeyStat } from '../types';

export type { StatsCallback, KeyCallback, KeyStat };

interface CharNode {
    dom: HTMLElement;
    char: string;
    status: 'pending' | 'correct' | 'incorrect';
}

export class TyperEngine {
    private container: HTMLElement;
    private charNodes: CharNode[] = [];
    private currentIndex: number = 0;
    private startTime: number | null = null;
    private errors: number = 0;
    private correct: number = 0;
    private caret: HTMLElement;
    private onStatsUpdate: StatsCallback | null = null;
    private onKeyUpdate: KeyCallback[] = [];
    private isActive: boolean = false;
    private timeLimit: number = 0;
    private wordLimit: number = 0;
    private timerInterval: ReturnType<typeof setInterval> | null = null;
    private keyStats: Record<string, KeyStat> = {};
    private lastKeyTime: number | null = null;
    private wordsTyped: number = 0;
    private stopOnError: boolean = false;
    private forgiveErrors: boolean = false;
    private remainingTime: number | null = null;

    // Pause support
    private isPaused: boolean = false;
    private pausedAt: number | null = null;
    private totalPausedTime: number = 0;

    constructor(container: HTMLElement) {
        this.container = container;
        this.caret = document.createElement('div');
        this.caret.id = 'caret';
    }

    public subscribe(statsCallback: StatsCallback) {
        this.onStatsUpdate = statsCallback;
    }

    public addKeyListener(callback: KeyCallback) {
        this.onKeyUpdate.push(callback);
    }

    public removeKeyListener(callback: KeyCallback) {
        this.onKeyUpdate = this.onKeyUpdate.filter(cb => cb !== callback);
    }

    public setTimeLimit(seconds: number) {
        this.timeLimit = seconds;
    }

    public setWordLimit(words: number) {
        this.wordLimit = words;
    }

    public setStopOnError(enabled: boolean) {
        this.stopOnError = enabled;
    }

    public setForgiveErrors(enabled: boolean) {
        this.forgiveErrors = enabled;
    }

    public loadTest(text: string) {
        if (!this.container) {
            console.error('TyperEngine: Container not available');
            return;
        }
        this.reset();

        const words = text.split(' ');
        const fragment = document.createDocumentFragment();

        fragment.appendChild(this.caret);

        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('div');
            wordSpan.className = 'word';

            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const span = document.createElement('span');
                span.className = 'letter';
                span.textContent = char;

                this.charNodes.push({
                    dom: span,
                    char: char,
                    status: 'pending'
                });
                wordSpan.appendChild(span);
            }

            if (wordIndex < words.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.className = 'letter';
                spaceSpan.innerHTML = '&nbsp;';

                this.charNodes.push({
                    dom: spaceSpan,
                    char: ' ',
                    status: 'pending'
                });
                wordSpan.appendChild(spaceSpan);
            }

            fragment.appendChild(wordSpan);
        });

        this.container.innerHTML = '';
        this.container.appendChild(fragment);
        this.container.scrollTop = 0;
        this.updateCaret();
    }

    public handleInput(key: string) {
        // Resume if paused
        if (this.isPaused) {
            this.resume();
        }

        if (!this.isActive) {
            this.start();
        }

        if (key === 'Backspace') {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                const node = this.charNodes[this.currentIndex];

                // If we're backspacing over a space, decrement word count
                if (node.char === ' ' && node.status !== 'pending') {
                    this.wordsTyped = Math.max(0, this.wordsTyped - 1);
                }

                // Adjust stats
                if (node.status === 'correct') {
                    this.correct = Math.max(0, this.correct - 1);
                } else if (node.status === 'incorrect') {
                    this.errors = Math.max(0, this.errors - 1);
                }

                node.status = 'pending';
                node.dom.className = 'letter';
                this.updateCaret();
                this.emitStats();
            }
            return;
        }

        if (key.length === 1) {
            if (this.currentIndex >= this.charNodes.length) return;

            const node = this.charNodes[this.currentIndex];
            if (!node || !node.dom) return;
            const now = performance.now();

            const expectedChar = node.char;
            if (!this.keyStats[expectedChar]) {
                this.keyStats[expectedChar] = { total: 0, errors: 0, speedSum: 0, count: 0 };
            }
            this.keyStats[expectedChar].total++;

            if (this.lastKeyTime) {
                const duration = now - this.lastKeyTime;
                if (duration < 2000) {
                    this.keyStats[expectedChar].speedSum += duration;
                    this.keyStats[expectedChar].count++;
                }
            }
            this.lastKeyTime = now;

            if (key === node.char) {
                // Correct key - clear any previous error state
                node.dom.classList.remove('incorrect');
                node.status = 'correct';
                node.dom.classList.add('correct');
                this.correct++;
                this.onKeyUpdate.forEach(cb => cb(key, 'correct'));

                // Track word completion
                if (key === ' ') {
                    this.wordsTyped++;
                }
                this.currentIndex++;
            } else {
                // Wrong key pressed
                if (this.forgiveErrors) {
                    // Auto-correct: treat as correct but still count error for stats
                    node.status = 'correct';
                    node.dom.classList.add('correct');
                    this.correct++;
                    this.errors++;
                    this.keyStats[expectedChar].errors++;
                    this.onKeyUpdate.forEach(cb => cb(key, 'incorrect'));
                    if (node.char === ' ') {
                        this.wordsTyped++;
                    }
                    this.currentIndex++;
                } else if (this.stopOnError) {
                    // Don't advance - user must type correct key
                    // Only count error once (when first hitting this position)
                    if (node.status !== 'incorrect') {
                        node.status = 'incorrect';
                        node.dom.classList.add('incorrect');
                        this.errors++;
                        this.keyStats[expectedChar].errors++;
                    }
                    this.onKeyUpdate.forEach(cb => cb(key, 'incorrect'));
                    // Don't increment currentIndex - cursor stays
                } else {
                    // Normal behavior - mark wrong and advance
                    node.status = 'incorrect';
                    node.dom.classList.add('incorrect');
                    this.errors++;
                    this.keyStats[expectedChar].errors++;
                    this.onKeyUpdate.forEach(cb => cb(key, 'incorrect'));
                    this.currentIndex++;
                }
            }

            this.updateCaret();

            // Check finish conditions
            const isTextComplete = this.currentIndex === this.charNodes.length;
            const isWordLimitReached = this.wordLimit > 0 && this.wordsTyped >= this.wordLimit;

            if (isTextComplete || isWordLimitReached) {
                this.finish();
            }

            this.emitStats();
        }
    }

    private start() {
        console.log('Engine Start');
        this.isActive = true;
        this.isPaused = false;
        this.startTime = performance.now();
        this.totalPausedTime = 0;

        if (this.timeLimit > 0) {
            // Clear any existing timer to prevent leaks
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }

            this.remainingTime = this.timeLimit;

            this.timerInterval = setInterval(() => {
                if (this.isPaused) return;

                const now = performance.now();
                const effectiveElapsed = (now - (this.startTime || now) - this.totalPausedTime) / 1000;
                const remaining = Math.max(0, Math.ceil(this.timeLimit - effectiveElapsed));
                this.remainingTime = remaining;

                this.emitStats(remaining);

                if (remaining <= 0) {
                    this.finish();
                }
            }, 100);
        }
    }

    public pause() {
        if (this.isActive && !this.isPaused) {
            this.isPaused = true;
            this.pausedAt = performance.now();
            console.log('Engine Paused');
            this.emitStatsPaused();
        }
    }

    public resume() {
        if (this.isActive && this.isPaused && this.pausedAt) {
            const pauseDuration = performance.now() - this.pausedAt;
            this.totalPausedTime += pauseDuration;
            this.isPaused = false;
            this.pausedAt = null;
            console.log('Engine Resumed, total paused:', this.totalPausedTime);
        }
    }

    public isPausedState(): boolean {
        return this.isPaused;
    }

    private updateCaret() {
        if (this.charNodes.length === 0) return;

        if (this.currentIndex < this.charNodes.length) {
            const charNode = this.charNodes[this.currentIndex];
            if (!charNode?.dom) return;

            const node = charNode.dom;
            const rect = node.offsetLeft ?? 0;
            const top = node.offsetTop ?? 0;
            this.caret.style.transform = `translate(${rect}px, ${top}px)`;

            // Auto-scroll: if current line is beyond first visible line, scroll up
            const lineHeight = node.offsetHeight || 40;
            if (top > lineHeight) {
                // Scroll to show current line at top
                this.container.scrollTop = top - lineHeight / 2;
            }
        } else {
            const lastCharNode = this.charNodes[this.charNodes.length - 1];
            if (!lastCharNode?.dom) return;

            const lastNode = lastCharNode.dom;
            const rect = (lastNode.offsetLeft ?? 0) + (lastNode.offsetWidth ?? 0);
            const top = lastNode.offsetTop ?? 0;
            this.caret.style.transform = `translate(${rect}px, ${top}px)`;
        }
    }

    private emitStats(timeLeft?: number) {
        if (!this.onStatsUpdate) return;

        const now = performance.now();
        const effectiveTime = (this.startTime ? (now - this.startTime - this.totalPausedTime) : 0);
        const durationMin = effectiveTime / 60000;

        const wpm = durationMin > 0 ? Math.round((this.correct / 5) / durationMin) : 0;
        const total = this.correct + this.errors;
        const accuracy = total > 0 ? Math.round((this.correct / total) * 100) : 100;

        this.onStatsUpdate({
            wpm,
            accuracy,
            correct: this.correct,
            errors: this.errors,
            timeLeft: timeLeft !== undefined ? timeLeft : (this.remainingTime !== null ? this.remainingTime : (this.timeLimit > 0 ? this.timeLimit : null)),
            keyStats: { ...this.keyStats },
            finished: false,
            paused: this.isPaused
        });
    }

    private emitStatsPaused() {
        if (!this.onStatsUpdate) return;

        this.onStatsUpdate({
            wpm: 0,
            accuracy: 100,
            correct: this.correct,
            errors: this.errors,
            timeLeft: this.remainingTime,
            keyStats: { ...this.keyStats },
            finished: false,
            paused: true
        });
    }

    public forceFinish() {
        if (this.isActive) {
            this.finish();
        }
    }

    private finish() {
        console.log('Engine Finish');
        this.isActive = false;
        this.isPaused = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        if (!this.onStatsUpdate) return;

        const now = performance.now();
        const effectiveTime = (this.startTime ? (now - this.startTime - this.totalPausedTime) : 0);
        const durationMin = effectiveTime / 60000;

        const wpm = durationMin > 0 ? Math.round((this.correct / 5) / durationMin) : 0;
        const total = this.correct + this.errors;
        const accuracy = total > 0 ? Math.round((this.correct / total) * 100) : 100;

        this.onStatsUpdate({
            wpm,
            accuracy,
            correct: this.correct,
            errors: this.errors,
            timeLeft: 0,
            keyStats: { ...this.keyStats },
            finished: true
        });
    }

    public reset() {
        console.log('Engine Reset');
        this.currentIndex = 0;
        this.charNodes = [];
        this.startTime = null;
        this.errors = 0;
        this.correct = 0;
        this.isActive = false;
        this.isPaused = false;
        this.pausedAt = null;
        this.totalPausedTime = 0;
        this.keyStats = {};
        this.lastKeyTime = null;
        this.wordsTyped = 0;
        this.remainingTime = null;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.container.innerHTML = '';
    }
}
