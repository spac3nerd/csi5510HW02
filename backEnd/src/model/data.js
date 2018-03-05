var fs = require("fs");
var crypto = require("crypto");
var data = {}; //each property of this object corresponds to a data source


//Initialize the in-memory data structure for every given json file in backEnd/data
function initData(srcDir) {
	fs.readdir(srcDir, function(err, allFiles) {
		if (err) {
			console.error(srcDir + " is empty");
			process.exit();
		}
		allFiles.forEach(function(f, i) {
			data[f.split(".")[0]] = {
				name: f.split(".").slice(0, -1).join("."),
				content: fs.readFileSync(srcDir + "/" + f, "utf8"),
				annotations: []
			};
		});
	});
};

//returns all of the data
function getAllData() {
	return data;
};

//names - an array with the names of the data sources - result is condensed 
function getDataBySourceByName(names) {
	var result = {};
	for (var k = 0; k < names.length; k++) {
		debugger;
	}
};

//returns an array with the names of all of the data source names
function getDataSourceNames() {
	var result = [];
	for (var k in data) {
		result.append(k["name"]);
	}
	
	return result;
};

module.exports = {initData, getAllData};
