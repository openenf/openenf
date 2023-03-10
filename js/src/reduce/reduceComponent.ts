import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {ENFComponent} from "../ENFProcessor/ENFComponent";

/**
 * Provides a lookup function for an analyzer
 */
export interface ReduceComponent extends ENFComponent {
    reduce(analysisResults: AnalysisWindowResult[]): Promise<(number | null)[]>
}
