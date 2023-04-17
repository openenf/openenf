"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupResult = void 0;
/**
 * The result of comparing an array of frequencies to a point in time on a grid. A LookupResult array is the result of the
 * lookup stage. This array as past to the final refine stage of analysis to produce an {@link ENFAnalysisResult}
 */
class LookupResult {
    constructor() {
        /**
         * The position in the grid data stream of this result. 0 denotes a result at the beginning of the stream so this value
         * is effectively a timestamp offset. It can be converted into a timestamp (in seconds) by adding the start timestamp of
         * the grid
         */
        this.position = 0;
        /**
         * The score, denoting the closeness of the match to the frequency array. A maximum score of 0 denotes a perfect match.
         * Scores less than zero represent worse matches. Scores are never greater than zero.
         */
        this.score = 0;
        /**
         * The id of the grid being compared
         *
         * @example
         * "DE"
         */
        this.gridId = "";
    }
}
exports.LookupResult = LookupResult;
