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

/**
 * Reads the given input directory and parses the contained files into data sets.
 * @param srcDir The directory to process.
 * @param onComplete A callback function to invoke when this async method is complete.
 */
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

/**
 * Determines the attributes of the data in the data set. This will become the column headers in the Data Table,
 * and dimensions used by the Neural Network
 * @returns {Array} An array of strings representing the attributes of a datum in the data set.
 */
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

/**
 * Returns the main data structure used by the client. This consists of an array of column headers, and another
 * array of all the data caess
 * @returns {{cols: *, data: Array}}
 */
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

/**
 * Normalizes a value, such as the size of an aneurysm, to 0-1.
 * @param val The value to normalize
 * @param max The maximum number of possible values (determined elsewhere). Minimum is assumed 0.
 * @returns {number} The normalized value
 */
function normalize(val, max) {
    return (val / max);
}

//should be finding the max value, but due to time restraints, it has been hardcoded to the max of size of aneurysm
function maxOfDim(set, dim) {
	return 32.5;
}

/**
 * Converts a string value for aneurysm type to a normalized value used by the NN
 * @param kindStr String representing the attribute
 * @returns {number} Normalized value for the given attribute category
 */
function convertKind(kindStr){
	var ret = normalize(kinds.indexOf(kindStr), kinds.length);
	if(ret === -1){
		console.warn("Unhandled kind:" + kindStr);
	}
	return ret;
}

/**
 * Converts a string value for aneurysm location to a normalized value used by the NN
 * @param kindStr String representing the attribute
 * @returns {number} Normalized value for the given attribute category
 */
function convertLoc(locStr){
    var ret = normalize(locations.indexOf(locStr), locations.length);
    if(ret === -1){
        console.warn("Unhandled kind:" + locStr);
    }
    return ret;
}

/**
 * Converts a string value for aneurysm status to a normalized value used by the NN
 * @param kindStr String representing the attribute
 * @returns {number} Normalized value for the given attribute category
 */
function convertRuptured(ruptStr){
    var ret = normalize(status.indexOf(ruptStr), status.length);
    if(ret === -1){
        console.warn("Unhandled kind:" + ruptStr);
    }
    return ret;
}

/**
 * Converts an array of data in the format of the input files into an array of objects used to train
 * the Neural Network. The various attributes (type, location and size) become hidden nodes in the NN.
 * Ruptured and Unruptured become outputs of the node.
 * @param jsonData An array of JSON objects in the format of the data files.
 * @returns {Array} An array of objects in the format used by the Neural Network
 */
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

/**
 * Converts an array of data in the format of the input files into an array of objects used to test
 * the Neural Network
 * @param jsonData An array of JSON objects in the format of the data files.
 * @returns {Array} An array of objects in the format used by the Neural Network
 */
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

/**
 * Trains the Neural Network with the given data (in the format from the input files).
 *
 * @param jsonData An array of JSON objects in the format of the data files.
 */
function trainNN(jsonData){
	var trainingData = transformToNNData(jsonData);
	console.log("Training with " + trainingData.length + " nodes: " + JSON.stringify(trainingData));
    net.train(trainingData);
    console.log("training complete")
}

/**
 * Tests the Neural Network for the given aneurysm case. The case is expected to be in the format of the
 * input files, and it is converted to the format expected by the Neural Network before being passed to the NN
 * for testing.
 * @param data A neural network case in the format from the input files.
 * @returns a JSON-packed object in the form {"ruptured": <ruptured_val>,"unruptured": <unruptured_val>} where
 *          the ruptured/unruptured vals are the 0-1 likelihood of applying to this case, as determined by the NN
 */
function predictCase(data) {
    var maxSize = maxOfDim(data, 'Size of Aneurysm 1');
	var formattedData = {
        a: convertKind(data['Type of Aneurysm']),
        b: convertLoc(data['Aneurysm 1 location']),
        c: normalize(data['Size of Aneurysm 1'], maxSize)
	};

	return net.run(formattedData);
}

/**
 * Run a whole array of datums from the input files through the NN for testing. Keep track of successes and
 * failures for display purposes. Displays individual case predictions, as well as overall summary data.
 * @param jsonData An array of JSON objects in the format of the data files.
 */
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

/**
 * Filters the total data to only the data sets specified by *names*, and filtered with *options*.
 * @param names A comma-separated string of the data set names to use.
 * @param options A JSON object encoding filter options: {excludeNull: bool, excludeEmptyStr: bool}.
 * @returns The data structure used on the client to display data in a tabular form.
 */
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

/**
 * Returns an array of the available data set names.
 * @returns {Array} An array of strings representing the names of the available data sets.
 */
function getDataSourceNames() {
	var result = [];
	for (var k in data) {
		result.push(data[k].name);
	}
	
	return result;
}

/**
 * Filters the data cases to only the data sets specified by *names*, and filtered with *options*, on the given
 * dimension
 * @param names A comma-separated string of the data set names to use.
 * @param options A JSON object encoding filter options: {excludeNull: bool, excludeEmptyStr: bool}.
 * @param dimension The name of a dimension to filter by
 * @returns A data structure containing data used by the client charting functions
 */
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
