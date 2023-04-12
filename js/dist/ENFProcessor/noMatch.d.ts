import { NoMatchReason } from "../model/noMatchReason";
/**
 * A NoMatch error indicates that no timestamp can be determined from the audio resource and the given search parameters.
 * Check the {@link NoMatchReason} for the cause.
 */
export declare class NoMatch extends Error {
    noMatchReason: NoMatchReason;
    private cause;
    constructor(noMatchReason: NoMatchReason, cause?: any);
}
