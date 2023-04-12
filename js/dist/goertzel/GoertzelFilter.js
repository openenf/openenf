/**
 * Retrieves the relative strength of a specified frequency for a given sample window. Each {@link GoertzelFilter} is created for a specific
 * frequency.
 * This code is adapted from: {@link https://github.com/notthetup/goertzel-filter}.
 * The Goertzel Algorithm is general is described at: {@link https://en.wikipedia.org/wiki/Goertzel_algorithm}
 */
export class GoertzelFilter {
    constructor() {
        this.targetFrequency = 0;
        const heap = new ArrayBuffer(524288);
        this.heapBuffer = new Float32Array(heap);
        this.goertzelFilter = GoertzelFilterASM(heap);
    }
    init(dFreq, sFreq, length) {
        this.targetFrequency = dFreq;
        this.goertzelFilter.init(dFreq, sFreq, length);
    }
    run(samples) {
        this.heapBuffer.set(samples);
        return this.goertzelFilter.run();
    }
    get getTargetFrequency() {
        return this.targetFrequency;
    }
}
function GoertzelFilterASM(heap) {
    const cos = Math.cos;
    const PI = Math.PI;
    const samplesArray = new Float32Array(heap);
    let coefficient = 0.0;
    let length = 0;
    let targetFrequency = 0.0;
    function init(dFreq, sFreq, len) {
        dFreq = +dFreq;
        sFreq = +sFreq;
        len = len | 0;
        length = len;
        coefficient = 2.0 * cos(2.0 * PI * dFreq / sFreq);
        targetFrequency = dFreq;
    }
    function run() {
        let index = 0;
        let prev0 = 0.0;
        let prev1 = 0.0;
        let s = 0.0;
        for (; (index | 0) < (length | 0); index = (index + 1) | 0) {
            s = +samplesArray[index << 2 >> 2] + +(coefficient * prev0) - +prev1;
            prev1 = prev0;
            prev0 = s;
        }
        return ((prev1 * prev1) + (prev0 * prev0) - (coefficient * prev0 * prev1)) / +(length | 0) / +(length | 0);
    }
    return {
        init: init,
        run: run
    };
}
window.GoertzelFilter = GoertzelFilter;
