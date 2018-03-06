var hw02 = function() {
	
	
	this.initQuery = function(targetElem) {
		var queryController = new hw02.controller.query(targetElem);
		queryController.init();
		return queryController;
	};
};
