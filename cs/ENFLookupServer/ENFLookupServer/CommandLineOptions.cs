

using System.Collections.Generic;
using CommandLine;

namespace ENFLookupServer;

public class CommandLineOptions
{
    [Option('p', "port", Required = false, HelpText = "The port number over which the ENF Lookup Server will operate.")]
    public int Port { get; set; } = ENFLookup.ENFLookupServer.DefaultPort;

    [Option(shortName:'n', longName:"noGrids", HelpText = "Prevent the default grids from loading")]
    public bool NoGrids { get; set; }
}