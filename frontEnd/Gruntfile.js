module.exports = function(grunt) {
	//The directory into which resources will be sent
	var dest = "../backEnd/public/";
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		
		jshint: {
			options:{
				laxcomma: true,
				smarttabs: true,
				debug: true,
				expr: true,
				loopfunc: true
			},
			all: [
				"src/**/*.js"
			]
		},
		
		concat: {
			options: {
				separator: "\n"
			},
			dist: {
				src: [
				],
				dest: dest + "htmlAnn.js"
			}
		},
		concatcss: {
			options: {
				separator: "\n"
			},
			dist: {
				src: [
					"css/*.css"
				],
				dest: dest + "style.css"
			}
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						flatten: true,
						src: ["html/index.html"],
						dest: dest
					}
				]
			}
		},
		downloadFiles: {
			dist: {
				resources: ["https://cdnjs.cloudflare.com/ajax/libs/highcharts/6.0.7/highcharts.js"],
				dest: "lib",
				name: ""
			}
		} 
	});
	
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-copy");
	
	grunt.registerTask("default", ["debug"]);
	grunt.registerTask("init", ["concat", "concatcss", "copy", "jshint"]);
	grunt.registerTask("debug", ["concat", "concatcss", "copy", "jshint"]);
	
	grunt.registerTask("concatcss", function() {
		var task = grunt.config("concatcss");
		var src = task.dist.src;
		var dist = task.dist;
		var options = task.options;
		grunt.config.set("concat", {
			options: options,
			dist: dist
		})
		grunt.task.run("concat");
	});
	
	
	grunt.registerTask("downloadFiles", function() {
		var done = this.async();
		var dist = grunt.config("getFile").dist;
		var dir = dist.dest;
		var http = require("https");
		var fs = require("fs");
		var writeStream = fs.createWriteStream(dist.dest + "/" + dist.name); 
		var request = http.get(dist.resource, function(e) {
			e.pipe(writeStream);
			e.on("end", function(a) {
				console.log(dist.name + "-----" + " complete");
			});
		});
	});
	
	
};
