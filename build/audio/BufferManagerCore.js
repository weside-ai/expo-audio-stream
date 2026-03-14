import { EncodingTypes } from "../types";
import { FrameProcessor } from "./FrameProcessor";
import { QualityMonitor } from "./QualityMonitor";
import { RingBuffer } from "./RingBuffer";
import ExpoPlayAudioStreamModule from "../ExpoPlayAudioStreamModule";
export class AudioBufferManager {
    static _bufferCheckIntervalMs = 50;
    static _defaultRingBufferCapacity = 150; // ~3 seconds at 20ms/frame
    _buffer;
    _config;
    _frameProcessor;
    _qualityMonitor;
    _playbackTimer = null;
    _isActive = false;
    _lastPlaybackTime = 0;
    _nextSequenceNumber = 0;
    _currentTurnId = null;
    _encoding = EncodingTypes.PCM_S16LE;
    constructor(config) {
        this._config = {
            targetBufferMs: 240,
            minBufferMs: 120,
            maxBufferMs: 480,
            frameIntervalMs: 20,
            sampleRate: 16000,
            ...config,
        };
        // Calculate ring buffer capacity based on max buffer size and frame interval
        // Add 50% headroom for safety
        const estimatedMaxFrames = Math.ceil((this._config.maxBufferMs / this._config.frameIntervalMs) * 1.5);
        this._buffer = new RingBuffer(Math.max(estimatedMaxFrames, AudioBufferManager._defaultRingBufferCapacity));
        this._frameProcessor = new FrameProcessor(this._config.frameIntervalMs, this._config.sampleRate ?? 16000, this._getBytesPerSample());
        this._qualityMonitor = new QualityMonitor(this._config.frameIntervalMs);
    }
    /** Set the turn ID for queue management integration */
    setTurnId(turnId) {
        this._currentTurnId = turnId;
    }
    /** Set the audio encoding format */
    setEncoding(encoding) {
        this._encoding = encoding;
        if (this._frameProcessor) {
            this._frameProcessor.setBytesPerSample(this._getBytesPerSample());
        }
    }
    enqueueFrames(audioData) {
        if (!this._frameProcessor || !this._qualityMonitor) {
            return;
        }
        const frames = this._frameProcessor.parseChunk(audioData);
        for (const frame of frames) {
            // RingBuffer.push handles overrun internally by overwriting oldest
            this._buffer.push(frame);
            this._qualityMonitor.recordFrameArrival(frame.timestamp);
        }
        const currentBufferMs = this.getCurrentBufferMs();
        this._qualityMonitor.updateBufferLevel(currentBufferMs);
        if (currentBufferMs > this._config.maxBufferMs) {
            this._handleOverrun();
        }
    }
    startPlayback() {
        if (this._isActive) {
            return;
        }
        this._isActive = true;
        this._lastPlaybackTime = Date.now();
        const initialWaitMs = Math.min(this._config.targetBufferMs, 200);
        this._waitForBufferFill(initialWaitMs).then(() => {
            if (this._isActive) {
                this._startPlaybackLoop();
            }
        });
    }
    stopPlayback() {
        this._isActive = false;
        if (this._playbackTimer) {
            clearTimeout(this._playbackTimer);
            this._playbackTimer = null;
        }
        this._buffer.clear();
        this._nextSequenceNumber = 0;
        if (this._frameProcessor) {
            this._frameProcessor.reset();
        }
    }
    isPlaying() {
        return this._isActive;
    }
    getHealthMetrics() {
        if (!this._qualityMonitor) {
            return {
                currentBufferMs: this.getCurrentBufferMs(),
                targetBufferMs: this._config.targetBufferMs,
                underrunCount: 0,
                overrunCount: 0,
                averageJitter: 0,
                bufferHealthState: "idle",
                adaptiveAdjustmentsCount: 0,
            };
        }
        const metrics = this._qualityMonitor.getMetrics();
        metrics.currentBufferMs = this.getCurrentBufferMs();
        metrics.bufferHealthState = this._qualityMonitor.getBufferHealthState(this._isActive, 0);
        return metrics;
    }
    updateConfig(config) {
        this._config = { ...this._config, ...config };
    }
    applyAdaptiveAdjustments() {
        if (!this._qualityMonitor) {
            return;
        }
        const adjustment = this._qualityMonitor.getRecommendedAdjustment();
        if (adjustment !== 0) {
            const newTargetMs = Math.max(this._config.minBufferMs, Math.min(this._config.maxBufferMs, this._config.targetBufferMs + adjustment));
            if (newTargetMs !== this._config.targetBufferMs) {
                this.updateConfig({ targetBufferMs: newTargetMs });
            }
        }
    }
    destroy() {
        this.stopPlayback();
        this._buffer.clear();
        this._nextSequenceNumber = 0;
        this._qualityMonitor = null;
        this._frameProcessor = null;
    }
    getCurrentBufferMs() {
        return this._buffer.getTotalDurationMs();
    }
    _startPlaybackLoop() {
        if (!this._isActive)
            return;
        const currentBufferMs = this.getCurrentBufferMs();
        if (this._qualityMonitor) {
            this._qualityMonitor.updateBufferLevel(currentBufferMs);
        }
        try {
            if (currentBufferMs < this._config.minBufferMs) {
                this._handleUnderrun();
            }
            else {
                this._scheduleNextFrames();
            }
        }
        catch {
            /* no-op */
        }
        const nextInterval = this._calculateNextInterval();
        this._playbackTimer = setTimeout(() => this._startPlaybackLoop(), nextInterval);
    }
    _scheduleNextFrames() {
        const currentBufferMs = this.getCurrentBufferMs();
        let maxScheduledFrames = 2;
        if (currentBufferMs > this._config.targetBufferMs) {
            maxScheduledFrames = 3;
        }
        else if (currentBufferMs < this._config.minBufferMs * 1.5) {
            maxScheduledFrames = 1;
        }
        let scheduledCount = 0;
        while (!this._buffer.isEmpty && scheduledCount < maxScheduledFrames) {
            this._playNextFrame();
            scheduledCount++;
        }
    }
    _playNextFrame() {
        const frame = this._buffer.shift();
        if (!frame) {
            return;
        }
        try {
            // Use the turnId with sequence number suffix for individual frames
            const playbackId = this._currentTurnId
                ? `${this._currentTurnId}-frame-${frame.sequenceNumber}`
                : `buffered-frame-${frame.sequenceNumber}`;
            ExpoPlayAudioStreamModule.playSound(frame.data.audioData, playbackId, this._encoding);
            this._lastPlaybackTime = Date.now();
        }
        catch {
            /* no-op */
        }
    }
    /**
     * Returns buffer utilization percentage for monitoring
     */
    getBufferUtilization() {
        return this._buffer.getUtilization();
    }
    _handleUnderrun() {
        if (this._qualityMonitor) {
            this._qualityMonitor.recordUnderrun();
        }
        this._insertSilenceFrame();
    }
    _handleOverrun() {
        if (this._qualityMonitor) {
            this._qualityMonitor.recordOverrun();
        }
        const excessMs = this.getCurrentBufferMs() - this._config.maxBufferMs;
        if (excessMs > 100) {
            const framesToDrop = Math.floor(excessMs / this._config.frameIntervalMs);
            this._buffer.dropOldest(framesToDrop);
        }
    }
    _getBytesPerSample() {
        if (this._encoding === EncodingTypes.PCM_F32LE) {
            return 4;
        }
        return 2; // Default to 16-bit (2 bytes)
    }
    _insertSilenceFrame() {
        const samplesNeeded = Math.floor((this._config.frameIntervalMs * (this._config.sampleRate ?? 16000)) / 1000);
        const bytesNeeded = samplesNeeded * this._getBytesPerSample();
        const silenceBuffer = new ArrayBuffer(bytesNeeded);
        const silenceBase64 = this._arrayBufferToBase64(silenceBuffer);
        const silenceFrame = {
            sequenceNumber: this._nextSequenceNumber++,
            data: {
                audioData: silenceBase64,
                isFirst: false,
                isFinal: false,
            },
            duration: this._config.frameIntervalMs,
            timestamp: Date.now(),
        };
        // RingBuffer.unshift adds at the front
        this._buffer.unshift(silenceFrame);
    }
    _arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binaryString = "";
        for (let i = 0; i < bytes.length; i++) {
            binaryString += String.fromCharCode(bytes[i]);
        }
        if (typeof btoa !== "undefined") {
            return btoa(binaryString);
        }
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let result = "";
        let i = 0;
        while (i < binaryString.length) {
            const a = binaryString.charCodeAt(i++);
            const b = i < binaryString.length ? binaryString.charCodeAt(i++) : 0;
            const c = i < binaryString.length ? binaryString.charCodeAt(i++) : 0;
            const bitmap = (a << 16) | (b << 8) | c;
            result += chars.charAt((bitmap >> 18) & 63);
            result += chars.charAt((bitmap >> 12) & 63);
            result += chars.charAt((bitmap >> 6) & 63);
            result += chars.charAt(bitmap & 63);
        }
        const padding = (3 - (binaryString.length % 3)) % 3;
        let finalResult = result.slice(0, result.length - padding);
        for (let j = 0; j < padding; j++) {
            finalResult += "=";
        }
        return finalResult;
    }
    _calculateNextInterval() {
        const expectedTime = this._lastPlaybackTime + this._config.frameIntervalMs;
        const currentTime = Date.now();
        const drift = currentTime - expectedTime;
        return Math.max(1, this._config.frameIntervalMs - drift);
    }
    _waitForBufferFill(targetMs) {
        const self = this;
        return {
            then: function (onResolve) {
                const checkBuffer = () => {
                    if (self.getCurrentBufferMs() >= targetMs || !self._isActive) {
                        onResolve();
                        return;
                    }
                    setTimeout(checkBuffer, AudioBufferManager._bufferCheckIntervalMs);
                };
                checkBuffer();
            },
        };
    }
}
//# sourceMappingURL=BufferManagerCore.js.map