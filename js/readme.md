# Open ENF

> Open ENF is an open-source Command Line tool to perform Electrical Network Frequency Analysis on an audio signal.

### What is ENF?

[Electrical Network Frequency Analysis](https://en.wikipedia.org/wiki/Electrical_network_frequency_analysis) is a forensic audio technique
for validating audio recordings by comparing frequency changes in background hum with records of deviations
in an electrical grid's standard operating frequency. Using ENF we can use the hum as a 
time-dependent digital watermark which can allow us to to timestamp recordings with single-second
accuracy. For a more entertaining explanation Tom Scott does a nice explainer here:

[![Tom Scott ENF explainer video](http://img.youtube.com/vi/e0elNU0iOMY/0.jpg)](http://www.youtube.com/watch?v=e0elNU0iOMY "Video Title")

### When is ENF useful?

ENF Analysis can help you to:

- Validate _exactly when_ an audio recording was created
- Detect if an audio recording has been edited or tampered with

ENF Analysis could be useful to you if you are:

- A journalist
- Involved in Open Source intelligence
- A lawyer or a private investigator

### Why OpenENF?

ENF Analysis has been around for at least a decade but no open-source solution 
has existed. The lack of open source code limits access to the technique to just law enforcement 
agencies and a handful of specialist forensic audio firms. The Open ENF project
aims to broaden this access to journalists, open source intelligence specialists
and others.

Additionally, the lack of an open source ENF method limits it's application in a
courtroom setting as potential errors in closed-source analysis are hard to identify
and impossible to effectively cross-examine.

## Installation

Open ENF is a cross-platform command-line tool, distributed via NPM:

```shell
> npm install --global openenf
```

## Usage

Fire up a terminal and do this:

```shell
> enf /path/to/a/wav/file.wav
```

The first time you perform an an analysis `enf` will download grid frequency data. (At the time of writing
this is only for the Central European and Great British grids but we're working on
getting it working for more locations.)

```shell
> Downloading Grid Frequency Data |███████████████████████████████████░|99% || Downloading DE.freqdb
```

After the grid data is downloaded the CLI starts
analyzing the audio...

```shell
> ENF Analysis |████████████████████████████░░░░░░░░░░░░| 70% || Comparing frequencies to grid data...
```

...and finally returns a result:

```shell
ENF Analysis |████████████████████████████████████████| 100% || ENF analysis complete.
Match found.
Best guess for when this audio was recorded:
Tue Apr 25 2017 12:14:08 UTC
Score: 0.74344023323615
Grid: DE
```

For this example, the best estimate for when this recording was made was 25th April 2017 at 13:14 on the
DE (Central European) grid. It has a score of less than 1 which indicates a very
strong match (see _Scoring_ below for a fuller explanation of the score)

### CLI Options

ENF Analysis is very processor-intensive but we can speed up analysis times by
specifying:

- The time period over which we search for a match
- The electrical grids we match against

As an exmaple, if you know your recording was made in Great Britain sometime between 
April and June 2020 you can speed things up a lot by specifying
these parameters in the command line:

```shell
> enf /path/to/a/wav/file.wav --grids GB --start 2020-04-01 --end 2020-06-30
```

The CLI options currently available:

- ``--grids`` The electrical grids you want to search, currently either `GB`, the Great British grid (excluding Northern Ireland) or `DE`, the Central European Grid which covers the majority of countries in Europe.
- ``--start`` The time you want to start searching from. Any Javascript-parseable date will work here.
- ``--end`` The time you want to search up to.

### Limitations

ENF Analysis does not always return a result. The `enf` CLI tool will
fail to return a result if:

- The recording was made far away from an electrical hum source (i.e. the majority of exterior recordings)
- The grid frequency is 60HZ (for example if the recording was made in North America)
- The recording is too short (typically for a good match a recording needs to be _at least_ 3 minutes)
- The recording is noisy (i.e. if there are other sources of low frequency audio, like traffic or music, on the recording)
- The recording was made before January 2010, which is the earliest time for which we have grid frequency information.

Additionally, and especially for short recordings, you may get a result with a low score. These
can be difficult to interpret. See _Scoring_ below:

### Audio formats

At present OpenENF can only handle .wav files. An integration with 
[FFMPEG](https://ffmpeg.org/) is in the works but until that's been
implemented a number of tools exist (for example [Audacity](https://www.audacityteam.org/))
that can help you convert between formats.

### Scoring

Open ENF should currently be considered beta software and we shouldn't regard results
as 100% reliable. One of the _Open Questions_ (below) is how we can return more meaningful
results from an analysis. For now, a result is assigned a single
numerical score. A score close to zero indicates a stronger match.
You can broadly interpret scores as follows:

- **Less than 1** indicates a strong match, especially for a recording of at least 15 minutes duration.
- **1 to 15** indicates a potential match, especially for a recording greater than 15 minutes duration. 
- **Greater than 15** indicates that a match was found, but there's a strong likelihood that this match was just chance. Don't take results like this too seriously.

## Open Questions

There exist a number of questions, the answers to which we greatly improve the usefulness of the tool:

### More Meaningful Scores

It would be great to return a score which gives the liklihood of a match compared to chance, similar to a forensic DNA result.
In other words, the tool would return a result which said something like:

> _"There is 98% chance that this recording was made on 15th August 2017 at 20:15:03"_

### More Grid coverage

At present we can only locate publicly available grid data for:

- The **Central European** grid.
- The **Great British** grid
- The **Nordic** area (i.e. Iceland, Norway, Sweden and Finland)
- The **Ireland** grid (which covers both the Republic and Northern Ireland)

Of these, the Central European and Great British grids are integrated into
the tool, and the Nordic and Irish grids are expected to follow
shortly. However, Open ENF still only works in Europe. Obtaining
North America, Chinese and Russian grid frequency data would greatly extend
the use of Open ENF but public data for these regions is currently
unavailable. Indeed, for some regions it seems unlikely that grid
frequency data will ever be publicly available.

It's possible to record grid frequency data and upload it to the internet using a smartphone.
This technique would allow us 
to obtain grid data from areas where no official source exists. If you are an open-source intelligence analyst who could
help to contribute to a grid frequency database we 
would love to hear from you, especially if you're outside of Europe.

## Contributing

Contributions are most welcome. Technical documentation and a CONTRIBUTING.MD 
are works in progress but here's bullet-pointed overview of the structure of the project:

- The tool is an [NPM Command Line tool](https://blog.npmjs.org/post/118810260230/building-a-simple-command-line-tool-with-npm.html)
- The analysis phase is written in Typescript and uses an adaptive [Goertzel algorithm](https://en.wikipedia.org/wiki/Goertzel_algorithm) to obtain low-frequency audio data
- The lookup phase is written in .Net Core C# and communicates with the Command Line tool over TCP
- Unit tests can be run locally with `npm test` for Typescript and an XUnit test runner within C#
- The integration pipeline runs both the Typescript and C# tests suites for each PR. All tests need to pass before a PR can be considered for approval.