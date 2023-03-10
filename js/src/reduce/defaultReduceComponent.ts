import {ReduceComponent} from "./reduceComponent";
import {AnalysisWindowResult} from "../model/analysisWindowResult";

export class DefaultReduceComponent implements ReduceComponent {
    readonly implementationId: string = "DefaultReduceV0.1"

    reduce(analysisResults: AnalysisWindowResult[]): Promise<(number | null)[]> {
        throw "not implemented"
    }
}