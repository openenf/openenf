import { LookupResult } from "../model/lookupResult";
export declare const convertPositionToGridDate: (position: number, gridStartDate: Date) => Date;
export declare const clusterResults: (results: LookupResult[]) => LookupResult[][];
export declare const getPeaks: (results: LookupResult[]) => {
    position: number;
    gridId: string;
    score: number;
}[];
export declare const computeKurtosis: (numbers: number[]) => any;
