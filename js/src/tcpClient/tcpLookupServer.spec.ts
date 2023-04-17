import net from "net";
import {LookupCommand} from "../lookup/lookupCommand";
import {TcpLookupServerController} from "./tcpLookupServerController";
import {getDefaultExecutablePath} from "./tcpClientUtils";

describe('tcpLookupServer', () => {

    it('Can start', (done) => {
        const port = 50003;
        const tcpLookupServer = new TcpLookupServerController(port, getDefaultExecutablePath());
        let socket: net.Socket;
        let onErrorFired = false;
        let dataReceived = "";
        tcpLookupServer.start().then(() => {
            socket = new net.Socket();
            socket.connect(port, '127.0.0.1', () => {
                socket.write(LookupCommand.ping.toString());
            });

            socket.on('data', (data) => {
                dataReceived = `${data}`;
                tcpLookupServer?.stop();
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

    it('Fires server message event', async () => {
        const port = 50004;
        const tcpLookupServer = new TcpLookupServerController(port, getDefaultExecutablePath());
        try {
            let serverMessageReceived = false;
            tcpLookupServer.serverMessageEvent.addHandler(async () => {
                if (!serverMessageReceived) {
                    serverMessageReceived = true;
                    await tcpLookupServer.stop()
                }
            })
            await tcpLookupServer.start()
            expect(serverMessageReceived).toBe(true);
        }
        finally {
            await tcpLookupServer.stop()
        }
    })

    it('Fires server message event', async () => {
        const port = 50004;
        const tcpLookupServer = new TcpLookupServerController(port, getDefaultExecutablePath());
        try {
            let serverMessageReceived = false;
            tcpLookupServer.serverMessageEvent.addHandler(async () => {
                if (!serverMessageReceived) {
                    serverMessageReceived = true;
                    await tcpLookupServer.stop()
                }
            })
            await tcpLookupServer.start()
            expect(serverMessageReceived).toBe(true);
        }
        finally {
            await tcpLookupServer.stop()
        }
    })
})