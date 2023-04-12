export declare const getContiguousSequenceLengths: (sequence: (number | null)[]) => {
    position: number;
    length: number;
}[];
export declare const findLongestNonNullSubsequences: (sequence: (number | null)[], max: number) => {
    [index: number]: number[];
};
export declare const getMaxStdDevSequence: (subsequences: {
    [index: number]: number[];
}) => {
    position: number;
    sequence: number[];
};
export declare const getStrongestSubsequence: (sequence: (number | null)[], max: number) => {
    position: number;
    sequence: number[];
};
