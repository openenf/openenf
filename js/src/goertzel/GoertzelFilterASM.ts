import {GoertzelFilterASMFunctions} from "./GoertzelFilterASMFunctions";

export function GoertzelFilterASM(heap:ArrayBuffer):GoertzelFilterASMFunctions {

    const cos = Math.cos;
    const PI = Math.PI;
    const samplesArray = new Float32Array(heap);

    let coefficient = 0.0;
    let length = 0;
    let targetFrequency = 0.0;

    function init(dFreq:number, sFreq:number, len:number) {
        dFreq = +dFreq;
        sFreq = +sFreq;
        len = len | 0;

        length = len;

        coefficient = 2.0 * cos(2.0 * PI * dFreq / sFreq);
        targetFrequency = dFreq;
    }

    function run():number {
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
