var webAppServer = require("./src/server/server.js");
var dataModel = require("./src/model/data.js");
var server;

var serverOptions = {
	baseURL: global.baseURL,
	httpPort: 8080,
	resources: __dirname + "/public", 
	indexPage: __dirname + "/public/html/index.html",
	dataSrc: __dirname + "/data"
};

global.baseURL = "http://localhost" + ":" + serverOptions.httpPort;

function init() {
	dataModel.initData(serverOptions.dataSrc);
	console.log(dataModel.getAllData());
	server = new webAppServer(serverOptions);
};
init();
