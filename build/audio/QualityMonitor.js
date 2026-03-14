/**
 * Monitors buffer health, network jitter, and provides adaptive recommendations.
 * Tracks arrival patterns, underruns, overruns, and buffer level trends.
 */
export class QualityMonitor {
    static _maxHistorySize = 100; // Keep last N arrival times
    static _jitterSmoothingFactor = 0.1; // EMA smoothing for jitter
    _frameIntervalMs;
    _arrivalHistory = [];
    _underrunCount = 0;
    _overrunCount = 0;
    _averageJitter = 0;
    _lastArrivalTime = 0;
    _adaptiveAdjustmentsCount = 0;
    _bufferLevelHistory = [];
    _lastBufferLevel = 0;
    constructor(frameIntervalMs = 20) {
        this._frameIntervalMs = frameIntervalMs;
    }
    /** Record frame arrival time and update jitter estimation. */
    recordFrameArrival(timestamp) {
        this._arrivalHistory.push(timestamp);
        // Trim history if needed
        if (this._arrivalHistory.length >
            QualityMonitor._maxHistorySize) {
            this._arrivalHistory.shift();
        }
        // Calculate jitter if we have previous arrival
        if (this._lastArrivalTime > 0) {
            const actualInterval = timestamp - this._lastArrivalTime;
            const jitter = Math.abs(actualInterval - this._frameIntervalMs);
            // Exponential moving average for smooth jitter tracking
            this._averageJitter =
                this._averageJitter *
                    (1 - QualityMonitor._jitterSmoothingFactor) +
                    jitter * QualityMonitor._jitterSmoothingFactor;
        }
        this._lastArrivalTime = timestamp;
    }
    /** Record buffer underrun event. */
    recordUnderrun() {
        this._underrunCount++;
    }
    /** Record buffer overrun event. */
    recordOverrun() {
        this._overrunCount++;
    }
    /** Update current buffer level for trend analysis. */
    updateBufferLevel(bufferMs) {
        this._bufferLevelHistory.push(bufferMs);
        // Keep reasonable history size
        if (this._bufferLevelHistory.length >
            QualityMonitor._maxHistorySize) {
            this._bufferLevelHistory.shift();
        }
        this._lastBufferLevel = bufferMs;
    }
    /** Get comprehensive quality and buffer metrics. */
    getMetrics() {
        return {
            currentBufferMs: this._lastBufferLevel,
            targetBufferMs: 0, // Will be set by caller
            underrunCount: this._underrunCount,
            overrunCount: this._overrunCount,
            averageJitter: Math.round(this._averageJitter * 100) / 100, // 2 decimal places
            bufferHealthState: 'idle', // Will be calculated by caller
            adaptiveAdjustmentsCount: this._adaptiveAdjustmentsCount,
        };
    }
    /** Analyze buffer health based on current state and performance. */
    getBufferHealthState(isPlaying, currentLatencyMs) {
        if (!isPlaying) {
            return 'idle';
        }
        // Check for critical conditions first
        if (this._lastBufferLevel < 50) {
            // Less than 50ms is critical
            return 'critical';
        }
        // Recent problems indicate degraded state
        const recentUnderruns = this._getRecentEventCount('underrun');
        const recentOverruns = this._getRecentEventCount('overrun');
        if (recentUnderruns > 2 || recentOverruns > 3) {
            return 'degraded';
        }
        // High jitter indicates potential issues
        if (this._averageJitter > this._frameIntervalMs * 0.5) {
            return 'degraded';
        }
        // Buffer level trending analysis
        const bufferTrend = this._getBufferTrend();
        if (bufferTrend === 'declining' &&
            this._lastBufferLevel < 150) {
            return 'degraded';
        }
        // Otherwise healthy
        return 'healthy';
    }
    /** Recommend buffer size adjustment based on recent performance. */
    getRecommendedAdjustment() {
        // No adjustment if insufficient data
        if (this._arrivalHistory.length < 10) {
            return 0;
        }
        let adjustmentMs = 0;
        // Adjust based on underrun/overrun patterns
        const recentUnderruns = this._getRecentEventCount('underrun');
        const recentOverruns = this._getRecentEventCount('overrun');
        if (recentUnderruns > 1) {
            // Increase buffer for underruns
            adjustmentMs += Math.min(60, recentUnderruns * 20);
        }
        if (recentOverruns > 2) {
            // Decrease buffer for overruns (be more conservative)
            adjustmentMs -= Math.min(40, recentOverruns * 10);
        }
        // Adjust based on jitter
        if (this._averageJitter > this._frameIntervalMs) {
            adjustmentMs += 20; // Add buffer for high jitter
        }
        else if (this._averageJitter <
            this._frameIntervalMs * 0.2) {
            adjustmentMs -= 10; // Reduce buffer for very stable network
        }
        // Track adjustments
        if (adjustmentMs !== 0) {
            this._adaptiveAdjustmentsCount++;
        }
        return adjustmentMs;
    }
    /** Reset all metrics (on stream restart). */
    reset() {
        this._arrivalHistory.length = 0;
        this._bufferLevelHistory.length = 0;
        this._underrunCount = 0;
        this._overrunCount = 0;
        this._averageJitter = 0;
        this._lastArrivalTime = 0;
        this._adaptiveAdjustmentsCount = 0;
        this._lastBufferLevel = 0;
    }
    /** Count recent events (underruns/overruns) in a sliding window. */
    _getRecentEventCount(eventType) {
        // For simplicity, we'll estimate based on total counts and history size
        // In a full implementation, you'd track timestamps of each event
        const totalEvents = eventType === 'underrun'
            ? this._underrunCount
            : this._overrunCount;
        const historySize = this._arrivalHistory.length;
        if (historySize < 20) {
            return totalEvents; // Not enough history, return total
        }
        // Estimate recent events as a fraction of total based on recent activity
        const recentFraction = Math.min(20, historySize) / 100; // Last 20% of history
        return Math.ceil(totalEvents * recentFraction);
    }
    /** Analyze buffer level trend from recent history. */
    _getBufferTrend() {
        if (this._bufferLevelHistory.length < 10) {
            return 'stable';
        }
        // Take last 10 samples
        const recent = this._bufferLevelHistory.slice(-10);
        const firstHalf = recent.slice(0, 5);
        const secondHalf = recent.slice(5);
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) /
            firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) /
            secondHalf.length;
        const difference = secondAvg - firstAvg;
        const threshold = this._frameIntervalMs; // Use frame interval as threshold
        if (difference > threshold) {
            return 'increasing';
        }
        else if (difference < -threshold) {
            return 'declining';
        }
        else {
            return 'stable';
        }
    }
}
//# sourceMappingURL=QualityMonitor.js.map