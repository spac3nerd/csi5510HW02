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
		//train on all 3 data sets
        var trainingData = dataModel.getDataSourceByName('DMC,HenryFordDataset,Beaumontdataset', {excludeNull: true, excludeEmptyStr: true});
        var testingData = dataModel.getDataSourceByName('DMC',{excludeNull: true, excludeEmptyStr: true});
        dataModel.trainNN(trainingData);
        dataModel.testSet(testingData);

		console.log("ready, navigate to: " + global.baseURL);
	});
	server = new webAppServer(serverOptions);

}
init();
