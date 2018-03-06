var hw02 = function() {
	
	
	this.initQuery = function(targetElem) {
		var queryController = new hw02.controller.query();
		queryController.init(targetElem);
		return queryController;
	};
};
