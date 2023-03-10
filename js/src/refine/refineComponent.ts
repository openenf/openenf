import {LookupResult} from "../model/lookupResult";
import {ENFComponent} from "../analyzer/ENFComponent";
import {ENFAnalysisResult} from "../model/ENFAnalysisResult";

/**
 * Provides a lookup function for an analyzer
 */
export interface RefineComponent extends ENFComponent {
    refine(lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]>
}
