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
					"lib/jquery.js",
					"lib/highcharts.js",
					"lib/jquery.dataTables.min.js",
					"src/hw02.js",
					"src/service/service.js",
					"src/controller/query.js"
				],
				dest: dest + "hw02.js"
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
		}
	});
	
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-copy");
	
	grunt.registerTask("default", ["debug"]);
	grunt.registerTask("init", ["downloadFiles"]);
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
};
