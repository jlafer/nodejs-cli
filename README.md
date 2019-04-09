# jlafer-gooddata-cli

This package provides a CLI -- `gdutil` -- that I find useful when working with the GoodData API to run reports.

## Installation

    npm install

To add `gdutil` to your system path, you can optionally run `npm link` in the project folder. Note: it will likely require root or `sudo` access as it changes the system path.

Edit src/cfg.js to set BASE_GD_URL to the URL of your GoodData API. This will either be https://secure.gooddata.com/ for the standard GoodData cloud service or the white-label URL of your data provider (e.g., https://analytics.ytica.com/). Note that the trailing slash is required.

## Command-line Interface
    gdutil list
    gdutil get

The commands above are for querying and displaying GoodData metadata. The data returned are needed for executing the `gdutil report` command.

Please run `gdutil --help` at the command-line to see commands and arguments.

The recommended usage is the following sequence of commands:
```
gdutil list -u <user> -p <pswd> -w <wrkspc_id> -t report
```
  to list all reports and their ID; note the ID of the report you want to run; it will be used in the next command

```
gdutil get -u <user> -p <pswd> -w <wrkspc_id> --type report --object <obj_id>
```
  to get the report definitions for your report; normally you want the latest definition, which is normally listed first and has the highest ID number

```
gdutil get -u <user> -p <pswd> -w <wrkspc_id> --type rptdefn --object <obj_id>
```
  to get the report definition and list of attributeDisplayForms; the latter are uses of attributes and you will need any of those that you wish to use in dynamic filters when the report is executed; for list-type filters, you will also need to note the attribute ID (printed at the end of each line) and use it in the next step

```
gdutil get -u <user> -p <pswd> -w <wrkspc_id> --type attribForm --object <obj_id>
```
  (optional) to get the list of values that can be used in a list filter; run this for each attributeDisplayForm upon which you will have a list filter; note the element ID(s) of any values (shown in brackets) that will be in the list of values

Armed with the required IDs noted above, you can now create a command-line to run the `gdutil report` command.

NOTE: the GoodData gray pages can also get this data, although often not as conveniently.

    gdutil report
The `report` command is for executing and exporting a report, with support for dynamic filters. The resulting .csv file is placed in the /tmp folder.

All of the command-line arguments are straightforward, with the exception of the
--filters (-f) argument. It takes a JSON object with the following format:
```
[{"type":<type>,"filterId":<id>,"attributeId":<id>,"values":[<id>,...]}]
```

The parameter is an array of filters. Each filter has the following properties:
- `type` is one of: `list`, `floating`, or `interval`
- `filterId` is the attributeDisplyForm ID
- `attributeId` is the attribute ID; only used with type=list
- `values` is an array of values or,  when type=list, element IDs; normal JSON rules apply
  
A `list` filter on three elements (i.e., values) might look like this:
```
{"type":"list","filterId":<id>,"attributeId":<id>,"values":[id1, id2, id3]}
```
An `interval` filter on two dates might look like this:
```
{"type":"interval","filterId":<id>,"values":["2019-04-01","2019-04-30"]}
```
A `floating` filter on the last 7 days would look like this:
```
{"type":"floating","filterId":<id>,"values":[-7,0]}
```
For other date filter formats, consult the GoodData help pages on filtering.
