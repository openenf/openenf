"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFrequencyBase = void 0;
const getFrequencyBase = (freqs) => {
    const possBases = [50, 60];
    const sums = possBases.map(base => {
        return freqs.reduce((sum, freq) => {
            return sum + (freq == null ? 0 : Math.abs(base - freq));
        }, 0);
    });
    return (sums[0] < sums[1]) ? 50 : 60;
};
exports.getFrequencyBase = getFrequencyBase;
