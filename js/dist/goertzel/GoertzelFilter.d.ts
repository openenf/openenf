/**
 * Retrieves the relative strength of a specified frequency for a given sample window. Each {@link GoertzelFilter} is created for a specific
 * frequency.
 * This code is adapted from: {@link https://github.com/notthetup/goertzel-filter}.
 * The Goertzel Algorithm is general is described at: {@link https://en.wikipedia.org/wiki/Goertzel_algorithm}
 */
export declare class GoertzelFilter {
    private targetFrequency;
    private heapBuffer;
    private goertzelFilter;
    constructor();
    init(dFreq: number, sFreq: number, length: number): void;
    run(samples: ArrayLike<number>): number;
    get getTargetFrequency(): number;
}
export interface GoertzelFilterASMFunctions {
    init: (dFreq: number, sFreq: number, len: number) => void;
    run: () => number;
}
