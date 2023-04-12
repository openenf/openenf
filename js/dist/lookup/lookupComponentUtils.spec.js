import { findLongestNonNullSubsequences, getContiguousSequenceLengths, getMaxStdDevSequence } from "./lookupComponentUtils";
describe('lookupComponentUtils', () => {
    it('getMaxStdDevSequence returns the sequence with the smallest standard deviation', () => {
        const { position, sequence } = getMaxStdDevSequence({
            '5': [1, 2, 3, 8],
            '16': [1, 2, 3, 4],
            '21': [1, 2, 3, 3],
            '22': [2, 3, 4, 5]
        });
        expect(position).toBe(5);
        expect(sequence).toStrictEqual([1, 2, 3, 8]);
    });
    it('findLongestNonNullSubsequences finds the longest non-null subsequences smaller than 5', () => {
        const sequence = [1, null, 1, 2, null, 1, 2, 3, 4, null, null, 1, 2, 3, null, null, 1, 2, 3, 4, null, 1, 2, 3, 4, 5];
        const result = findLongestNonNullSubsequences(sequence, 4);
        expect(result).toStrictEqual({
            '5': [1, 2, 3, 4],
            '16': [1, 2, 3, 4],
            '21': [1, 2, 3, 4],
            '22': [2, 3, 4, 5]
        });
    });
    it('getContiguousSequenceLengths returns lengths of non-null subsequences for each index of a sequence (short)', () => {
        const sequence = [1, null, 1, 2, null, 1];
        const result = getContiguousSequenceLengths(sequence);
        expect(result.length).toBe(sequence.length);
        expect(result[0]).toStrictEqual({ position: 0, length: 1 });
        expect(result[1]).toStrictEqual({ position: 1, length: 0 });
        expect(result[2]).toStrictEqual({ position: 2, length: 2 });
        expect(result[3]).toStrictEqual({ position: 3, length: 1 });
    });
    it('getContiguousSequenceLengths returns lengths of non-null subsequences for each index of a sequence', () => {
        const sequence = [1, null, 1, 2, null, 1, 2, 3, 4, null, null, 1, 2, 3, null, null, 1, 2, 3, 4, null, 1, 2, 3, 4, 5];
        const result = getContiguousSequenceLengths(sequence);
        expect(result).toStrictEqual([
            { position: 0, length: 1 },
            { position: 1, length: 0 },
            { position: 2, length: 2 },
            { position: 3, length: 1 },
            { position: 4, length: 0 },
            { position: 5, length: 4 },
            { position: 6, length: 3 },
            { position: 7, length: 2 },
            { position: 8, length: 1 },
            { position: 9, length: 0 },
            { position: 10, length: 0 },
            { position: 11, length: 3 },
            { position: 12, length: 2 },
            { position: 13, length: 1 },
            { position: 14, length: 0 },
            { position: 15, length: 0 },
            { position: 16, length: 4 },
            { position: 17, length: 3 },
            { position: 18, length: 2 },
            { position: 19, length: 1 },
            { position: 20, length: 0 },
            { position: 21, length: 5 },
            { position: 22, length: 4 },
            { position: 23, length: 3 },
            { position: 24, length: 2 },
            { position: 25, length: 1 }
        ]);
    });
});
