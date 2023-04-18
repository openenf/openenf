using System.Net.Sockets;
using System.Text;
using FluentAssertions;
using Newtonsoft.Json;


namespace ENFLookup.test;

public class ENFLookupServerTests
{
    [Fact]
    public void CanPassLookupRequestToHandler()
    {
        Stream? stream = null;
        TcpClient? client = null;
        ENFLookupServer? server = null;
        try
        {
            var port = ENFLookupServer.DefaultPort + 2;
            var mockLookupRequestHandler = new MockLookupRequestHandler();
            server = new ENFLookupServer(mockLookupRequestHandler, port);
            server.Start();

            client = new TcpClient("127.0.0.1", port);
            var lookupRequest = new LookupRequest
            {
                Freqs = new[] { 1m, 2m, 3m, 4m }.Select(x => new decimal?(x)).ToArray(),
                GridIds = new[] { "XX" },
                StartTime = new DateTime(2010, 1, 1),
                EndTime = new DateTime(2020, 1, 1)
            };

            var command = ENFLookupServerCommand.Lookup;
            var requestString = $"{(int)command}{JsonConvert.SerializeObject(lookupRequest)}";
            var data = Encoding.ASCII.GetBytes(requestString);

            stream = client.GetStream();
            stream.Write(data, 0, data.Length);

            data = new byte[256];
            var bytes = stream.Read(data, 0, data.Length);
            var responseData = Encoding.ASCII.GetString(data, 0, bytes);
            responseData.Should().Be("[]");

            mockLookupRequestHandler.LookupRequest.Should().BeEquivalentTo(lookupRequest);
        }
        finally
        {
            stream?.Close();
            client?.Close();
        
            server?.Stop();
            server?.Dispose();
        }
    }

    [Fact]
    public void CanPingENFLookupServerOnSpecifiedPort()
    {
        Stream? stream = null;
        TcpClient? client = null;
        ENFLookupServer? server = null;
        try
        {
            var port = 50001;
            var mockLookupRequestHandler = new MockLookupRequestHandler();
            server = new ENFLookupServer(mockLookupRequestHandler, port);
            server.Start();
            client = new TcpClient("127.0.0.1", port);

            // Send the message to the server
            stream = client.GetStream();

            var message = ENFLookupServerCommand.Ping;
            var data = Encoding.ASCII.GetBytes(((int)message).ToString());
            stream.Write(data, 0, data.Length);

            data = new byte[256];
            var bytes = stream.Read(data, 0, data.Length);
            var responseData = Encoding.ASCII.GetString(data, 0, bytes);
            responseData.Should().Be("pong");
        }
        finally
        {
            stream?.Close();
            client?.Close();
        
            server?.Stop();
            server?.Dispose();
        }
    }
}
