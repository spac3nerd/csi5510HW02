var express = require("express");
var router = express.Router();
var dataModel = require("../model/data.js");


//Retrieve all of the fragments
router.get("/data/getAll", function(req, res) {
	var packet = dataModel.getAllData();
	res.writeHead(200, {"Content-Type": "text/plain"});
	res.end(JSON.stringify(packet), "utf-8");
});

router.get("/data/getDataSources", function(req, res){
	var packet = dataModel.getDataSourceNames();
	res.writeHead(200, {"Content-Type": "text/plain"});
	res.end(JSON.stringify({
		success: true,
		data: packet
	}), "utf-8");
});

router.get("/data/getDataSources/:name", function(req, res){
	//var packet = dataModel.getDataSourceNames();
	//res.writeHead(200, {"Content-Type": "text/plain"});
	//res.end(JSON.stringify(packet), "utf-8");
});


module.exports = router;
