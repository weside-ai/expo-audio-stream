export const PlaybackModes = {
    REGULAR: "regular",
    VOICE_PROCESSING: "voiceProcessing",
    CONVERSATION: "conversation",
};
export const EncodingTypes = {
    PCM_F32LE: "pcm_f32le",
    PCM_S16LE: "pcm_s16le",
};
/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    initialDelayMs: 50,
    maxDelayMs: 1000,
    backoffMultiplier: 2,
    useJitter: true,
};
//# sourceMappingURL=types.js.map