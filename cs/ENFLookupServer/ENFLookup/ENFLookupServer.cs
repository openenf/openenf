using System.Net;
using System.Net.Sockets;
using System.Text;
using Newtonsoft.Json;

namespace ENFLookup;

public class ENFLookupServer
{
    public ENFLookupServer(int? port = null)
    {
        Port = port ?? DefaultPort;
    }

    private TcpListener _tcpListener = null;
    private Thread _listenerThread;
    private bool _shouldStop;
    private bool _started;
    private ILookupRequestHandler _lookupRequestHandler;
    public int Port { get; private set; }

    void HandleClient(TcpClient client)
    {
        var cancellationTokenSource = new CancellationTokenSource();
        // Get the client stream
        NetworkStream stream = client.GetStream();
        // Read the incoming message*/
        var buffer = new byte[256];
        var messageBuilder = new StringBuilder();
        do
        {
            var bytesRead = stream.Read(buffer, 0, buffer.Length);
            messageBuilder.Append(Encoding.ASCII.GetString(buffer, 0, bytesRead));
        } while (stream.DataAvailable);

        var message = messageBuilder.ToString();
        var messageType = (ENFLookupServerCommands)int.Parse(message[..1]);
        string responseString = "";
        switch (messageType)
        {
            case ENFLookupServerCommands.Ping:
                responseString = "pong";
                break;
            case ENFLookupServerCommands.LoadGrid:
                var freqDbFilePath = JsonConvert.DeserializeObject<string>(message[1..]);
                if (_lookupRequestHandler is ICanAddDbReader iCanAddDbReader)
                {
                    Console.WriteLine($"Loading grid file at {freqDbFilePath}");
                    iCanAddDbReader.AddFreqDbReader(new FsFreqDbReader(freqDbFilePath));
                }

                break;
            case ENFLookupServerCommands.Lookup:
                var lookupRequest = JsonConvert.DeserializeObject<LookupRequest>(message[1..]);
                if (_lookupRequestHandler != null)
                {
                    var results = _lookupRequestHandler.Lookup(lookupRequest,
                        d =>
                        {
                            try
                            {
                                stream.Write(Encoding.ASCII.GetBytes($"Progress: {d}"));
                            }
                            catch(IOException e)
                            {
                                Console.WriteLine($"Exception writing to stream: {e.GetType()}, Connected: {stream.Socket.Connected}");
                                cancellationTokenSource.Cancel();
                            }
                        }, cancellationTokenSource.Token);
                    responseString = JsonConvert.SerializeObject(results);
                }

                break;
            case ENFLookupServerCommands.ComprehensiveLookup:
                var comprehensiveLookupRequest =
                    JsonConvert.DeserializeObject<ComprehensiveLookupRequest>(message[1..]);
                if (_lookupRequestHandler != null)
                {
                    var results = _lookupRequestHandler.ComprehensiveLookup(comprehensiveLookupRequest);
                    responseString = JsonConvert.SerializeObject(results);
                }

                break;
            case ENFLookupServerCommands.GetMetaData:
                var gridId = JsonConvert.DeserializeObject<string>(message[1..]);
                FreqDbMetaData metaData = _lookupRequestHandler.GetMetaData(gridId);
                responseString = JsonConvert.SerializeObject(metaData);
                break;
            default:
                throw new NotImplementedException($"Unable to handle message of type: {messageType}");
        }

        // Send a response back to the client
        var response = Encoding.ASCII.GetBytes(responseString);
        if (stream.Socket.Connected)
        {
            stream.Write(response, 0, response.Length);
        }

        // Close the connection
        client.Close();
    }

    public async Task Start()
    {
        if (_started || _tcpListener != null)
        {
            return;
        }

        var localAddr = IPAddress.Parse("127.0.0.1");
        _tcpListener = new TcpListener(localAddr, Port);

        _tcpListener.Start();
        _listenerThread = new Thread(async () =>
        {
            // Enter the listening loop
            while (!_shouldStop)
            {
                // Accept the client connection
                try
                {
                    var client = await _tcpListener.AcceptTcpClientAsync();
                    var t = new Thread(() => HandleClient(client));
                    t.Start();
                    _started = true;
                }
                catch (SocketException e)
                {
                    if (e.SocketErrorCode != SocketError.OperationAborted)
                    {
                        throw;
                    }
                }
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
            try
            {
                _tcpListener.Stop();
            }
            catch (SocketException e)
            {
                throw new Exception(e.SocketErrorCode.ToString());
            }
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