import {LookupResult} from "../model/lookupResult";
import {ENFAnalysisResult} from "../model/ENFAnalysisResult";
import {RefineComponent} from "./refineComponent";

export class HttpRefineComponent implements RefineComponent {
    private refineUri: string;

    constructor(refineUri: string) {
        this.refineUri = refineUri;
    }

    readonly implementationId: string = "HttpRefineV0.1"

    refine(lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]> {
        throw "Not implemented"
    }
}