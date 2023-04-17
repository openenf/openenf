"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flat_top = exports.blackman_nuttall = exports.blackman_harris = exports.nuttall = exports.kaiser = exports.exact_blackman = exports.blackman = exports.tukey = exports.gaussian = exports.lanczos = exports.cosine = exports.hamming = exports.hann = void 0;
const sinc = (n) => Math.sin(Math.PI * n) / (Math.PI * n);
const bessi0 = (x) => {
    /* Evaluate modified Bessel function In(x) and n=0. */
    const ax = Math.abs(x);
    if (ax < 3.75) {
        const y = (x / 3.75) * (x / 3.75);
        return (1.0 +
            y *
                (3.5156229 +
                    y *
                        (3.0899424 +
                            y *
                                (1.2067492 +
                                    y * (0.2659732 + y * (0.360768e-1 + y * 0.45813e-2))))));
    }
    else {
        const y = 3.75 / ax;
        return ((Math.exp(ax) / Math.sqrt(ax)) *
            (0.39894228 +
                y *
                    (0.1328592e-1 +
                        y *
                            (0.225319e-2 +
                                y *
                                    (-0.157565e-2 +
                                        y *
                                            (0.916281e-2 +
                                                y *
                                                    (-0.2057706e-1 +
                                                        y *
                                                            (0.2635537e-1 +
                                                                y * (-0.1647633e-1 + y * 0.392377e-2)))))))));
    }
};
/**
 * Windowing functions.
 */
const windows = {
    hann: (n, points) => 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (points - 1)),
    hamming: (n, points) => 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (points - 1)),
    cosine: (n, points) => Math.sin((Math.PI * n) / (points - 1)),
    lanczos: (n, points) => sinc((2 * n) / (points - 1) - 1),
    gaussian: (n, points, alpha = 0.4) => {
        return Math.pow(Math.E, -0.5 * Math.pow((n - (points - 1) / 2) / ((alpha * (points - 1)) / 2), 2));
    },
    tukey: (n, points, alpha = 0.5) => {
        if (n < 0.5 * alpha * (points - 1)) {
            return (0.5 * (1 + Math.cos(Math.PI * ((2 * n) / (alpha * (points - 1)) - 1))));
        }
        else if (n < (1 - 0.5 * alpha) * (points - 1)) {
            return 1;
        }
        else {
            return (0.5 *
                (1 +
                    Math.cos(Math.PI * ((2 * n) / (alpha * (points - 1)) + 1 - 2 / alpha))));
        }
    },
    blackman: (n, points) => {
        return (0.42 -
            0.5 * Math.cos((2 * Math.PI * n) / (points - 1)) +
            0.08 * Math.cos((4 * Math.PI * n) / (points - 1)));
    },
    exact_blackman: (n, points) => {
        return (0.4243801 -
            0.4973406 * Math.cos((2 * Math.PI * n) / (points - 1)) +
            0.0782793 * Math.cos((4 * Math.PI * n) / (points - 1)));
    },
    kaiser: (n, points, alpha = 3) => {
        return (bessi0(Math.PI * alpha * Math.sqrt(1 - Math.pow((2 * n) / (points - 1) - 1, 2))) / bessi0(Math.PI * alpha));
    },
    nuttall: (n, points) => {
        return (0.355768 -
            0.487396 * Math.cos((2 * Math.PI * n) / (points - 1)) +
            0.144232 * Math.cos((4 * Math.PI * n) / (points - 1)) -
            0.012604 * Math.cos((6 * Math.PI * n) / (points - 1)));
    },
    blackman_harris: (n, points) => {
        return (0.35875 -
            0.48829 * Math.cos((2 * Math.PI * n) / (points - 1)) +
            0.14128 * Math.cos((4 * Math.PI * n) / (points - 1)) -
            0.01168 * Math.cos((6 * Math.PI * n) / (points - 1)));
    },
    blackman_nuttall: (n, points) => {
        return (0.3635819 -
            0.3635819 * Math.cos((2 * Math.PI * n) / (points - 1)) +
            0.1365995 * Math.cos((4 * Math.PI * n) / (points - 1)) -
            0.0106411 * Math.cos((6 * Math.PI * n) / (points - 1)));
    },
    flat_top: (n, points) => {
        return (1 -
            1.93 * Math.cos((2 * Math.PI * n) / (points - 1)) +
            1.29 * Math.cos((4 * Math.PI * n) / (points - 1)) -
            0.388 * Math.cos((6 * Math.PI * n) / (points - 1)) +
            0.032 * Math.cos((8 * Math.PI * n) / (points - 1)));
    },
};
/**
 * Applies a Windowing Function to an array.
 */
const applyWindowFunction = (data_array, windowing_function, alpha) => {
    const datapoints = data_array.length;
    /* For each item in the array */
    for (let n = 0; n < datapoints; ++n) {
        /* Apply the windowing function */
        data_array[n] *= windowing_function(n, datapoints, alpha);
    }
    return data_array;
};
/* -------- Exports -------- */
/**
 * A helper to actually create window functions.
 */
const create_window_function = (win) => (array, alpha) => applyWindowFunction(array, windows[win], alpha);
/**
 * Adds a function for each window to the module exports.
 */
const hann = create_window_function("hann");
exports.hann = hann;
const hamming = create_window_function("hamming");
exports.hamming = hamming;
const cosine = create_window_function("cosine");
exports.cosine = cosine;
const lanczos = create_window_function("lanczos");
exports.lanczos = lanczos;
const gaussian = create_window_function("gaussian");
exports.gaussian = gaussian;
const tukey = create_window_function("tukey");
exports.tukey = tukey;
const blackman = create_window_function("blackman");
exports.blackman = blackman;
const exact_blackman = create_window_function("exact_blackman");
exports.exact_blackman = exact_blackman;
const kaiser = create_window_function("kaiser");
exports.kaiser = kaiser;
const nuttall = create_window_function("nuttall");
exports.nuttall = nuttall;
const blackman_harris = create_window_function("blackman_harris");
exports.blackman_harris = blackman_harris;
const blackman_nuttall = create_window_function("blackman_nuttall");
exports.blackman_nuttall = blackman_nuttall;
const flat_top = create_window_function("flat_top");
exports.flat_top = flat_top;
