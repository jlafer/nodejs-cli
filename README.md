# jlafer-gooddata-cli

This is my collection of CLIs and utility functions that I find useful when working with the GoodData API.

## Installation

    npm install

Edit src/cfg.js to set BASE_API_URL to the URL of your GoodData API. This will either be https://secure.gooddata.com/ for the standard GoodData cloud service or the white-label URL of your data provider (e.g., https://analytics.ytica.com/). Note that the trailing slash is required.

## Command-line Interfaces
Documentation on suggested usage of the CLIs can be found at the top of their respective source files.

### getmeta
CLI for querying and displaying GoodData report defns and other metadata. The data returned is needed for executing the 'rptexport' script.

Please run 'node src/getmeta --help' at the NodeJS command-line to see command-line options and arguments.

### rptexport
CLI for executing and exporting a report, with support for dynamic filters. The resulting .csv file is stored in the /tmp folder.

Please run 'node src/rptexport --help' at the NodeJS command-line to see command-line options and arguments.
