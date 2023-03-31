import {LookupResult} from "../model/lookupResult";
import kurtosis from "compute-kurtosis";

let kurtosisFunction: any;

if (typeof kurtosis === 'object') {
    kurtosisFunction = kurtosis.default;
} else {
    kurtosisFunction = kurtosis;
}

export const convertPositionToGridDate = (position: number, gridStartDate: Date): Date => {
    const date = new Date(gridStartDate.getTime() + (position * 1000));
    return date;
}

export const clusterResults = (results:LookupResult[]):LookupResult[][] => {
    const groupDict = results.reduce((groups: { [id: string]: LookupResult[]; }, item:LookupResult) => {
        const group = (groups[item.gridId] || []);
        group.push(item);
        groups[item.gridId] = group;
        return groups;
    }, {});
    const groups:LookupResult[][] = Object.values(groupDict);
    let allClusters:LookupResult[][] = [];
    groups.forEach(group => {
        const orderedResults:LookupResult[] = group.sort((a,b) => a.position - b.position);
        const clusters:LookupResult[][] = [[]];
        let clusterIndex = 0;
        orderedResults.forEach((x,i) => {
            clusters[clusterIndex].push(x);
            if (i + 1 < orderedResults.length) {
                const x2 = orderedResults[i+1];
                if ((x2.position - x.position) > 1) {
                    clusters.push([]);
                    clusterIndex++;
                }
            }
        })
        allClusters = [...allClusters, ...clusters];
    })
    const orderedClusters = allClusters
        .map(x => x.sort((a,b) => a.score - b.score))
        .sort((a,b) => b[0].score - a[0].score);
    return orderedClusters;
}

export const getPeaks = (results: LookupResult[]) => {
    const resultClusters = clusterResults(results);
    return resultClusters.map(x => {return {position:x[0].position, gridId:x[0].gridId, score:x[0].score}}).slice(0,50);
}

export const computeKurtosis = (numbers: number[]) => {
    return kurtosisFunction(numbers);
}
