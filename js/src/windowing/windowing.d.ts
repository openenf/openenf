declare type WindowFunctionName = "hann" | "hamming" | "cosine" | "lanczos" | "gaussian" | "tukey" | "blackman" | "exact_blackman" | "kaiser" | "nuttall" | "blackman_harris" | "blackman_nuttall" | "flat_top";
/**
 * Adds a function for each window to the module exports.
 */
declare const hann: (array: number[], alpha?: number | undefined) => number[];
declare const hamming: (array: number[], alpha?: number | undefined) => number[];
declare const cosine: (array: number[], alpha?: number | undefined) => number[];
declare const lanczos: (array: number[], alpha?: number | undefined) => number[];
declare const gaussian: (array: number[], alpha?: number | undefined) => number[];
declare const tukey: (array: number[], alpha?: number | undefined) => number[];
declare const blackman: (array: number[], alpha?: number | undefined) => number[];
declare const exact_blackman: (array: number[], alpha?: number | undefined) => number[];
declare const kaiser: (array: number[], alpha?: number | undefined) => number[];
declare const nuttall: (array: number[], alpha?: number | undefined) => number[];
declare const blackman_harris: (array: number[], alpha?: number | undefined) => number[];
declare const blackman_nuttall: (array: number[], alpha?: number | undefined) => number[];
declare const flat_top: (array: number[], alpha?: number | undefined) => number[];
export { hann, hamming, cosine, lanczos, gaussian, tukey, blackman, exact_blackman, kaiser, nuttall, blackman_harris, blackman_nuttall, flat_top, WindowFunctionName, };
