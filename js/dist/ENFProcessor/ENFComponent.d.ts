/**
 * A PreScan, Analysis, Reduce, Lookup or Refine ENF component
 */
export interface ENFComponent {
    /**
     * A unique identifier for the component implementation. Used to compare the efficacy of analysis using different
     * components
     */
    readonly implementationId: string;
}
