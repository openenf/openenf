import net from "net";
import {LookupCommand} from "../lookup/lookupCommand";
import {TcpLookupServerController} from "./tcpLookupServerController";
import {getDefaultExecutablePath} from "./tcpClientUtils";

describe('tcpLookupServer', () => {
    it('Can start and ping server', (done) => {
        const port = 50003;
        const tcpLookupServer = new TcpLookupServerController(port, getDefaultExecutablePath(),[]);
        let socket: net.Socket;
        let onErrorFired = false;
        let dataReceived = "";
        tcpLookupServer.start().then(() => {
            socket = new net.Socket();
            socket.connect(port, '127.0.0.1', () => {
                socket.write(LookupCommand.ping.toString());
            });

            socket.on('data', async (data) => {
                dataReceived = `${data}`;
                await tcpLookupServer?.stop();
            });

            socket.on('error', (error) => {
                onErrorFired = true;
                console.error(`Socket error: ${error}`);
            });

            socket.on('close', () => {
                expect(dataReceived).toBe("pong");
                expect(onErrorFired).toBeFalsy();
                done();
            })
        })
    })
    it('Can build parameter array', () => {
        const port = 1234;
        const grids = ["/file path/one","/file path/two"];
        const result = TcpLookupServerController.buildParameterArray(port, grids);
        expect(result).toStrictEqual(["--port=1234","--grids=/file path/one","--grids=/file path/two"]);
    })
    it('Fires server message event', async () => {
        const port = 50004;
        const tcpLookupServer = new TcpLookupServerController(port, getDefaultExecutablePath(),[]);
        let serverMessageReceived = "";
        try {
            tcpLookupServer.serverMessageEvent.addHandler(async (m) => {
                if (!serverMessageReceived && m) {
                    serverMessageReceived = m;
                }
            })
            await tcpLookupServer.start()
        }
        finally {
            await tcpLookupServer.stop()
        }
        expect(serverMessageReceived).not.toBeFalsy();
    })
    it('Can suspend and resume server', async () => {
        const port = 50009;
        const tcpLookupServer = new TcpLookupServerController(port, getDefaultExecutablePath(),[]);
        await tcpLookupServer.start();
        await tcpLookupServer.resume(); //Should have no effect
        await tcpLookupServer.suspend();
        await tcpLookupServer.suspend(); //Should have no effect
        await tcpLookupServer.resume();
        await tcpLookupServer.stop();
    }, 10000)
    it('Can check if a server is running on a specific port', async () => {
        const port = 50019;
        const tcpLookupServer = new TcpLookupServerController(port, getDefaultExecutablePath(),[]);
        await tcpLookupServer.start();
        const runningOnPort50019 = await TcpLookupServerController.ServerRunningOnPort(50019);
        const runningOnPort50029 = await TcpLookupServerController.ServerRunningOnPort(50029);
        expect(runningOnPort50019).toBe(true);
        expect(runningOnPort50029).toBe(false);
        await tcpLookupServer.stop();
    }, 10000)
})