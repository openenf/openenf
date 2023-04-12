/**
 * BufferedAudioProcessor accepts variable size arrays of data of type {@link T} and appends them to a buffer array of the same type.
 * When the number of items in the buffer array exceeds the {@link windowSize} the {@link onWindowFull} function is executed for the first
 * {@link windowSize} elements in the buffer. These elements are subsequently removed the buffer.
 *
 * The motivation behind this class is to create a structure that can accepts chunks of audio of unknown size from an unpredicatble stream
 * (e.g. a URL or filestream) but only operate on a window of samples of fixed size (e.g. 44100 samples or 1 second of 44.1Hz audio)
 */
export class BufferedAudioProcessor {
    /**
     *
     * @param windowSize in practice this usually a multiple of the sample rate, typically 44100 or 48000 samples
     * @param onWindowFull the function to execute when the buffer becomes full
     * @param overlapFactor optionally a factor to allow {@link onWindowFull} to operate on overlapping windows of data. For example, with
     * an overlap factor of 4 and a windowSize of 1000, {@link onWindowFull} would fire on samples 0-999, then on samples 500-1599, then on
     * samples 1000-1999, etc. The overlap factor is used with the Goertzel frequency analysis to get frequency readings every quarter-second
     */
    constructor(windowSize, onWindowFull, overlapFactor = 1) {
        this.buffer = [];
        this.windowSize = windowSize;
        this.onWindowFull = onWindowFull;
        this.overlapFactor = overlapFactor;
    }
    /**
     * Adds an arbitrarily sized array of data. If the size of the chunk is more than 2 times the {@link windowSize} the {@link onWindowFull} function
     * will fire twice. If it's more than 3 times, the function will fire 3 times. So for an windowSize of 1000 if we add a chunk of 4500, {@link onWindowFull}
     * will fire 4 times, for samples 0-999, 1000-1999, 2000-2999, 3000-3999. Samples 4000-4500 will remain in the buffer/
     * @param chunk
     */
    addChunk(chunk) {
        this.buffer = [...this.buffer, ...chunk];
        if (this.buffer.length >= this.windowSize) {
            const overlap = this.windowSize / this.overlapFactor;
            const diff = this.buffer.length - this.windowSize;
            const numTimesToExecuteProcessor = Math.floor(diff / overlap) + 1;
            for (let i = 0; i < numTimesToExecuteProcessor; i++) {
                const window = this.buffer.slice(i * overlap, i * overlap + this.windowSize);
                this.onWindowFull(window);
            }
            this.buffer = this.buffer.slice(numTimesToExecuteProcessor * overlap);
        }
    }
    /**
     * Fires the {@link onWindowFull} function for any remaining data in the buffer
     */
    flush() {
        this.onWindowFull(this.buffer);
        this.buffer = [];
    }
}
