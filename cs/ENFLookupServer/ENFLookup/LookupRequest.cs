namespace ENFLookup;

/// <summary>
/// Represents a request to find the closest match(es) to the <see cref="Freqs"/> sequence across the grids specified in
/// <see cref="GridIds"/> and over the time frame specified by <see cref="StartTime"/> and <see cref="EndTime"/>. If
/// no StartTime is specified the request will be from the start of each grid. If no EndTime is specified the request will
/// be to the end of each grid.
/// </summary>
public class LookupRequest
{
    public decimal?[] Freqs { get; set; } = Array.Empty<decimal?>();
    public string[] GridIds { get; set; } = Array.Empty<string>();
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
}