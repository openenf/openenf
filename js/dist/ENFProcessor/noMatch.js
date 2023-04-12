/**
 * A NoMatch error indicates that no timestamp can be determined from the audio resource and the given search parameters.
 * Check the {@link NoMatchReason} for the cause.
 */
export class NoMatch extends Error {
    constructor(noMatchReason, cause) {
        super();
        this.cause = cause;
        this.noMatchReason = noMatchReason;
    }
}
