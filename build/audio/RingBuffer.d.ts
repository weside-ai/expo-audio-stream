import { IAudioFrame } from "../types";
/**
 * Memory-efficient circular buffer implementation for audio frames.
 * Pre-allocates a fixed-size array and reuses slots to minimize GC pressure.
 *
 * Benefits over standard array:
 * - O(1) enqueue/dequeue operations
 * - No array resizing or memory reallocation
 * - Reduced garbage collection pauses
 * - Predictable memory footprint
 */
export declare class RingBuffer {
    private _buffer;
    private _capacity;
    private _head;
    private _tail;
    private _size;
    /**
     * Creates a new ring buffer with the specified capacity
     * @param capacity Maximum number of frames to hold (default: 100 frames ≈ 2 seconds at 20ms/frame)
     */
    constructor(capacity?: number);
    /**
     * Adds a frame to the buffer. If buffer is full, overwrites the oldest frame.
     * @param frame The audio frame to add
     * @returns true if successful, false if frame was dropped due to overrun
     */
    push(frame: IAudioFrame): boolean;
    /**
     * Removes and returns the oldest frame from the buffer
     * @returns The oldest frame, or null if buffer is empty
     */
    shift(): IAudioFrame | null;
    /**
     * Peeks at the oldest frame without removing it
     * @returns The oldest frame, or null if buffer is empty
     */
    peek(): IAudioFrame | null;
    /**
     * Adds a frame at the front of the buffer (for silence insertion)
     * @param frame The frame to add at the front
     */
    unshift(frame: IAudioFrame): void;
    /**
     * Clears all frames from the buffer
     */
    clear(): void;
    /**
     * Returns the current number of frames in the buffer
     */
    get length(): number;
    /**
     * Returns the maximum capacity of the buffer
     */
    get capacity(): number;
    /**
     * Returns true if the buffer is empty
     */
    get isEmpty(): boolean;
    /**
     * Returns true if the buffer is full
     */
    get isFull(): boolean;
    /**
     * Calculates total duration of all frames in the buffer
     * @returns Total duration in milliseconds
     */
    getTotalDurationMs(): number;
    /**
     * Drops the oldest N frames from the buffer
     * @param count Number of frames to drop
     * @returns Actual number of frames dropped
     */
    dropOldest(count: number): number;
    /**
     * Returns buffer utilization as a percentage (0-100)
     */
    getUtilization(): number;
    /**
     * Iterates over all frames in order (oldest to newest) without removing them
     * @param callback Function to call for each frame
     */
    forEach(callback: (frame: IAudioFrame, index: number) => void): void;
}
//# sourceMappingURL=RingBuffer.d.ts.map