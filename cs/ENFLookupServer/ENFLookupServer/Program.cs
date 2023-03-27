// See https://aka.ms/new-console-template for more information

using System;
using System.Threading;
using CommandLine;
using ENFLookup;
using ENFLookupServer;

ENFLookup.ENFLookupServer server = null;


Console.WriteLine("ENF Lookup Server");
Console.WriteLine();
Console.WriteLine("Loading frequency data...");
var freqDbReader = new FsFreqDbReader(LookupHelpers.GetDataFolder() + "/GB.freqdb");
var deFreqDbReader = new FsFreqDbReader(LookupHelpers.GetDataFolder() + "/DE.freqdb");
//var xyFreqDbReader = new FsFreqDbReader(LookupHelpers.GetDataFolder() + "/XY_50_20140101.freqdb");
Console.WriteLine("Frequency data loaded");

var lookupRequestHandler = new LookupRequestHandler();
lookupRequestHandler.AddFreqDbReader(freqDbReader);
lookupRequestHandler.AddFreqDbReader(deFreqDbReader);
//lookupRequestHandler.AddFreqDbReader(xyFreqDbReader);

Parser.Default.ParseArguments<CommandLineOptions>(args)
    .WithParsed(async commandLineOptions =>
    {
        try
        {
            foreach (var grid in commandLineOptions.Grids)
            {
                lookupRequestHandler.AddFreqDbReader(new FsFreqDbReader(grid));
            }

            server = new ENFLookup.ENFLookupServer(commandLineOptions.Port);
            server.SetLookupRequestHandler(lookupRequestHandler);

            Console.WriteLine("Starting server...");
            await server.Start();
            Console.WriteLine($"Server started on port {server.Port}. Awaiting requests. Press any key to quit.");
            var keepRunning = true;
            while (keepRunning)
            {
                Thread.Sleep(1000);
                if (!Console.IsInputRedirected && Console.KeyAvailable)
                {
                    var data = Console.ReadKey();
                    if (data != null)
                    {
                        keepRunning = false;
                    }
                }
            }
        }
        catch (Exception e)
        {
            Console.WriteLine($"Unhandled exception: {e.Message}");
            Console.WriteLine(e.StackTrace);
        }
        finally
        {
            Console.WriteLine("Closing server...");
            if (server != null)
            {
                server.Stop();
                server.Dispose();
            }

            Console.WriteLine("Done. Bye.");
        }
    });