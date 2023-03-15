import {LookupResult} from "../model/lookupResult";
import {ENFComponent} from "../ENFProcessor/ENFComponent";
import {ENFAnalysisResult} from "../model/ENFAnalysisResult";

/**
 * Provides a lookup function for an analyzer
 */
export interface RefineComponent extends ENFComponent {
    refine(freqs: (number|null)[], lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]>
}

