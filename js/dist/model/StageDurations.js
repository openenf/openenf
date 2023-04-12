export class StageDurations {
    constructor(startTime, completionTimes) {
        if (completionTimes.preScan) {
            this.preScan = completionTimes.preScan?.getTime() - startTime.getTime();
            if (completionTimes.analyze) {
                this.analyze = completionTimes.analyze?.getTime() - completionTimes.preScan.getTime();
                if (completionTimes.reduce) {
                    this.reduce = completionTimes.reduce?.getTime() - completionTimes.analyze.getTime();
                    if (completionTimes.lookup) {
                        this.lookup = completionTimes.lookup?.getTime() - completionTimes.reduce.getTime();
                        if (completionTimes.refine) {
                            this.refine = completionTimes.refine?.getTime() - completionTimes.lookup.getTime();
                        }
                    }
                }
            }
        }
    }
}
