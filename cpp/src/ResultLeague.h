#pragma once

#include <vector>
#include <mutex>

/// An always-sorted array with a fixed max size.
class ResultLeague {
private:
    unsigned int max_size;
    std::mutex mutex_;

public:

    /// A vector-of-vectors containing the results. Each result contains two elements. The first is the match score,
    /// the second is the position within the grid frequency array (or the number seconds since the start-date of the grid database).
    /// The results are sorted from lowest (i.e. closest match) to highest
    std::vector<std::vector<int>> results;

    /// Pass the maximum required size of the ResultLeague into the constructor. A maximum of 1000 results is usually plenty
    explicit ResultLeague(unsigned int max_size);

    /// Add a new result to the league. If the current number of results is less than the max_size, the result will always be added.
    /// If the result league is full, the new result will only be added if it's score is lower than the current maximum
    void add(int score, int position);
};
