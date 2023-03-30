// See https://aka.ms/new-console-template for more information

using BenchmarkDotNet.Running;
using ENFLookup.Benchmark;

BenchmarkRunner.Run<LookupBenchmark>();

/*var summary = BenchmarkRunner.Run<LookupBenchmark>();
Console.WriteLine(summary);*/