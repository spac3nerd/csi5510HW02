var fs = require("fs");
var crypto = require("crypto");
var jsregression = require('js-regression');
var brain = require("brainjs");
var data = {}; //each property of this object corresponds to a data source
var net = new brain.NeuralNetwork();

var kinds = [
	"Complex",
    "Dissection",
    "Distal",
    "Fusiform",
    "Saccular"
];

var status = [
    "Ruptured",
    "Un-Ruptured"
];

var locations = [ "Anterior Choroidal",
    "Anterior Communicating Artery",
    "BA AICA",
    "BA SCA",
    "Basilar Tip",
    "Basilar Truck",
    "Carotid Cave",
    "Carotid Opthalmic",
    "Cavernous Carotid",
    "Distal AC",
    "Distal AICA",
    "Distal MCA",
    "Distal PCA",
    "Distal PICA",
    "Distal SCA",
    "Extra-Cranial: Internal Carotid",
    "ICA PCOM",
    "ICA Superior Hypophyseal Artery",
    "ICA",
    "Intraspinal: Cervical",
    "Intraspinal: Thoracic",
    "MCA",
    "Paraclinoid",
    "Pericallosal",
    "PICA",
    "Supraclinoid",
    "Vertebral Artery",
    "Vertebrobasilar Junction"
];

//Initialize the in-memory data structure for every given json file in backEnd/data
function initData(srcDir, onComplete) {
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
        if(onComplete){
        	//debugger;
            onComplete(data);
		} else {
        	console.warn("onComplete of initData is null");
		}

	});
}

//not a very robust function, it relies on the assumption that all data sources have the same columns
function getCols() {
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
}

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
}

//min is assumed to be 0
//val is the number to be normalized,
//max is the max value in the original set
function normalize(val, max) {
    return (val / max);
}

//should be finding the max value, but due to time restraints, it has been hardcoded to the max of size of aneurysm
function maxOfDim(set, dim) {
	return 32.5;
}

function convertKind(kindStr){
	var ret = normalize(kinds.indexOf(kindStr), kinds.length);
	if(ret === -1){
		console.warn("Unhandled kind:" + kindStr);
	}
	return ret;
}
function convertLoc(locStr){
    var ret = normalize(locations.indexOf(locStr), locations.length);
    if(ret === -1){
        console.warn("Unhandled kind:" + locStr);
    }
    return ret;
}

function convertRuptured(ruptStr){
    var ret = normalize(status.indexOf(ruptStr), status.length);
    if(ret === -1){
        console.warn("Unhandled kind:" + ruptStr);
    }
    return ret;
}

function transformToNNData(jsonData){
    var data = [];
    var maxSize = maxOfDim(jsonData, 'Size of Aneurysm 1');
    var output;
    for(var d in jsonData.data) {
    	//Keep the set of possible outcomes to two
    	if (jsonData.data[d]['Status of aneurysm'] === "Unknown") {
    		continue;
		}
        var input = {
                a: convertKind(jsonData.data[d]['Type of Aneurysm']),
                b: convertLoc(jsonData.data[d]['Aneurysm 1 location']),
                c: normalize(jsonData.data[d]['Size of Aneurysm 1'], maxSize)
            };
    	if (convertRuptured(jsonData.data[d]['Status of aneurysm']) === 0) {
            output = {
                ruptured: 1
            }
		}
		else {
            output = {
                unruptured: 1
            }
		}
        data.push({
        	"input": input,
			"output": output
		});
    }
    return data;
}

function transformToNNTestData(jsonData){
    var data = [];
    var maxSize = maxOfDim(jsonData, 'Size of Aneurysm 1');

    for(var d in jsonData.data) {
        //Keep the set of possible outcomes to two
        if (jsonData.data[d]['Status of aneurysm'] === "Unknown") {
            continue;
        }
        var input = {
            a: convertKind(jsonData.data[d]['Type of Aneurysm']),
            b: convertLoc(jsonData.data[d]['Aneurysm 1 location']),
            c: normalize(jsonData.data[d]['Size of Aneurysm 1'], maxSize)
        };

        data.push({
            "input": input,
            "actual": jsonData.data[d]['Status of aneurysm']
        });
    }
    return data;
}

function trainNN(jsonData){
	var trainingData = transformToNNData(jsonData);
	console.log("Training with " + trainingData.length + " nodes: " + JSON.stringify(trainingData));
    net.train(trainingData);
    console.log("training complete")
}

function predictCase(data) {
    var maxSize = maxOfDim(data, 'Size of Aneurysm 1');
	var formattedData = {
        a: convertKind(data['Type of Aneurysm']),
        b: convertLoc(data['Aneurysm 1 location']),
        c: normalize(data['Size of Aneurysm 1'], maxSize)
	};

	return net.run(formattedData);
}

function testSet(jsonData){
    var testingData = transformToNNTestData(jsonData);
    console.log("Testing with " + testingData.length + " nodes: " + JSON.stringify(testingData));
    var correct = 0;
    var total = 0;
    for(var i in testingData){
		var actual = testingData[i].actual;
		var predicted = net.run(testingData[i].input);
			if ((predicted.ruptured > 0.5) && (actual === "Ruptured")) {
				correct++;
				total++;
			}
			else if ((predicted.unruptured > 0.5) && (actual === "Un-Ruptured")) {
                correct++;
                total++;
			}
			else {
				total++;
			}
            console.log("Actual: " + actual + "       Predicted Ruptured:" + predicted.ruptured + "      Predicted Un-Ruptured:" + predicted.unruptured);
    }
    console.log("It's correct " + ((correct/total) * 100) + "% of the time");
}
//names - an array with the names of the data sources - result is condensed
function getDataSourceByName(names, options) {
	names = names.split(",");
	var cols = getCols();
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
}

//returns an array with the names of all of the data source names
function getDataSourceNames() {
	var result = [];
	for (var k in data) {
		result.push(data[k].name);
	}
	
	return result;
}

function groupDataByDimension(names, dimension, options) {
	var data = this.getDataSourceByName(names, options).data;
	var result = {
		"data": {},
		"dimension": dimension
	};

	for (var k = 0; k < data.length; k++) {
		var key = data[k][dimension];
		if (key === "") {
			key = "Not defined";
		}
		if (key === null) {
			continue;
		}
		if (result["data"].hasOwnProperty(key)) {
			result["data"][key] = result["data"][key] + 1
		}
		else {
            result["data"][key] = 1;
		}
	}
	return result;
}

module.exports = {
    initData,
    getAllData,
    getDataSourceNames,
    getDataSourceByName,
    getCols,
    groupDataByDimension,
    testSet,
    trainNN,
	predictCase
};
