import {TcpClient} from "./tcpClient";
import path from "path";
import {getENFDataDirectory} from "../dataDownloader/ENFDataDirectory";
import {TcpOptions} from "../lookup/tcpOptions";

describe('tcpClient', () => {
    it('Can load large grid', async () => {
        const port = 50020;
        const options = new TcpOptions();
        options.port = port;
        options.grids = {
            "DE":path.resolve(getENFDataDirectory(),"DE.freqdb")
        }
        const tcpClient = new TcpClient(options);
        let loadedGrids = false;
        try {
            await tcpClient.activateServer();
            loadedGrids = true;
        }
        finally {
            await tcpClient.stop();
        }
        expect(loadedGrids).toBe(true);
    }, 30000)
});