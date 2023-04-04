/**
 * Optionally a factor to allow {@link onWindowFull} to operate on overlapping windows of data. For example, with
 * an overlap factor of 4 and a windowSize of 1000, {@link onWindowFull} would fire on samples 0-999, then on samples 500-1599, then on
 * samples 1000-1999, etc. The overlap factor is used with the Goertzel frequency analysis to get frequency readings every quarter-second
 */
export type OverlapFactor = 1 | 2 | 4 | 8 | 16;
/**
 * BufferedAudioProcessor accepts variable size arrays of data of type {@link T} and appends them to a buffer array of the same type.
 * When the number of items in the buffer array exceeds the {@link windowSize} the {@link onWindowFull} function is executed for the first
 * {@link windowSize} elements in the buffer. These elements are subsequently removed the buffer.
 *
 * The motivation behind this class is to create a structure that can accepts chunks of audio of unknown size from an unpredicatble stream
 * (e.g. a URL or filestream) but only operate on a window of samples of fixed size (e.g. 44100 samples or 1 second of 44.1Hz audio)
 */
export declare class BufferedAudioProcessor<T> {
    private readonly windowSize;
    private buffer;
    /**
     * onWindowFull fires whenever the buffer exceeds the {@link windowSize} passing the first {@link windowSize} samples from the buffer
     * as an argument
     */
    onWindowFull: (window: T[]) => any;
    private readonly overlapFactor;
    /**
     *
     * @param windowSize in practice this usually a multiple of the sample rate, typically 44100 or 48000 samples
     * @param onWindowFull the function to execute when the buffer becomes full
     * @param overlapFactor optionally a factor to allow {@link onWindowFull} to operate on overlapping windows of data. For example, with
     * an overlap factor of 4 and a windowSize of 1000, {@link onWindowFull} would fire on samples 0-999, then on samples 500-1599, then on
     * samples 1000-1999, etc. The overlap factor is used with the Goertzel frequency analysis to get frequency readings every quarter-second
     */
    constructor(windowSize: number, onWindowFull: (window: T[]) => any, overlapFactor?: OverlapFactor);
    /**
     * Adds an arbitrarily sized array of data. If the size of the chunk is more than 2 times the {@link windowSize} the {@link onWindowFull} function
     * will fire twice. If it's more than 3 times, the function will fire 3 times. So for an windowSize of 1000 if we add a chunk of 4500, {@link onWindowFull}
     * will fire 4 times, for samples 0-999, 1000-1999, 2000-2999, 3000-3999. Samples 4000-4500 will remain in the buffer/
     * @param chunk
     */
    addChunk(chunk: T[]): void;
    /**
     * Fires the {@link onWindowFull} function for any remaining data in the buffer
     */
    flush(): void;
}
