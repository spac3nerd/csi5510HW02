function webServer(settings) {
	var bodyParser = require("body-parser");
	var fs = require("fs");
	var express = require("express");
	var http = require("http");
	
	
	var app = express();
	
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	
	//Tell Express about the routes we're using
	var dataRoutes = require("../routes/data.js");
	
	//tell Express to use the defined routes
	app.use(dataRoutes);
	
	app.use(express.static(settings.resources)); //static resources
	
	//request for the home page
	app.get("/", function(req, res) {
		res.sendFile(settings.indexPage);
	});
	
	var httpServer = http.createServer(app).listen(settings.httpPort);
	console.log("Server is listening on port " + settings.httpPort);
}

module.exports = webServer;
