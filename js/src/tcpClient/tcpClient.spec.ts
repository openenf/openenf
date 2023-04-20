import {TcpClient} from "./tcpClient";
import {TcpOptions} from "../lookup/tcpOptions";
import {TcpLookupServerController} from "./tcpLookupServerController";
import {getDefaultExecutablePath} from "./tcpClientUtils";

describe('tcpClient', () => {
    it('Can ping server', async () => {
        const port = 50035;
        const tcpServerController = new TcpLookupServerController(port, getDefaultExecutablePath());
        let serverResponse: any;
        try {
            await tcpServerController.start()
            const options = new TcpOptions();
            options.port = port;
            const tcpClient = new TcpClient(options);
            serverResponse = await tcpClient.ping().catch(e => {
                console.error(e);
            })
        } finally {
            await tcpServerController.stop();
        }
        expect(serverResponse.response).toBe('pong');
    })
    it('Can handle suspended server', async () => {
        const port = 50036;
        const tcpServerController = new TcpLookupServerController(port, getDefaultExecutablePath());
        let error:any;
        await tcpServerController.start();
        console.log('Started server');
        await tcpServerController.suspend();
        console.log('Suspended server');
        const options = new TcpOptions();
        options.port = port;
        const tcpClient = new TcpClient(options);
        await tcpClient.ping().catch(e => {
            error = e;
        }).finally(async () => {
            await tcpServerController.stop();
        })
        expect(error.message).toBe("Timeout after 2000 ms");
    }, 10000)
    it('Can get metadata from grids', async () => {
        const options = new TcpOptions();
        const tcpClient = new TcpClient(options);
        let metadata;
        metadata = await tcpClient.getMetaData("GB");
        expect(metadata).toStrictEqual({
            "baseFrequency": 50,
            "endDate": 1669852800,
            "gridId": "GB",
            "startDate": 1388534400
        });
    })
    it('Can handle error and resume', async () => {
        const options = new TcpOptions();
        const tcpClient = new TcpClient(options);
        let error:any;
        await tcpClient.request("THIS_WILL_THROW_AN_ERROR").catch(e => {
            error = e;
        })
        const response:any = await tcpClient.ping();
        expect(error.message.indexOf("TCP SERVER ERROR: Input string was not in a correct format.")).toBe(0);
        expect(response.response).toBe("pong");
    })
})