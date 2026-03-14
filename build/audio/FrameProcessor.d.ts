import { IAudioPlayPayload, IAudioFrame, IFrameProcessor } from '../types';
/**
 * Processes PCM audio chunks into timestamped frames.
 * Supports both base64 strings and binary data (Uint8Array/ArrayBuffer) for JSI optimization.
 * Validates input, sanitizes data, estimates duration.
 */
export declare class FrameProcessor implements IFrameProcessor {
    private static readonly _maxReasonableChunkSizeBytes;
    private static readonly _validBase64Regex;
    private _sequenceNumber;
    private _frameIntervalMs;
    private _sampleRate;
    private _bytesPerSample;
    constructor(frameIntervalMs?: number, sampleRate?: number, bytesPerSample?: number);
    setBytesPerSample(bytes: number): void;
    /** Parse an audio payload into timestamped frames with validation. */
    parseChunk(payload: IAudioPlayPayload): IAudioFrame[];
    /** Reset sequence numbering (on stream restart). */
    reset(): void;
    /**
     * Normalizes audio data to base64 string format.
     * Supports: string (base64), Uint8Array, ArrayBuffer
     */
    private _normalizeAudioData;
    /**
     * Converts binary data to base64 string.
     * Optimized for performance with batched character conversion.
     */
    private _binaryToBase64;
    /**
     * Gets the byte size of audio data regardless of format.
     */
    private _getByteSize;
    /** Validate payload structure and content. */
    private _isValidPayload;
    /** Clean and validate base64 string. */
    private _sanitizeBase64;
    /** Estimate frame duration from base64 PCM data. */
    private _calculateDuration;
}
//# sourceMappingURL=FrameProcessor.d.ts.map