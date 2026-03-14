import { IAudioBufferConfig, IAudioPlayPayload, NetworkConditions, SmartBufferConfig, IBufferHealthMetrics, Encoding, IAudioBufferManager } from "../types";
/**
 * Smart buffering manager that automatically adapts to network conditions
 */
export declare class BufferManagerAdaptive implements IAudioBufferManager {
    private _mode;
    private _bufferManager;
    private _networkMonitor;
    private _isBufferingEnabled;
    private _networkConditions;
    private _adaptiveThresholds;
    private _turnId;
    private _encoding;
    private _sampleRate;
    private _lastDecisionTime;
    private _consecutiveProblems;
    constructor(config: SmartBufferConfig, turnId: string, encoding?: Encoding);
    enqueueFrames(audioData: IAudioPlayPayload): void;
    startPlayback(): void;
    stopPlayback(): void;
    destroy(): void;
    isPlaying(): boolean;
    updateConfig(config: Partial<IAudioBufferConfig>): void;
    applyAdaptiveAdjustments(): void;
    getCurrentBufferMs(): number;
    /**
     * Process an audio chunk, automatically deciding whether to buffer or play directly
     */
    private _processAudioChunk;
    /**
     * Update network conditions from quality monitor and external sources
     */
    private _updateNetworkConditions;
    /**
     * Evaluate whether buffering should be enabled based on current conditions and mode
     */
    private _evaluateBufferingNeed;
    private _shouldBufferConservative;
    private _shouldBufferBalanced;
    private _shouldBufferAggressive;
    private _shouldBufferAdaptive;
    /**
     * Initialize buffering with appropriate configuration
     */
    private _initializeBuffering;
    /**
     * Disable buffering and clean up
     */
    private _disableBuffering;
    /**
     * Get appropriate buffer configuration based on network conditions
     */
    private _getBufferConfigForConditions;
    /**
     * Update network conditions externally (e.g., from network monitoring)
     */
    updateNetworkConditions(conditions: Partial<NetworkConditions>): void;
    /**
     * Get current buffer health metrics
     */
    getHealthMetrics(): IBufferHealthMetrics;
    /**
     * Check if buffering is currently enabled
     */
    isBufferingEnabled(): boolean;
}
//# sourceMappingURL=BufferManagerAdaptive.d.ts.map