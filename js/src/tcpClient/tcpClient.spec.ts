import {TcpClient} from "./tcpClient";
import path from "path";
import {TcpOptions} from "../lookup/tcpOptions";

describe('tcpClient', () => {
    it('Can get metadata from grids', async () => {
        const options = new TcpOptions();
        options.grids = {
            "GB": path.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb")
        };
        const tcpClient = new TcpClient(options);
        let metadata;
        metadata = await tcpClient.getMetaData("GB");
        expect(metadata).toStrictEqual({"baseFrequency": 50, "endDate": 1669852800, "gridId": "GB", "startDate": 1388534400});
    })
})