var fs = require("fs");
var crypto = require("crypto");
var jsregression = require('js-regression');
var data = {}; //each property of this object corresponds to a data source
var classifier = new jsregression.LinearRegression({
    alpha: 0.001, //
    iterations: 1000,
    lambda: 0.0
});

//Initialize the in-memory data structure for every given json file in backEnd/data
function initData(srcDir, onComplete) {
	console.log("Initing data...");
	fs.readdir(srcDir, function(err, allFiles) {
		if (err) {
			console.error(srcDir + " is empty");
			process.exit();
		}
		allFiles.forEach(function(f, i) {
			console.log("Saw:" + f);
			data[f.split(".")[0]] = {
				name: f.split(".").slice(0, -1).join("."),
				content: fs.readFileSync(srcDir + "/" + f, "utf8")
			};
		});
        if(onComplete){
            onComplete(data);
		} else {
        	console.warn("onComplete of initData is null");
		}

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
		console.log(data[k].content);
		result.data = result.data.concat(JSON.parse(data[k].content));
	}
	return result;
};

function convertKind(kindStr){
    var kinds = ['Saccular','Complex','Fusiform', 'Dissection', '', null];
	var ret = kinds.indexOf(kindStr);
	if(ret === -1){
		console.warn("Unhandled kind:" + kindStr);
	}
	return ret;
}
function convertLoc(locStr){
    var locs = ['ICA Superior Hypophyseal Artery','ICA PCOM','Fusiform',
		'MCA', 'Pericallosal', 'Distal AC', 'Anterior Communicating Artery' ,
		'Carotid Opthalmic', 'Vertebral Artery', 'Basilar Tip', 'ICA', 'Anterior Choroidal',
		'PICA', 'Supraclinoid', 'Carotid Cave', 'Cavernous Carotid', 'SCA', 'Paraclinoid',
		'MCA', 'PCA', 'Vertebrobasilar Junction', 'Distal SCA', 'BA SCA', 'Distal MCA',
		'PCA', 'Intraspinal: Cervical', 'Basilar Truck', 'BA AICA', 'Distal PICA', 'Distal PCA',
		'Distal AICA',
		'', null];
    var ret = locs.indexOf(locStr);
    if(ret === -1){
        console.warn("Unhandled kind:" + locStr);
    }
    return ret;
}

function convertRuptured(ruptStr){
    var vars = ['Un-Ruptured', 'Ruptured', 'Unknown', '', null];
    var ret = vars.indexOf(ruptStr);
    if(ret === -1){
        console.warn("Unhandled kind:" + ruptStr);
    }
    return ret;
}

function transformToRegressionData(jsonData){
    var data = [];
    for(var d in jsonData.data) {
        var node = {
            kind: convertKind(jsonData.data[d]['Type of Aneurysm']),
            loc: convertLoc(jsonData.data[d]['Aneurysm 1 location']),
            size: jsonData.data[d]['Size of Aneurysm 1'],
            status: convertRuptured(jsonData.data[d]['Status of aneurysm'])
        }
        //console.log( d + ": " + JSON.stringify(node));
        data.push([ node.kind, node.loc, node.size, node.status]);
    }
    return data;
};

function trainRegression(jsonData){
	var trainingData = transformToRegressionData(jsonData);
	console.log("Training with " + trainingData.length + " nodes: " + JSON.stringify(trainingData));
    var result = classifier.fit(trainingData);
    console.log(result);
};

function testRegression(jsonData){
    var testingData = transformToRegressionData(jsonData);
    console.log("Testing with " + testingData.length + " nodes: " + JSON.stringify(testingData));

    for(var i in testingData){
		var actual = testingData[i][3];
		var predicted = classifier.transform([testingData[i][0],testingData[i][1],testingData[i][2]]);
		console.log("Actual: " + actual + " Predicted:" + predicted);
    }
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

module.exports = {initData, getAllData, getDataSourceNames, getDataSourceByName, trainRegression, testRegression};
