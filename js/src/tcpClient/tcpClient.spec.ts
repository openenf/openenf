import {TcpClient} from "./tcpClient";
import {getTestExecutablePath} from "../testUtils";
import net from "net";
import {LookupCommand} from "../lookup/lookupCommand";
import path from "path";

const sleep = async (ms:number):Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        },ms)
    })
}

describe('tcpClient', () => {
    it('Can load grids', async () => {
        const port = 50020;
        const tcpClient = new TcpClient(port,"127.0.0.1");
        const executablePath = getTestExecutablePath();
        await tcpClient.activateServer(executablePath, port);
        const grids = {
            "GB":path.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb")
        }
        await tcpClient.loadGrids(grids);
        //Nothing to assert here. If the method completes ok we assume the grid is loaded
    })
    it('Can spawn a server', (done) => {
        const port = 50001;
        const tcpClient = new TcpClient(port,"127.0.0.1");
        const executablePath = getTestExecutablePath();
        let socket:net.Socket;
        let onErrorFired = false;
        let dataReceived = "";
        tcpClient.activateServer(executablePath, port).then(() => {
            socket = new net.Socket();
            socket.connect(port, '127.0.0.1', () => {
                socket.write(LookupCommand.ping.toString());
            });

            socket.on('data', (data) => {
                dataReceived = `${data}`;
                tcpClient.stop();
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
    it('Receives messages from server console', async () => {
        const port = 50030;
        const tcpClient = new TcpClient(port, "127.0.0.1");
        let serverMessageEventFired = false;
        try {
            tcpClient.serverMessageEvent.addHandler(s => {
                serverMessageEventFired = true;
            })
            await tcpClient.activateServer(getTestExecutablePath(), port);
        }
        catch (e) {
            console.error(e)
        }
        finally {
            await tcpClient.stop();
        }
        expect(serverMessageEventFired).toBe(true);
    })
})