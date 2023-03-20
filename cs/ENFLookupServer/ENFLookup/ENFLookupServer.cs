using System.Net;
using System.Net.Sockets;
using System.Text;
using Newtonsoft.Json;

namespace ENFLookup;

public class ENFLookupServer
{
    private TcpListener _tcpListener = null;
    private Thread _listenerThread;
    private bool _shouldStop;
    private bool _started;
    private ILookupRequestHandler _lookupRequestHandler;

    void HandleClient(TcpClient client)
    {
        // Get the client stream
        NetworkStream stream = client.GetStream();

        // Read the incoming message
        var buffer = new byte[256];
        var messageBuilder = new StringBuilder();
        do
        {
            var bytesRead = stream.Read(buffer, 0, buffer.Length);
            messageBuilder.Append(Encoding.ASCII.GetString(buffer, 0, bytesRead));
        } while (stream.DataAvailable);

        var message = messageBuilder.ToString();
        var messageType = (ENFLookupServerCommands)int.Parse(message.Substring(0, 1));
        string responseString = "";
        switch (messageType)
        {
            case ENFLookupServerCommands.Ping:
                responseString = "pong";
                break;
            case ENFLookupServerCommands.Lookup:
                var requestBody = JsonConvert.DeserializeObject<LookupRequest>(message.Substring(1));
                if (_lookupRequestHandler != null)
                {
                    _lookupRequestHandler.Lookup(requestBody);
                }
                break;
            default:
                throw new NotImplementedException($"Unable to handle message of type: {messageType}");
        }

        // Send a response back to the client
        var response = Encoding.ASCII.GetBytes(responseString);
        stream.Write(response, 0, response.Length);

        // Close the connection
        client.Close();
    }

    public async Task Start()
    {
        if (_started || _tcpListener != null)
        {
            return;
        }
        // Set the TcpListener on port 4200
        var port = DefaultPort;
        var localAddr = IPAddress.Parse("127.0.0.1");
        _tcpListener = new TcpListener(localAddr, port);

        // Start listening for client requests
        _tcpListener.Start();
        
        _listenerThread = new Thread(async () =>
        {

            // Enter the listening loop
            while (!_shouldStop)
            {
                // Accept the client connection
                TcpClient client = await _tcpListener.AcceptTcpClientAsync();
                Thread t = new Thread(() => HandleClient(client));
                t.Start();
                _started = true;
            }
        });
        _listenerThread.Start();
    }

    public static int DefaultPort =>
        49170; //49170 is an ephemeral port and may change to something below 49152 in the future.

    public void Stop()
    {
        if (_listenerThread != null)
        {
            _shouldStop = true;
            _listenerThread = null;
        }

        if (_tcpListener != null)
        {
            _tcpListener.Stop();
        }

        _started = false;
    }

    public void Dispose()
    {
        Stop();
        _tcpListener = null;
    }

    public void SetLookupRequestHandler(ILookupRequestHandler lookupRequestHandler)
    {
        _lookupRequestHandler = lookupRequestHandler;
    }
}