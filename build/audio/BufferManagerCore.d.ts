import { Encoding } from "../types";
import { IAudioBufferConfig, IAudioBufferManager, IAudioPlayPayload, IBufferHealthMetrics } from "../types";
export declare class AudioBufferManager implements IAudioBufferManager {
    private static readonly _bufferCheckIntervalMs;
    private static readonly _defaultRingBufferCapacity;
    private _buffer;
    private _config;
    private _frameProcessor;
    private _qualityMonitor;
    private _playbackTimer;
    private _isActive;
    private _lastPlaybackTime;
    private _nextSequenceNumber;
    private _currentTurnId;
    private _encoding;
    constructor(config?: Partial<IAudioBufferConfig>);
    /** Set the turn ID for queue management integration */
    setTurnId(turnId: string): void;
    /** Set the audio encoding format */
    setEncoding(encoding: Encoding): void;
    enqueueFrames(audioData: IAudioPlayPayload): void;
    startPlayback(): void;
    stopPlayback(): void;
    isPlaying(): boolean;
    getHealthMetrics(): IBufferHealthMetrics;
    updateConfig(config: Partial<IAudioBufferConfig>): void;
    applyAdaptiveAdjustments(): void;
    destroy(): void;
    getCurrentBufferMs(): number;
    private _startPlaybackLoop;
    private _scheduleNextFrames;
    private _playNextFrame;
    /**
     * Returns buffer utilization percentage for monitoring
     */
    getBufferUtilization(): number;
    private _handleUnderrun;
    private _handleOverrun;
    private _getBytesPerSample;
    private _insertSilenceFrame;
    private _arrayBufferToBase64;
    private _calculateNextInterval;
    private _waitForBufferFill;
}
//# sourceMappingURL=BufferManagerCore.d.ts.map