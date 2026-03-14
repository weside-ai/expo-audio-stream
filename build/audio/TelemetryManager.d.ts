import { IAudioTelemetry, BufferHealthState, TelemetryCallback } from '../types';
/**
 * Production telemetry manager for audio stream performance monitoring.
 * Tracks key metrics for debugging, monitoring, and optimization.
 */
export declare class TelemetryManager {
    private _sessionId;
    private _chunksPlayed;
    private _chunksDropped;
    private _bufferUnderruns;
    private _bufferOverruns;
    private _latencyHistory;
    private _peakLatencyMs;
    private _jitterHistory;
    private _playbackStartTime;
    private _totalPlaybackDurationMs;
    private _streamRestarts;
    private _bufferHealthState;
    private _lastUpdatedAt;
    private _callback;
    private _reportIntervalId;
    private static readonly MAX_HISTORY_SIZE;
    private static readonly DEFAULT_REPORT_INTERVAL_MS;
    constructor(sessionId?: string);
    /**
     * Generates a unique session ID
     */
    private _generateSessionId;
    /**
     * Records a successful chunk playback
     */
    recordChunkPlayed(latencyMs: number): void;
    /**
     * Records a dropped chunk
     */
    recordChunkDropped(): void;
    /**
     * Records a buffer underrun event
     */
    recordUnderrun(): void;
    /**
     * Records a buffer overrun event
     */
    recordOverrun(): void;
    /**
     * Records latency measurement
     */
    private _recordLatency;
    /**
     * Records jitter measurement
     */
    recordJitter(jitterMs: number): void;
    /**
     * Records playback start
     */
    recordPlaybackStart(): void;
    /**
     * Records playback stop and calculates duration
     */
    recordPlaybackStop(): void;
    /**
     * Records a stream restart
     */
    recordStreamRestart(): void;
    /**
     * Updates buffer health state
     */
    updateBufferHealthState(state: BufferHealthState): void;
    /**
     * Gets current telemetry snapshot
     */
    getTelemetry(): IAudioTelemetry;
    /**
     * Calculates average of a number array
     */
    private _calculateAverage;
    /**
     * Starts periodic telemetry reporting
     */
    startReporting(callback: TelemetryCallback, intervalMs?: number): void;
    /**
     * Stops periodic telemetry reporting
     */
    stopReporting(): void;
    /**
     * Resets all telemetry data
     */
    reset(): void;
    /**
     * Cleans up resources
     */
    destroy(): void;
    /**
     * Gets a summary string for logging
     */
    getSummary(): string;
}
//# sourceMappingURL=TelemetryManager.d.ts.map