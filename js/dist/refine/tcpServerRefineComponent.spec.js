"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const tcpServerRefineComponent_1 = require("./tcpServerRefineComponent");
const tcpServerComponentOptions_1 = require("../lookup/tcpServerComponentOptions");
const testUtils_1 = require("../testUtils");
describe("TcpServerRefineComponent", () => {
    it("can refine results for the truncated GB_50_Jan2014 grid", async () => {
        const freqs = [-7, -6, -2, -2, 1, 2, 5, 1, 1, 3, 4, 4, 5, 5, 6, 4, 2, 1, -4, -5, -9, -11, -14, -13, -15, -15, -19, -25, -26, -31, -35, -38, -39, -39, -38, -40, -40, -38, -37, -38, -38, -40, -41, -41, -44, -46, -46, -44, -47, -46, -48, -49, -48, -48, -48, -46, -45, -47, -47, -49, -49, -50, -50, -52, -53, -51, -53, -51, -49, -46, -46, -44, -44, -42, -39, -40, -39, -37, -39, -36, -36, -37, -36, -37, -36, -37, -37, -36, -33, -31, -29, -29, -28, -26, -25, -23, -23, -22, -22, -21];
        const denormalisedFreqs = freqs.map(x => 50 + (x / 100.0));
        const lookupResults = [
            { score: 0, position: 1339200, gridId: 'GB' },
            { score: 152, position: 1339199, gridId: 'GB' },
            { score: 155, position: 1339201, gridId: 'GB' },
            { score: 247, position: 1339198, gridId: 'GB' },
            { score: 253, position: 1339202, gridId: 'GB' },
            { score: 339, position: 1339197, gridId: 'GB' },
            { score: 391, position: 1239197, gridId: 'GB' }
        ];
        const tcpServerComponentOptions = new tcpServerComponentOptions_1.TcpServerComponentOptions();
        tcpServerComponentOptions.executablePath = (0, testUtils_1.getTestExecutablePath)();
        const dbPath = path_1.default.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb");
        tcpServerComponentOptions.grids["GB"] = dbPath;
        const refineComponent = new tcpServerRefineComponent_1.TcpServerRefineComponent(tcpServerComponentOptions);
        const results = await refineComponent.refine(denormalisedFreqs, lookupResults);
        expect(results).toStrictEqual([
            {
                gridId: 'GB',
                kurtosis: -0.9663522861655578,
                normalisedScore: 0,
                score: 0,
                time: new Date("2014-01-16T12:00:00.000Z")
            },
            {
                gridId: "GB",
                kurtosis: -0.4592466438748986,
                normalisedScore: 3.91,
                score: 391,
                time: new Date("2014-01-15T08:13:17.000Z"),
            }
        ]);
    });
});
