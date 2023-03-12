export type overlapFactor = 1|2|4|8|16;

export class BufferedAudioProcessor<T> {
    private readonly windowSize: number;
    private buffer:T[] = [];
    onWindowFull: (window: T[]) => any;
    private readonly overlapFactor: overlapFactor;
    constructor(windowSize:number, onWindowFull: (window:T[]) => any, overlapFactor:overlapFactor = 1) {
        this.windowSize = windowSize;
        this.onWindowFull = onWindowFull
        this.overlapFactor = overlapFactor;
    }
    addChunk(chunk:T[]) {
        this.buffer = [...this.buffer, ...chunk];
        if(this.buffer.length >= this.windowSize) {
            const overlap = this.windowSize / this.overlapFactor;
            const diff = this.buffer.length - this.windowSize;
            const numTimesToExecuteProcessor = Math.floor(diff/overlap) + 1;
            for(let i = 0; i < numTimesToExecuteProcessor; i++) {
                const window = this.buffer.slice(i * overlap, i * overlap + this.windowSize);
                this.onWindowFull(window)
            }
            const remainder = diff % overlap;
            this.buffer = this.buffer.slice(numTimesToExecuteProcessor * overlap);
        }
    }
    flush() {
        this.onWindowFull(this.buffer);
        this.buffer = [];
    }
}
