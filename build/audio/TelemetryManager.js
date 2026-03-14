/**
 * Production telemetry manager for audio stream performance monitoring.
 * Tracks key metrics for debugging, monitoring, and optimization.
 */
export class TelemetryManager {
    _sessionId;
    _chunksPlayed = 0;
    _chunksDropped = 0;
    _bufferUnderruns = 0;
    _bufferOverruns = 0;
    _latencyHistory = [];
    _peakLatencyMs = 0;
    _jitterHistory = [];
    _playbackStartTime = 0;
    _totalPlaybackDurationMs = 0;
    _streamRestarts = 0;
    _bufferHealthState = 'idle';
    _lastUpdatedAt = 0;
    _callback = null;
    _reportIntervalId = null;
    static MAX_HISTORY_SIZE = 100;
    static DEFAULT_REPORT_INTERVAL_MS = 5000;
    constructor(sessionId) {
        this._sessionId = sessionId || this._generateSessionId();
        this._lastUpdatedAt = Date.now();
    }
    /**
     * Generates a unique session ID
     */
    _generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
    /**
     * Records a successful chunk playback
     */
    recordChunkPlayed(latencyMs) {
        this._chunksPlayed++;
        this._recordLatency(latencyMs);
        this._lastUpdatedAt = Date.now();
    }
    /**
     * Records a dropped chunk
     */
    recordChunkDropped() {
        this._chunksDropped++;
        this._lastUpdatedAt = Date.now();
    }
    /**
     * Records a buffer underrun event
     */
    recordUnderrun() {
        this._bufferUnderruns++;
        this._lastUpdatedAt = Date.now();
    }
    /**
     * Records a buffer overrun event
     */
    recordOverrun() {
        this._bufferOverruns++;
        this._lastUpdatedAt = Date.now();
    }
    /**
     * Records latency measurement
     */
    _recordLatency(latencyMs) {
        this._latencyHistory.push(latencyMs);
        if (this._latencyHistory.length > TelemetryManager.MAX_HISTORY_SIZE) {
            this._latencyHistory.shift();
        }
        if (latencyMs > this._peakLatencyMs) {
            this._peakLatencyMs = latencyMs;
        }
    }
    /**
     * Records jitter measurement
     */
    recordJitter(jitterMs) {
        this._jitterHistory.push(jitterMs);
        if (this._jitterHistory.length > TelemetryManager.MAX_HISTORY_SIZE) {
            this._jitterHistory.shift();
        }
        this._lastUpdatedAt = Date.now();
    }
    /**
     * Records playback start
     */
    recordPlaybackStart() {
        this._playbackStartTime = Date.now();
        this._lastUpdatedAt = Date.now();
    }
    /**
     * Records playback stop and calculates duration
     */
    recordPlaybackStop() {
        if (this._playbackStartTime > 0) {
            this._totalPlaybackDurationMs += Date.now() - this._playbackStartTime;
            this._playbackStartTime = 0;
        }
        this._lastUpdatedAt = Date.now();
    }
    /**
     * Records a stream restart
     */
    recordStreamRestart() {
        this._streamRestarts++;
        this._lastUpdatedAt = Date.now();
    }
    /**
     * Updates buffer health state
     */
    updateBufferHealthState(state) {
        this._bufferHealthState = state;
        this._lastUpdatedAt = Date.now();
    }
    /**
     * Gets current telemetry snapshot
     */
    getTelemetry() {
        const avgLatency = this._calculateAverage(this._latencyHistory);
        const avgJitter = this._calculateAverage(this._jitterHistory);
        // Include current playback duration if still playing
        let totalDuration = this._totalPlaybackDurationMs;
        if (this._playbackStartTime > 0) {
            totalDuration += Date.now() - this._playbackStartTime;
        }
        return {
            sessionId: this._sessionId,
            chunksPlayed: this._chunksPlayed,
            chunksDropped: this._chunksDropped,
            bufferUnderruns: this._bufferUnderruns,
            bufferOverruns: this._bufferOverruns,
            averageLatencyMs: Math.round(avgLatency * 100) / 100,
            peakLatencyMs: this._peakLatencyMs,
            averageJitterMs: Math.round(avgJitter * 100) / 100,
            totalPlaybackDurationMs: totalDuration,
            streamRestarts: this._streamRestarts,
            bufferHealthState: this._bufferHealthState,
            lastUpdatedAt: this._lastUpdatedAt,
        };
    }
    /**
     * Calculates average of a number array
     */
    _calculateAverage(values) {
        if (values.length === 0)
            return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    /**
     * Starts periodic telemetry reporting
     */
    startReporting(callback, intervalMs = TelemetryManager.DEFAULT_REPORT_INTERVAL_MS) {
        this._callback = callback;
        this.stopReporting(); // Clear any existing interval
        this._reportIntervalId = setInterval(() => {
            if (this._callback) {
                this._callback(this.getTelemetry());
            }
        }, intervalMs);
    }
    /**
     * Stops periodic telemetry reporting
     */
    stopReporting() {
        if (this._reportIntervalId) {
            clearInterval(this._reportIntervalId);
            this._reportIntervalId = null;
        }
    }
    /**
     * Resets all telemetry data
     */
    reset() {
        this._chunksPlayed = 0;
        this._chunksDropped = 0;
        this._bufferUnderruns = 0;
        this._bufferOverruns = 0;
        this._latencyHistory = [];
        this._peakLatencyMs = 0;
        this._jitterHistory = [];
        this._playbackStartTime = 0;
        this._totalPlaybackDurationMs = 0;
        this._streamRestarts = 0;
        this._bufferHealthState = 'idle';
        this._lastUpdatedAt = Date.now();
    }
    /**
     * Cleans up resources
     */
    destroy() {
        this.stopReporting();
        this._callback = null;
    }
    /**
     * Gets a summary string for logging
     */
    getSummary() {
        const t = this.getTelemetry();
        const dropRate = t.chunksPlayed > 0
            ? ((t.chunksDropped / (t.chunksPlayed + t.chunksDropped)) * 100).toFixed(1)
            : '0';
        return `[Telemetry] Played: ${t.chunksPlayed}, Dropped: ${t.chunksDropped} (${dropRate}%), ` +
            `Underruns: ${t.bufferUnderruns}, Avg Latency: ${t.averageLatencyMs}ms, ` +
            `Peak: ${t.peakLatencyMs}ms, Jitter: ${t.averageJitterMs}ms, ` +
            `Health: ${t.bufferHealthState}`;
    }
}
//# sourceMappingURL=TelemetryManager.js.map