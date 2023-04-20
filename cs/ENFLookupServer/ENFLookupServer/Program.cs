// See https://aka.ms/new-console-template for more information

using ENFLookup;

namespace MyProject;

class Program
{
    public static void Main(string[] grids, int port = 49170)
    {
        ENFLookupServer? server = null;
        Console.WriteLine($"ENF Lookup Server. Port {port}");
        Console.WriteLine();
        var lookupRequestHandler = new LookupRequestHandler();
        try
        {
            Console.WriteLine("Loading frequency data...");
            foreach (var grid in grids)
            {
                var freqDbReader = new FsFreqDbReader(grid);
                lookupRequestHandler.AddFreqDbReader(freqDbReader);
            }

            server = new ENFLookupServer(lookupRequestHandler, port);

            Console.WriteLine("Starting server...");
            server.Start();
            Console.WriteLine(
                $"Server started on port {server.Port}. Awaiting requests. Press any key to quit.");
            var keepRunning = true;
            while (keepRunning)
            {
                Thread.Sleep(1000);
                var key = Console.ReadLine().FirstOrDefault();
                if (key == 'S')
                {
                    if (!server.Suspended)
                    {
                        server.Suspend();
                    }
                    else
                    {
                        server.Resume();
                    }
                }
                else
                {
                    keepRunning = false;
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
    }
}
