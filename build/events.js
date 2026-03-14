// packages/expo-audio-stream/src/events.ts
import { LegacyEventEmitter } from "expo-modules-core";
import ExpoPlayAudioStreamModule from "./ExpoPlayAudioStreamModule";
// Use LegacyEventEmitter for backward compatibility with older event API
const emitter = new LegacyEventEmitter(ExpoPlayAudioStreamModule);
export const DeviceReconnectedReasons = {
    newDeviceAvailable: "newDeviceAvailable",
    oldDeviceUnavailable: "oldDeviceUnavailable",
    unknown: "unknown",
};
export const AudioEvents = {
    AudioData: "AudioData",
    SoundChunkPlayed: "SoundChunkPlayed",
    SoundStarted: "SoundStarted",
    DeviceReconnected: "DeviceReconnected",
};
export function addAudioEventListener(listener) {
    return emitter.addListener("AudioData", listener);
}
export function addSoundChunkPlayedListener(listener) {
    return emitter.addListener("SoundChunkPlayed", listener);
}
export function subscribeToEvent(eventName, listener) {
    return emitter.addListener(eventName, listener);
}
//# sourceMappingURL=events.js.map