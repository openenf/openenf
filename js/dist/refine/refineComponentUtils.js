"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeKurtosis = exports.getPeaks = exports.clusterResults = exports.convertPositionToGridDate = void 0;
const compute_kurtosis_1 = __importDefault(require("compute-kurtosis"));
let kurtosisFunction;
if (typeof compute_kurtosis_1.default === 'object') {
    kurtosisFunction = compute_kurtosis_1.default.default;
}
else {
    kurtosisFunction = compute_kurtosis_1.default;
}
const convertPositionToGridDate = (position, gridStartDate) => {
    const date = new Date(gridStartDate.getTime() + (position * 1000));
    return date;
};
exports.convertPositionToGridDate = convertPositionToGridDate;
const clusterResults = (results) => {
    const groupDict = results.reduce((groups, item) => {
        const group = (groups[item.gridId] || []);
        group.push(item);
        groups[item.gridId] = group;
        return groups;
    }, {});
    const groups = Object.values(groupDict);
    let allClusters = [];
    groups.forEach(group => {
        const orderedResults = group.sort((a, b) => a.position - b.position);
        const clusters = [[]];
        let clusterIndex = 0;
        orderedResults.forEach((x, i) => {
            clusters[clusterIndex].push(x);
            if (i + 1 < orderedResults.length) {
                const x2 = orderedResults[i + 1];
                if ((x2.position - x.position) > 1) {
                    clusters.push([]);
                    clusterIndex++;
                }
            }
        });
        allClusters = [...allClusters, ...clusters];
    });
    const orderedClusters = allClusters
        .map(x => x.sort((a, b) => a.score - b.score))
        .sort((a, b) => b[0].score - a[0].score);
    return orderedClusters;
};
exports.clusterResults = clusterResults;
const getPeaks = (results) => {
    const resultClusters = (0, exports.clusterResults)(results);
    return resultClusters.map(x => { return { position: x[0].position, gridId: x[0].gridId, score: x[0].score }; }).slice(0, 50);
};
exports.getPeaks = getPeaks;
const computeKurtosis = (numbers) => {
    return kurtosisFunction(numbers);
};
exports.computeKurtosis = computeKurtosis;
