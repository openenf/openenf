const { TcpLookupServerController } = require('./src/tcpClient/tcpLookupServerController');
const { getDefaultExecutablePath } = require('./src/tcpClient/tcpClientUtils');
const path = require("path");

const port = 49170;
let serverController;

module.exports = async function globalSetup() {
    if (!(await TcpLookupServerController.ServerRunningOnPort(port))) {
        console.log('Starting test server');
        const testGrid = path.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb");
        serverController = new TcpLookupServerController(port, getDefaultExecutablePath(),[testGrid]);
        await serverController.start();
        global.serverController = serverController;
    }
};
