using System.Net.Sockets;
using System.Text;
using FluentAssertions;
using Newtonsoft.Json;

namespace ENFLookup.test;

public class ENFLookupServerTests : IAsyncLifetime
{
    public ENFLookupServerTests()
    {
        _server = new ENFLookupServer();
        _server.Start();
    }
    
    private readonly ENFLookupServer _server;

    [Fact]
    public async Task CanPingENFLookupServerOnDefaultPort()
    {
        var client = new TcpClient("127.0.0.1", ENFLookupServer.DefaultPort);

        // Send the message to the server
        var stream = client.GetStream();
        
        var message = ENFLookupServerCommands.Ping;
        var data = Encoding.ASCII.GetBytes(((int)message).ToString());
        stream.Write(data, 0, data.Length);
        
        data = new byte[256];
        var responseData = string.Empty;
        var bytes = stream.Read(data, 0, data.Length);
        responseData = Encoding.ASCII.GetString(data, 0, bytes);
        responseData.Should().Be("pong");
        
        stream.Close();
        client.Close();
    }

    [Fact]
    public async Task CanPassLookupRequestToHandler()
    {
        var mockLookupRequestHandler = new MockLookupRequestHandler();
        _server.SetLookupRequestHandler(mockLookupRequestHandler);
        var client = new TcpClient("127.0.0.1", ENFLookupServer.DefaultPort);
        var lookupRequest = new LookupRequest
        {
            Freqs = new []{1m,2m,3m,4m}.Select(x => new decimal?(x)).ToArray(),
            GridIds = new []{"XX"},
            StartTime = new DateTime(2010,1,1),
            EndTime = new DateTime(2020,1,1)
        };
        
        var command = ENFLookupServerCommands.Lookup;
        var requestString = $"{(int)command}{JsonConvert.SerializeObject(lookupRequest)}";
        var data = Encoding.ASCII.GetBytes(requestString);
        
        var stream = client.GetStream();
        stream.Write(data, 0, data.Length);
        
        data = new byte[256];
        var responseData = string.Empty;
        var bytes = stream.Read(data, 0, data.Length);
        responseData = Encoding.ASCII.GetString(data, 0, bytes);
        responseData.Should().Be("");

        mockLookupRequestHandler.LookupRequest.Should().BeEquivalentTo(lookupRequest);
        
        stream.Close();
        client.Close();
    }

    public async Task InitializeAsync()
    {
    }

    public async Task DisposeAsync()
    {
        //_server.Stop();
        //_server.Dispose();
    }
}
