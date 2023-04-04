import { AnalysisWindowResult } from "../../model/analysisWindowResult";
import { ReduceComponent } from "../../reduce/reduceComponent";
export declare class MockReduceComponent implements ReduceComponent {
    readonly implementationId: string;
    private readonly onReduce?;
    private readonly result;
    constructor(onReduce?: (analysisResults: AnalysisWindowResult[]) => void, result?: (number | null)[]);
    reduce(analysisResults: AnalysisWindowResult[]): Promise<(number | null)[]>;
}
