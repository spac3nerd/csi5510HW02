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
				content: fs.readFileSync(srcDir + "/" + f, "utf8")
			};
		});
	});
};

//not a very robust function, it relies on the assumption that all data sources have the same columns
function _getCols() {
	for (var k in data) {
		var parsed = JSON.parse(data[k].content);
		var cols = [];
		for (var i = 0; i < parsed.length; i++) {
			for (var n in parsed[i]) {
				cols.push(n);
			}
			return cols;
		}
	}
};

//returns all of the data
function getAllData() {
	var result = {
		cols: _getCols(),
		data: []
	};
	for (var k in data) {
		result.data = result.data.concat(JSON.parse(data[k].content));
	}
	return result;
};

//names - an array with the names of the data sources - result is condensed 
function getDataSourceByName(names, options) {
	names = names.split(",");
	var cols = _getCols();
	var result = {
		cols: cols,
		data: []
	};
    if (!(options.excludeNull) && !(options.excludeEmptyStr)) {
        for (var k = 0; k < names.length; k++) {
            result.data = result.data.concat(JSON.parse(data[names[k]].content));
        }
    }
    else {
    	var currentData, skip;
        for (var k = 0; k < names.length; k++) {
             currentData = (JSON.parse(data[names[k]].content));
             for (var n = 0; n < currentData.length; n++) {
             	skip = false;
             	for (var j in currentData[n]){
             		if (options.excludeNull) {
             			if (currentData[n][j] === null) {
             				skip = true;
						}
					}
					if (options.excludeEmptyStr) {
                        if (currentData[n][j] === "") {
                            skip = true;
                        }
					}
				}
				if (!skip){
             		result.data.push(currentData[n]);
				}
             }
        }
    }
	return result;
};

//returns an array with the names of all of the data source names
function getDataSourceNames() {
	var result = [];
	for (var k in data) {
		result.push(data[k].name);
	}
	
	return result;
};

module.exports = {initData, getAllData, getDataSourceNames, getDataSourceByName};
