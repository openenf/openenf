"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoMatch = void 0;
/**
 * A NoMatch error indicates that no timestamp can be determined from the audio resource and the given search parameters.
 * Check the {@link NoMatchReason} for the cause.
 */
class NoMatch extends Error {
    constructor(noMatchReason, cause) {
        super(noMatchReason);
        this.cause = cause;
        this.noMatchReason = noMatchReason;
    }
}
exports.NoMatch = NoMatch;
