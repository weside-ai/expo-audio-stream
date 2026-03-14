import type { Subscription } from './events';
import { AudioDataEvent, AudioRecording, RecordingConfig, StartRecordingResult, SoundConfig, PlaybackMode, Encoding, EncodingTypes, PlaybackModes, IAudioBufferConfig, IAudioPlayPayload, IAudioFrame, BufferHealthState, IBufferHealthMetrics, IAudioBufferManager, IFrameProcessor, IQualityMonitor, BufferedStreamConfig, SmartBufferConfig, SmartBufferMode, NetworkConditions, AudioDataType, IAudioTelemetry, IRetryConfig, DEFAULT_RETRY_CONFIG, TelemetryCallback } from './types';
import { SoundChunkPlayedEventPayload, AudioEvents, DeviceReconnectedReason, DeviceReconnectedEventPayload } from './events';
declare const SuspendSoundEventTurnId = "suspend-sound-events";
export declare class ExpoPlayAudioStream {
    private static _bufferManagers;
    /**
     * Destroys the audio stream module, cleaning up all resources.
     * This should be called when the module is no longer needed.
     * It will reset all internal state and release audio resources.
     */
    static destroy(): void;
    /**
     * Starts microphone recording.
     * @param {RecordingConfig} recordingConfig - Configuration for the recording.
     * @returns {Promise<{recordingResult: StartRecordingResult, subscription: Subscription}>} A promise that resolves to an object containing the recording result and a subscription to audio events.
     * @throws {Error} If the recording fails to start.
     */
    static startRecording(recordingConfig: RecordingConfig): Promise<{
        recordingResult: StartRecordingResult;
        subscription?: Subscription;
    }>;
    /**
     * Stops the current microphone recording.
     * @returns {Promise<AudioRecording>} A promise that resolves to the audio recording data.
     * @throws {Error} If the recording fails to stop.
     */
    static stopRecording(): Promise<AudioRecording>;
    /**
     * Plays an audio chunk.
     * @param {string} base64Chunk - The base64 encoded audio chunk to play.
     * @param {string} turnId - The turn ID.
     * @param {string} [encoding] - The encoding format of the audio data ('pcm_f32le' or 'pcm_s16le').
     * @returns {Promise<void>}
     * @throws {Error} If the audio chunk fails to stream.
     */
    static playAudio(base64Chunk: string, turnId: string, encoding?: Encoding): Promise<void>;
    /**
     * Pauses the current audio playback.
     * @returns {Promise<void>}
     * @throws {Error} If the audio playback fails to pause.
     */
    static pauseAudio(): Promise<void>;
    /**
     * Stops the currently playing audio.
     * @returns {Promise<void>}
     * @throws {Error} If the audio fails to stop.
     */
    static stopAudio(): Promise<void>;
    /**
     * Clears the playback queue by turn ID.
     * @param {string} turnId - The turn ID.
     * @returns {Promise<void>}
     * @throws {Error} If the playback queue fails to clear.
     */
    static clearPlaybackQueueByTurnId(turnId: string): Promise<void>;
    /**
     * Plays a sound.
     * @param {string} audio - The audio to play.
     * @param {string} turnId - The turn ID.
     * @param {string} [encoding] - The encoding format of the audio data ('pcm_f32le' or 'pcm_s16le').
     * @returns {Promise<void>}
     * @throws {Error} If the sound fails to play.
     */
    static playSound(audio: string, turnId: string, encoding?: Encoding): Promise<void>;
    /**
     * Stops the currently playing sound.
     * @returns {Promise<void>}
     * @throws {Error} If the sound fails to stop.
     */
    static stopSound(): Promise<void>;
    /**
     * Interrupts the current sound.
     * @returns {Promise<void>}
     * @throws {Error} If the sound fails to interrupt.
     */
    static interruptSound(): Promise<void>;
    /**
     * Resumes the current sound.
     * @returns {Promise<void>}
     * @throws {Error} If the sound fails to resume.
     */
    static resumeSound(): void;
    /**
     * Clears the sound queue by turn ID.
     * @param {string} turnId - The turn ID.
     * @returns {Promise<void>}
     * @throws {Error} If the sound queue fails to clear.
     */
    static clearSoundQueueByTurnId(turnId: string): Promise<void>;
    private static _healthMonitorIntervals;
    /**
     * Starts a buffered audio stream for a specific turn ID.
     * This enables jitter buffering for improved audio quality on unreliable networks.
     * @param {BufferedStreamConfig} config - Configuration for the buffered stream.
     * @returns {Promise<void>}
     * @throws {Error} If the buffered stream fails to start.
     */
    static startBufferedAudioStream(config: BufferedStreamConfig): Promise<void>;
    /**
     * Plays audio with jitter buffering for a specific turn ID.
     * The stream must be started first with startBufferedAudioStream().
     * @param {string | Uint8Array | ArrayBuffer} audioData - Audio data (base64 string or binary).
     * @param {string} turnId - The turn ID for the stream.
     * @param {boolean} isFirst - Whether this is the first chunk.
     * @param {boolean} isFinal - Whether this is the final chunk.
     * @returns {Promise<void>}
     * @throws {Error} If the audio chunk fails to buffer or the stream is not started.
     */
    static playAudioBuffered(audioData: string | Uint8Array | ArrayBuffer, turnId: string, isFirst?: boolean, isFinal?: boolean): Promise<void>;
    /**
     * Check if audio data is empty
     */
    private static _isEmptyData;
    /**
     * JSI Binary: Plays audio directly from Uint8Array.
     * This bypasses Base64 encoding/decoding for ~33% less overhead and better performance.
     *
     * **Platform Behavior:**
     * - **Android**: Data is copied synchronously on the JS thread to avoid GC race conditions,
     *   then playback is dispatched asynchronously. The Promise resolves immediately after
     *   the data is safely copied. Use `SoundStarted` and `SoundChunkPlayed` events to track
     *   actual playback completion.
     * - **iOS**: Returns a Promise that resolves when the audio chunk is enqueued for playback.
     *
     * @param {Uint8Array} audioData - Raw PCM audio data as Uint8Array.
     * @param {string} turnId - The turn ID for queue management.
     * @param {string} [encoding] - The encoding format ('pcm_f32le' or 'pcm_s16le').
     * @returns {Promise<void>} Resolves when data is enqueued (not when playback completes).
     * @throws {Error} If the audio fails to be enqueued.
     */
    static playSoundBinary(audioData: Uint8Array, turnId: string, encoding?: Encoding): Promise<void>;
    /**
     * Converts Uint8Array to base64 string (fallback for older native modules)
     */
    private static _uint8ArrayToBase64;
    /**
     * Stops a buffered audio stream for a specific turn ID.
     * @param {string} turnId - The turn ID for the stream to stop.
     * @returns {Promise<void>}
     * @throws {Error} If the buffered stream fails to stop.
     */
    static stopBufferedAudioStream(turnId: string): Promise<void>;
    /**
     * Gets buffer health metrics for a specific turn ID.
     * @param {string} turnId - The turn ID for the stream.
     * @returns {IBufferHealthMetrics | null} Buffer health metrics or null if stream not found.
     */
    static getBufferHealthMetrics(turnId: string): IBufferHealthMetrics | null;
    /**
     * Checks if a buffered audio stream is currently playing.
     * @param {string} turnId - The turn ID for the stream.
     * @returns {boolean} True if the stream is playing, false otherwise.
     */
    static isBufferedAudioStreamPlaying(turnId: string): boolean;
    /**
     * Updates buffer configuration for a specific turn ID.
     * @param {string} turnId - The turn ID for the stream.
     * @param {Partial<IAudioBufferConfig>} config - New buffer configuration.
     * @returns {Promise<void>}
     */
    static updateBufferedAudioConfig(turnId: string, config: Partial<IAudioBufferConfig>): Promise<void>;
    /**
     * Starts microphone streaming.
     * @param {RecordingConfig} recordingConfig - The recording configuration.
     * @returns {Promise<{recordingResult: StartRecordingResult, subscription: Subscription}>} A promise that resolves to an object containing the recording result and a subscription to audio events.
     * @throws {Error} If the recording fails to start.
     */
    static startMicrophone(recordingConfig: RecordingConfig): Promise<{
        recordingResult: StartRecordingResult;
        subscription?: Subscription;
    }>;
    /**
     * Stops the current microphone streaming.
     * @returns {Promise<void>}
     * @throws {Error} If the microphone streaming fails to stop.
     */
    static stopMicrophone(): Promise<AudioRecording | null>;
    /**
     * Subscribes to audio events emitted during recording/streaming.
     * @param onMicrophoneStream - Callback function that will be called when audio data is received.
     * The callback receives an AudioDataEvent containing:
     * - data: Base64 encoded audio data at original sample rate
     * - data16kHz: Optional base64 encoded audio data resampled to 16kHz
     * - position: Current position in the audio stream
     * - fileUri: URI of the recording file
     * - eventDataSize: Size of the current audio data chunk
     * - totalSize: Total size of recorded audio so far
     * @returns {Subscription} A subscription object that can be used to unsubscribe from the events
     * @throws {Error} If encoded audio data is missing from the event
     */
    static subscribeToAudioEvents(onMicrophoneStream: (event: AudioDataEvent) => Promise<void>): Subscription;
    /**
     * Subscribes to events emitted when a sound chunk has finished playing.
     * @param onSoundChunkPlayed - Callback function that will be called when a sound chunk is played.
     * The callback receives a SoundChunkPlayedEventPayload indicating if this was the final chunk.
     * @returns {Subscription} A subscription object that can be used to unsubscribe from the events.
     */
    static subscribeToSoundChunkPlayed(onSoundChunkPlayed: (event: SoundChunkPlayedEventPayload) => Promise<void>): Subscription;
    /**
     * Subscribes to events emitted by the audio stream module, for advanced use cases.
     * @param eventName - The name of the event to subscribe to.
     * @param onEvent - Callback function that will be called when the event is emitted.
     * @returns {Subscription} A subscription object that can be used to unsubscribe from the events.
     */
    static subscribe<T extends unknown>(eventName: string, onEvent: (event: T | undefined) => Promise<void>): Subscription;
    /**
     * Plays a WAV audio file from base64 encoded data.
     * Unlike playSound(), this method plays the audio directly without queueing.
     * @param {string} wavBase64 - Base64 encoded WAV audio data.
     * @returns {Promise<void>}
     * @throws {Error} If the WAV audio fails to play.
     */
    static playWav(wavBase64: string): Promise<void>;
    /**
     * Sets the sound player configuration.
     * @param {SoundConfig} config - Configuration options for the sound player.
     * @returns {Promise<void>}
     * @throws {Error} If the configuration fails to update.
     */
    static setSoundConfig(config: SoundConfig): Promise<void>;
    /**
     * Prompts the user to select the microphone mode.
     * @returns {Promise<void>}
     * @throws {Error} If the microphone mode fails to prompt.
     */
    static promptMicrophoneModes(): void;
    /**
     * Toggles the silence state of the microphone.
     * @returns {Promise<void>}
     * @throws {Error} If the microphone fails to toggle silence.
     */
    static toggleSilence(): void;
}
export { AudioDataEvent, SoundChunkPlayedEventPayload, DeviceReconnectedReason, DeviceReconnectedEventPayload, AudioRecording, RecordingConfig, StartRecordingResult, AudioEvents, SuspendSoundEventTurnId, SoundConfig, PlaybackMode, Encoding, EncodingTypes, PlaybackModes, IAudioBufferConfig, IAudioPlayPayload, IAudioFrame, BufferHealthState, IBufferHealthMetrics, IAudioBufferManager, IFrameProcessor, IQualityMonitor, BufferedStreamConfig, SmartBufferConfig, SmartBufferMode, NetworkConditions, AudioDataType, IAudioTelemetry, IRetryConfig, DEFAULT_RETRY_CONFIG, TelemetryCallback, };
export type { Subscription } from './events';
export { AudioBufferManager, FrameProcessor, QualityMonitor, SmartBufferManager, RingBuffer, TelemetryManager, RetryHandler, defaultRetryHandler, } from './audio';
//# sourceMappingURL=index.d.ts.map