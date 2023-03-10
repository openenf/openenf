import {AnalysisWindowResult} from "../../model/analysisWindowResult";
import {ReduceComponent} from "../../reduce/reduceComponent";

export class MockReduceComponent implements ReduceComponent {
    readonly implementationId: string = "MockReduceComponent";
    private readonly onReduce?:(analysisResults: AnalysisWindowResult[]) => void ;
    private readonly result: (number | null)[];

    constructor(onReduce?:(analysisResults: AnalysisWindowResult[]) => void, result?: (number|null)[]) {
        this.onReduce = onReduce;
        this.result = result || [];
    }

    reduce(analysisResults: AnalysisWindowResult[]): Promise<(number | null)[]> {
        if (this.onReduce) {
            this.onReduce(analysisResults)
        }
        return Promise.resolve(this.result);
    }

}
