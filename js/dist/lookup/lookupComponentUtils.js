"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStrongestSubsequence = exports.getMaxStdDevSequence = exports.findLongestNonNullSubsequences = exports.getContiguousSequenceLengths = void 0;
const getContiguousSequenceLengths = (sequence) => {
    const sequenceLengths = [];
    for (let i = 0; i < sequence.length; i++) {
        for (let j = i; j < sequence.length; j++) {
            if (sequence[j] === null) {
                sequenceLengths.push({ position: i, length: j - i });
                break;
            }
            else if (j === sequence.length - 1) {
                sequenceLengths.push({ position: i, length: j - i + 1 });
            }
        }
    }
    return sequenceLengths;
};
exports.getContiguousSequenceLengths = getContiguousSequenceLengths;
const findLongestNonNullSubsequences = (sequence, max) => {
    const result = {};
    let sequenceLengths = (0, exports.getContiguousSequenceLengths)(sequence);
    sequenceLengths = sequenceLengths.sort((a, b) => a.length > b.length ? -1 : 1);
    if (!sequenceLengths.length) {
        return {};
    }
    const maxLength = Math.min(sequenceLengths[0].length, max);
    sequenceLengths = sequenceLengths.filter(x => x.length >= maxLength);
    sequenceLengths.forEach(l => {
        result[l.position] = sequence.slice(l.position, l.position + maxLength);
    });
    return result;
};
exports.findLongestNonNullSubsequences = findLongestNonNullSubsequences;
function getStandardDeviation(array) {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}
const getMaxStdDevSequence = (subsequences) => {
    let stdDevs = Object.keys(subsequences).map(x => parseInt(x)).map((p) => {
        return {
            position: p,
            stdDev: getStandardDeviation(subsequences[p])
        };
    });
    stdDevs = stdDevs.sort((a, b) => a.stdDev > b.stdDev ? -1 : 1);
    const position = stdDevs[0].position;
    return { position, sequence: subsequences[position] };
};
exports.getMaxStdDevSequence = getMaxStdDevSequence;
const getStrongestSubsequence = (sequence, max) => {
    const longestSubsequences = (0, exports.findLongestNonNullSubsequences)(sequence, max);
    const minStdDevSequence = (0, exports.getMaxStdDevSequence)(longestSubsequences);
    return minStdDevSequence;
};
exports.getStrongestSubsequence = getStrongestSubsequence;
