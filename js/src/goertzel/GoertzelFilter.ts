import {GoertzelFilterASM} from "./GoertzelFilterASM";
import {GoertzelFilterASMFunctions} from "./GoertzelFilterASMFunctions";

export class GoertzelFilter {
    private targetFrequency = 0;
    private heapBuffer: Float32Array;
    private goertzelFilter: GoertzelFilterASMFunctions;

    constructor() {
        const heap = new ArrayBuffer(524288);
        this.heapBuffer = new Float32Array(heap);
        this.goertzelFilter = GoertzelFilterASM(heap);
    }

    public init(dFreq: number, sFreq: number, length: number): void {
        this.targetFrequency = dFreq;
        this.goertzelFilter.init(dFreq, sFreq, length);
    }

    public run(samples: ArrayLike<number>): number {
        this.heapBuffer.set(samples);
        return this.goertzelFilter.run();
    }

    get getTargetFrequency(): number {
        return this.targetFrequency;
    }
}
