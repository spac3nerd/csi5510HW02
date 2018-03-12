# Project Documentation

## Overview

The project is implemented in node.js with express.js for the web framework. 

**Project Structure**

* `frontEnd/`: Contains html/js/css sources that comprise the client
    * `css/`:
        * `css.css`:
        * `jquery.dataTables.min.css`:
    * `html/`:
        * `index.html`: The main entry point of the client. Immediately loads the controller.
    * `lib/`: Contains 3rd party libraries such for features like charts. 
    * `src/`:
        * `controller/`:
            * `query.js`: Controller that is used to drive the view, and accesses the model via the service.
        * `service/`:
            * `service.js`: Implements REST calls used in the controller
        * `hw02.js`: Main Javascript file. Loaded by index.html and instantiates the controller. 
    * `Gruntfile.js`:

* `backEnd/` Contains js source code for the server, as well as the JSON data files
    * `src/`
        * `init.j`: Main entry point for server    
        * `model/`: 
            * `data.js`: Defines operations that read and parse the data files. 
        * `routes/`
            * `data.js`: Defines and exports endpoints used by the express server. Utilizes the model to fulfil requests.
        * `server/`
            * `server.js`: Defines and exports the webserver

# 