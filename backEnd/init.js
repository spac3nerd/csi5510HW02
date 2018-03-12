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
	dataModel.initData(serverOptions.dataSrc, function(data){
        var trainingData = dataModel.getDataSourceByName('DMC,HenryFordDataset,Beaumontdataset', {excludeNull: true, excludeEmptyStr: true});
        var testingData = dataModel.getDataSourceByName('HenryFordDataset',{excludeNull: true, excludeEmptyStr: true});

        dataModel.trainRegression(trainingData);
        dataModel.testRegression(testingData);
	});
	server = new webAppServer(serverOptions);



};
init();
