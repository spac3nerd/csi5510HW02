Problem 5 of HW2

# Deployment guide

## Required technologies:
* Node.js
* npm (node package manager)
* any web browser

## Guide: 

1 Install Node.js and the Node Package Manager (npm)
    
2 Change to the root of the project directory

3 Install grunt globally. Grunt is used to package and minimize the front-end files.
    
    npm install grunt -g
    
4 Install dependencies:

    cd backEnd 
    npm install
    cd ../frontEnd
    npm install
    
5 Run grunt (you should still be in the `frontEnd` directory):
    
    grunt
    
This will have generated a `public` directory in `backEnd` that has the html/js/css resources ready to be served by the server

6 Run the server 

    cd ../backEnd
    node init.js
    
7 View the client by pointing a browser at localhost:8080

