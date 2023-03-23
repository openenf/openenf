

using System.Collections.Generic;
using CommandLine;

namespace ENFLookupServer;

public class CommandLineOptions
{
    [Option('p', "port", Required = false, HelpText = "The port number over which the ENF Lookup Server will operate.")]
    public int Port { get; set; } = ENFLookup.ENFLookupServer.DefaultPort;
    
    [Option('g', "grids", HelpText = "A whitespace-separated list of .freqdb files to use for lookup")]
    public IEnumerable<string> Grids { get; set; }
}