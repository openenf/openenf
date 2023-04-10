using System.Net;
using System.Net.Sockets;
using System.Text;
using Newtonsoft.Json;

namespace ENFLookup;

/// <summary>
/// A server accepting requests over TCP to perform ENF lookups. A TCP wrapper around an <see cref="ILookupRequestHandler"/>
/// </summary>
public class ENFLookupServer : IDisposable
{
    /// <summary>
    /// Creates a sever instance.
    /// </summary>
    /// <param name="lookupRequestHandler">The lookupRequestHandler does the actual work.</param>
    /// <param name="port">The port over which the server should operate. Default is currently the ephemeral port 49170 but this could change
    /// in future versions.</param>
    public ENFLookupServer(ILookupRequestHandler lookupRequestHandler, int? port = null)
    {
        Port = port ?? DefaultPort;
        _lookupRequestHandler = lookupRequestHandler;
    }

    private TcpListener? _tcpListener;
    private Task? _listenerTask;
    private bool _shouldStop;
    private bool _started;
    private readonly ILookupRequestHandler _lookupRequestHandler;

    /// <summary>
    /// The port over which the server is operating. Default is currently the ephemeral port 49170 but this could change
    /// in future versions.
    /// </summary>
    public int Port { get; }

    private async Task HandleClient(TcpClient client)
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

                responseString = "Ok";
                break;
            case ENFLookupServerCommands.Lookup:
                var lookupRequest = JsonConvert.DeserializeObject<LookupRequest>(message[1..]);
                var lookupResults = await _lookupRequestHandler.Lookup(lookupRequest,
                    d =>
                    {
                        try
                        {
                            stream.Write(Encoding.ASCII.GetBytes($"Progress: {d}"));
                        }
                        catch (IOException e)
                        {
                            Console.WriteLine(
                                $"Exception writing to stream: {e.GetType()}, Connected: {stream.Socket.Connected}");
                            cancellationTokenSource.Cancel();
                        }
                    }, cancellationTokenSource.Token);
                responseString = JsonConvert.SerializeObject(lookupResults);

                break;
            case ENFLookupServerCommands.ComprehensiveLookup:
                var comprehensiveLookupRequest =
                    JsonConvert.DeserializeObject<ComprehensiveLookupRequest>(message[1..]);
                var results = await _lookupRequestHandler.ComprehensiveLookup(comprehensiveLookupRequest);
                responseString = JsonConvert.SerializeObject(results);
                break;
            case ENFLookupServerCommands.GetMetaData:
                var gridId = JsonConvert.DeserializeObject<string>(message[1..]);
                var metaData = _lookupRequestHandler.GetMetaData(gridId);
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

    /// <summary>
    /// Starts listening for TCP requests on the specified port.
    /// </summary>
    public void Start()
    {
        if (_started || _tcpListener != null)
        {
            return;
        }

        var localAddr = IPAddress.Parse("127.0.0.1");
        _tcpListener = new TcpListener(localAddr, Port);

        _tcpListener.Start();
        _listenerTask = Task.Run(async () =>
        {
            // Enter the listening loop
            while (!_shouldStop)
            {
                // Accept the client connection
                try
                {
                    var client = await _tcpListener.AcceptTcpClientAsync();
                    await Task.Run(() => HandleClient(client));
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
    }

    /// <summary>
    /// The port over which the server should operate. Default is currently the ephemeral port 49170 but this could change
    /// in future versions.
    /// </summary>
    public static int DefaultPort =>
        49170; //49170 is an ephemeral port and may change to something below 49152 in the future.

    /// <summary>
    /// Stops the server listening for TCP requests.
    /// </summary>
    public void Stop()
    {
        if (_listenerTask != null)
        {
            _shouldStop = true;
            _listenerTask = null;
        }

        if (_tcpListener != null)
        {
            _tcpListener.Stop();
        }

        _started = false;
    }

    //Disposes the server.
    public void Dispose()
    {
        Stop();
        _tcpListener = null;
        GC.SuppressFinalize(this);
    }
}