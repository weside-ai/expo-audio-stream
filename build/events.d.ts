export type Subscription = {
    remove(): void;
};
export interface AudioEventPayload {
    encoded?: string;
    buffer?: Float32Array;
    fileUri: string;
    lastEmittedSize: number;
    position: number;
    deltaSize: number;
    totalSize: number;
    mimeType: string;
    streamUuid: string;
    soundLevel?: number;
}
export type SoundChunkPlayedEventPayload = {
    isFinal: boolean;
};
export declare const DeviceReconnectedReasons: {
    readonly newDeviceAvailable: "newDeviceAvailable";
    readonly oldDeviceUnavailable: "oldDeviceUnavailable";
    readonly unknown: "unknown";
};
export type DeviceReconnectedReason = (typeof DeviceReconnectedReasons)[keyof typeof DeviceReconnectedReasons];
export type DeviceReconnectedEventPayload = {
    reason: DeviceReconnectedReason;
};
export declare const AudioEvents: {
    AudioData: string;
    SoundChunkPlayed: string;
    SoundStarted: string;
    DeviceReconnected: string;
};
export declare function addAudioEventListener(listener: (event: AudioEventPayload) => Promise<void>): Subscription;
export declare function addSoundChunkPlayedListener(listener: (event: SoundChunkPlayedEventPayload) => Promise<void>): Subscription;
export declare function subscribeToEvent<T extends unknown>(eventName: string, listener: (event: T | undefined) => Promise<void>): Subscription;
//# sourceMappingURL=events.d.ts.map