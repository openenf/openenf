// Executables must have the following defined if the library contains
// doctest definitions. For builds with this disabled, e.g. code shipped to
// users, this can be left out.
#ifdef ENABLE_DOCTEST_IN_LIBRARY
#define DOCTEST_CONFIG_IMPLEMENT
#include "doctest/doctest.h"
#include <thread>
#endif

#include <iostream>
#include <cstdlib>
#include "CLI11.hpp"

#include "exampleConfig.h"
#include "../src/FreqDbReader.h"

/*
 * Simple main program that demonstrates how access
 * CMake definitions (here the version number) from source code.
 */
int main(int argc, char **argv) {
    CLI::App app{"ENF Lookup"};

    std::string freqDbPath;
    app.add_option("-d,--db",freqDbPath,"Path to a .freqDB file")
        ->required()
        ->check(CLI::ExistingFile);

    std::string freqsStr;
    app.add_option("-f,--freqs",freqsStr, "A comma separated list of frequencies and NULLs")
        ->required();

    std::string outputPath;
    app.add_option("-o,--out", outputPath, "The path to the output file")
        ->required()
        ->check(CLI::NonexistentPath);

    int startTs = 0;
    app.add_option("-s,--start", startTs, "The offset time to start searching from");

    int endTs = 0;
    app.add_option("-e,--end", endTs, "The offset time to search to");

    CLI11_PARSE(app, argc, argv)

    std::vector<int16_t> freqs; // Declare vector to store values
    std::stringstream ss(freqsStr); // Create a stringstream from the input string
    int16_t value;
    char separator = ',';
    while (ss >> value) { // Read values from the stringstream
        freqs.push_back(value); // Add value to the vector
        ss >> separator; // Read the comma separator
    }

    FsFreqDbReader fsFreqDbReader = FsFreqDbReader(freqDbPath);
    if (endTs == 0) {
        endTs = fsFreqDbReader.freqDbMetaData.endDate - fsFreqDbReader.freqDbMetaData.startDate;
    }
    unsigned int numCores = std::thread::hardware_concurrency();
    std::cout << "Executing lookup. Start: " << startTs << " End: " << endTs << " Cores: " << numCores << std::endl;
    std::vector<LookupResult> results = fsFreqDbReader.lookup(freqs, 1000, startTs, endTs,numCores );

    std::ofstream outfile;
    outfile.open(outputPath);
    outfile << "[";
    for(unsigned long i = 0; i < results.size(); i++) {
        LookupResult r = results[i];
        outfile << "{position:" << r.position << ",score:" << r.score << "}";
        if (i != results.size() - 1) {
            outfile << ",";
        }
    }
    outfile << "]";
    outfile.close();

    return 0;
}
