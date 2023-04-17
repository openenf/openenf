import {TcpClient} from "./tcpClient";
import net from "net";
import {LookupCommand} from "../lookup/lookupCommand";
import path from "path";
import {TcpOptions} from "../lookup/tcpOptions";

describe('tcpClient', () => {
    it('Can return error if no executable found at path', async () => {
        const options = new TcpOptions();
        options.port = 50120
        options.executablePath = 'this/does/not/exist';
        const tcpClient = new TcpClient(options);
        let errorMessage = "";
        await tcpClient.activateServer().catch(e => {
            errorMessage = e.message;
        });
        expect(errorMessage).toBe("No TCP Lookup executable found at this/does/not/exist");
    })
    it('Can get metadata from grids', async () => {
        const options = new TcpOptions();
        options.port = 50020
        options.grids = {
            "GB": path.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb")
        };
        const tcpClient = new TcpClient(options);
        let metadata;
        try {
            await tcpClient.activateServer();
            metadata = await tcpClient.getMetaData("GB");
        } finally {
            await tcpClient.stop();
        }
        expect(metadata).toStrictEqual({"baseFrequency": 50, "endDate": 1391212800, "gridId": "GB", "startDate": 1388534400});
    })
    it('Can spawn a server', async () => {
        const options = new TcpOptions();
        options.port = 50001
        const tcpClient = new TcpClient(options);
        let socket: net.Socket;
        let onErrorFired = false;
        let dataReceived = "";
        try {
            await tcpClient.activateServer();
            socket = new net.Socket();
            socket.connect(options.port, '127.0.0.1', () => {
                socket.write(LookupCommand.ping.toString());
            });

            socket.on('data', (data) => {
                dataReceived = `${data}`;
                tcpClient.stop();
            });
        }
        finally {
            await tcpClient.stop()
        }
        expect(dataReceived).toBe("pong");
        expect(onErrorFired).toBeFalsy();
    })
    it('Receives messages from server console', async () => {
        const options = new TcpOptions();
        options.port = 50030
        const tcpClient = new TcpClient(options);
        let serverMessageEventFired = false;
        try {
            tcpClient.serverMessageEvent.addHandler(s => {
                console.log('s', s);
                serverMessageEventFired = true;
            })
            await tcpClient.activateServer();
        } catch (e) {
            console.error(e)
        } finally {
            await tcpClient.stop();
        }
        expect(serverMessageEventFired).toBe(true);
    })
})