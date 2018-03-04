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
function getAllData() {
	return data;
};

module.exports = {initData, getAllData};
