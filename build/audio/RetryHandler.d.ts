import { IRetryConfig } from '../types';
/**
 * Production-ready retry handler with exponential backoff.
 * Provides resilient error handling for audio operations.
 */
export declare class RetryHandler {
    private _config;
    constructor(config?: Partial<IRetryConfig>);
    /**
     * Executes an operation with retry logic
     * @param operation - The async operation to execute
     * @param operationName - Name for logging purposes
     * @returns The result of the operation
     * @throws Error if all retries fail
     */
    execute<T>(operation: () => Promise<T>, operationName?: string): Promise<T>;
    /**
     * Executes an operation with retry logic, returning null on failure instead of throwing
     * @param operation - The async operation to execute
     * @param operationName - Name for logging purposes
     * @returns The result of the operation, or null if all retries fail
     */
    executeSafe<T>(operation: () => Promise<T>, operationName?: string): Promise<T | null>;
    /**
     * Calculates delay for the given attempt using exponential backoff
     */
    private _calculateDelay;
    /**
     * Sleep for the specified duration
     */
    private _sleep;
    /**
     * Updates retry configuration
     */
    updateConfig(config: Partial<IRetryConfig>): void;
    /**
     * Gets current configuration
     */
    getConfig(): IRetryConfig;
}
/**
 * Global retry handler instance with default configuration
 */
export declare const defaultRetryHandler: RetryHandler;
//# sourceMappingURL=RetryHandler.d.ts.map