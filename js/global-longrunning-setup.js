const { TcpLookupServerController } = require('./src/tcpClient/tcpLookupServerController');
const { getDefaultExecutablePath } = require('./src/tcpClient/tcpClientUtils');
const path = require("path");
const {verifyApplicationData} = require("./src/dataDownloader/downloadData");

const port = 49170;
let serverController;

module.exports = async function globalSetup() {
    if (!(await TcpLookupServerController.ServerRunningOnPort(port))) {
        const grids = await verifyApplicationData();
        serverController = new TcpLookupServerController(port, getDefaultExecutablePath(),grids);
        await serverController.start();
        global.serverController = serverController;
    }
};
