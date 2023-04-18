const { TcpLookupServerController } = require('./src/tcpClient/tcpLookupServerController');
const { getDefaultExecutablePath } = require('./src/tcpClient/tcpClientUtils');

const port = 49170;
let serverController;

module.exports = async function globalSetup() {
    if (!(await TcpLookupServerController.ServerRunningOnPort(port))) {
        console.log('Starting test server');
        serverController = new TcpLookupServerController(port, getDefaultExecutablePath());
        await serverController.startWithGrids();
        global.serverController = serverController;
    }
};
