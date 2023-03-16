import {NoMatchReason} from "../model/noMatchReason";

/**
 * A NoMatch error indicates that no timestamp can be determined from the audio resource and the given search parameters.
 * Check the {@link NoMatchReason} for the cause.
 */
export class NoMatch extends Error {
    public noMatchReason: NoMatchReason;
    private cause: any;

    constructor(noMatchReason: NoMatchReason, cause?: any) {
        super();
        this.cause = cause;
        this.noMatchReason = noMatchReason;
    }
}
