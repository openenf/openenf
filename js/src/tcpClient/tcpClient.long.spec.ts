import {TcpClient} from "./tcpClient";
import {getTestExecutablePath} from "../testUtils";
import path from "path";
import {getENFDataDirectory} from "../dataDownloader/ENFDataDirectory";

describe('tcpClient', () => {
    it('Can load large grid', async () => {
        const port = 50020;
        const tcpClient = new TcpClient(port,"127.0.0.1");
        const executablePath = getTestExecutablePath();
        let loadedGrids = false;
        try {
            await tcpClient.activateServer(executablePath, port);
            const grids = {
                "DE":path.resolve(getENFDataDirectory(),"DE.freqdb")
            }
            await tcpClient.loadGrids(grids);
            loadedGrids = true;
        }
        finally {
            await tcpClient.stop();
        }
        expect(loadedGrids).toBe(true);
    }, 30000)
});