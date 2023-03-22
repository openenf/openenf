using System.Net.Sockets;
using System.Text;
using FluentAssertions;
using Newtonsoft.Json;
using Xunit.Abstractions;

namespace ENFLookup.test;

public class IntegrationTest
{
    private readonly ITestOutputHelper _testOutputHelper;

    public IntegrationTest(ITestOutputHelper testOutputHelper)
    {
        _testOutputHelper = testOutputHelper;
    }

    [Fact]
    [Trait("Category","Long-running")]
    public async Task CanDoCompleteLookup()
    {
        var lookupFreqs =
            JsonConvert.DeserializeObject<short[]>(File.ReadAllText("TestResources/DEFreqs404956000.json"));
        var gbFreqDbReader = new FsFreqDbReader(Path.Combine(LookupHelpers.GetDataFolder(), "GB_50_2014-2021.freqdb"));
        var deFreqDbReader =
            new FsFreqDbReader(Path.Combine(LookupHelpers.GetDataFolder(), "DE_50_20091231230000.freqdb"));

        var lookupRequestHandler = new LookupRequestHandler();
        lookupRequestHandler.AddFreqDbReader(gbFreqDbReader);
        lookupRequestHandler.AddFreqDbReader(deFreqDbReader);

        var server = new ENFLookupServer();
        server.SetLookupRequestHandler(lookupRequestHandler);

        await server.Start();

        var client = new TcpClient("127.0.0.1", ENFLookupServer.DefaultPort);
        var lookupFreqsAsDecimal = lookupFreqs.Select(x => (decimal?)(50 + x / 1000.0)).ToArray();

        var lookupRequest = new LookupRequest
        {
            Freqs = lookupFreqsAsDecimal,
            GridIds = new[] { "GB","DE" },
            StartTime = new DateTime(2014, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            EndTime = new DateTime(2030, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        var command = ENFLookupServerCommands.Lookup;
        var requestJson = JsonConvert.SerializeObject(lookupRequest);
        var requestString = $"{(int)command}{requestJson}";
        var data = Encoding.ASCII.GetBytes(requestString);
        var stream = client.GetStream();
        stream.Write(data, 0, data.Length);

        var responseStr = string.Empty;
        while (client.Connected)
        {
            data = new byte[Int16.MaxValue];
            var bytes = stream.Read(data, 0, data.Length);
            responseStr = Encoding.ASCII.GetString(data, 0, bytes);
            _testOutputHelper.WriteLine(responseStr);
        }

        var result = JsonConvert.DeserializeObject<LookupResult[]>(responseStr);
        result[0].Position.Should().Be(404956000);
        result[0].Score.Should().Be(0);
        result[0].GridId.Should().Be("DE");

        stream.Close();
        client.Close();

        server.Stop();
        server.Dispose();
    }
}