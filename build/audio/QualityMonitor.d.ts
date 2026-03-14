import { IQualityMonitor, IBufferHealthMetrics, BufferHealthState } from '../types';
/**
 * Monitors buffer health, network jitter, and provides adaptive recommendations.
 * Tracks arrival patterns, underruns, overruns, and buffer level trends.
 */
export declare class QualityMonitor implements IQualityMonitor {
    private static readonly _maxHistorySize;
    private static readonly _jitterSmoothingFactor;
    private _frameIntervalMs;
    private _arrivalHistory;
    private _underrunCount;
    private _overrunCount;
    private _averageJitter;
    private _lastArrivalTime;
    private _adaptiveAdjustmentsCount;
    private _bufferLevelHistory;
    private _lastBufferLevel;
    constructor(frameIntervalMs?: number);
    /** Record frame arrival time and update jitter estimation. */
    recordFrameArrival(timestamp: number): void;
    /** Record buffer underrun event. */
    recordUnderrun(): void;
    /** Record buffer overrun event. */
    recordOverrun(): void;
    /** Update current buffer level for trend analysis. */
    updateBufferLevel(bufferMs: number): void;
    /** Get comprehensive quality and buffer metrics. */
    getMetrics(): IBufferHealthMetrics;
    /** Analyze buffer health based on current state and performance. */
    getBufferHealthState(isPlaying: boolean, currentLatencyMs: number): BufferHealthState;
    /** Recommend buffer size adjustment based on recent performance. */
    getRecommendedAdjustment(): number;
    /** Reset all metrics (on stream restart). */
    reset(): void;
    /** Count recent events (underruns/overruns) in a sliding window. */
    private _getRecentEventCount;
    /** Analyze buffer level trend from recent history. */
    private _getBufferTrend;
}
//# sourceMappingURL=QualityMonitor.d.ts.map