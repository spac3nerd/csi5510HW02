# Project Documentation

## Overview

The project is implemented in node.js with express.js for the web framework. 

**Project Structure**

* `frontEnd/`: Contains html/js/css sources that comprise the client.
    * `css/`: 
        * `css.css`: Our CSS used throughout the client.
        * `jquery.dataTables.min.css`: 3rd party generated CSS for styling the main Data Table.
    * `html/`:
        * `index.html`: The main entry point of the client. Immediately loads the controller.
    * `lib/`: Contains 3rd party libraries for features like charts. 
    * `src/`: Contains client source script files.
        * `controller/`:
            * `query.js`: Controller that is used to drive the view, and accesses the model via the service.
        * `service/`:
            * `service.js`: Implements REST calls used in the controller
        * `hw02.js`: Main Javascript file. Loaded by index.html and instantiates the controller. 
    * `Gruntfile.js`: Configures grunt for packaging the frontEnd files. 

* `backEnd/` Contains js source code for the server, as well as the JSON data files
    * `src/` Contains server source script files.
        * `init.j`: Main entry point for server    
        * `model/`: 
            * `data.js`: Defines operations that read and parse the data files. 
        * `routes/`
            * `data.js`: Defines and exports endpoints used by the express server. Utilizes the model to fulfil requests.
        * `server/`
            * `server.js`: Defines and exports the web-server

## How it works

### REST API

The server exposes a REST API for requesting data in several ways:

	
| Methdod | URI                      | Header Params | Body Params  | Description       |
| --------|--------------------------|------------------------|-------------------|-------------------|
| GET     |/data/getAll              | n/a                    | n/a               |returns data from all sources  |
| GET     |/data/getDataSources      | n/a                    | n/a               |returns a list of available data source names  |
| GET     |/data/getDataDimensions      | n/a                    | n/a               |returns a list of all data dimensions  |
| POST    |/data/getDataSourcesByName| 'sources': <br> A comma-separated string of names of data sources to use. E.g "DMC, HenryFord" | 'options':<br> { "excludeNull": bool, "excludeEmptyStr": bool } |returns data *only* from the data sets in *sources*, and prunes data according to the *options* set  |
| POST     |/data/groupDataByDim      | n/a                    | n/a               |returns a a data set that is grouped by a given dimension  |


### Server 

* The server can serve data from an arbitrary number of sources. Any JSON file dropped into `backEnd/data/` 
will become a potential data source. The file-name will become the source name (used in the API, and displayed
on the client)

* The server can do some pre-processing of the data, as directed by the client options, in order to minimize the
amount of data going to the client. These capabilities are:
    * Show only data from selected data sources
    * Show only data with non-null and/or non-empty values
    
### Client

* The client is an HTML webpage used for displaying the data and giving the user controls to manipulate the shown data.
* The main display element of the client is a JQuery DataTable, which extends an HTML table with features like sorting,
searching and pagination. 
* The client has controls (radio buttons) to focus the scope of returned data (implemented by sending a new 
request to the server).
    * Some data-filtering options (search, # of results shown per page) are handled directly on the client