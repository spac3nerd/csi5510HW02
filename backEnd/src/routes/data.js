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

router.post("/data/getDataSourcesByName/", function(req, res){
	if (req.headers.sources) {
        var packet = dataModel.getDataSourceByName(req.headers.sources, req.body.options);
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end(JSON.stringify({
			success: true,
			data: packet
		}), "utf-8");
    }
    else {
		res.writeHead(200, {"Content-Type": "text/plain"});
        res.end(JSON.stringify({
			success: false,
			message: "sources not found in header"
		}), "utf-8");
	}
});

//returns the dimensions in the data set
router.get("/data/getDataDimensions/", function(req, res){
	var packet = dataModel.getCols();
	res.writeHead(200, {"Content-Type": "text/plain"});
	res.end(JSON.stringify({
		success: true,
		data: packet
	}), "utf-8");
});

//returns a data set that is grouped by a given dimension
router.post("/data/groupDataByDimension/", function(req, res){
    if (req.headers.sources) {
    	if (req.body.dimension) {
            var packet = dataModel.groupDataByDimension(req.headers.sources, req.body.dimension, req.body.options || {});
            res.writeHead(200, {"Content-Type": "text/plain"});
            res.end(JSON.stringify({
                success: true,
                data: packet
            }), "utf-8");
        }
        else {
            res.writeHead(200, {"Content-Type": "text/plain"});
            res.end(JSON.stringify({
                success: false,
                message: "No dimension given to group by"
            }), "utf-8");
		}
    }
    else {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end(JSON.stringify({
            success: false,
            message: "Sources not found in header"
        }), "utf-8");
    }
});

router.post("/data/predictCase/", function(req, res){
    var data = req.body.case;
    if (data.hasOwnProperty("Type of Aneurysm") && data.hasOwnProperty("Size of Aneurysm 1") && data.hasOwnProperty("Aneurysm 1 location")){
        var packet = dataModel.predictCase(req.body.case);
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end(JSON.stringify({
            success: true,
            data: packet
        }), "utf-8");
    }
    else {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end(JSON.stringify({
            success: false,
            message: "Case does not contain the correct data fields"
        }), "utf-8");
    }

});


module.exports = router;
