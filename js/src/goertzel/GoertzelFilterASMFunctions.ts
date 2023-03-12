export interface GoertzelFilterASMFunctions {
    init: (dFreq: number, sFreq: number, len: number) => void;
    run: () => number;
}
