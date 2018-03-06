hw02.controller = hw02.controller || {};
hw02.controller.query = function(targetElem) {
	this.target = targetElem;
	
	
	
	this.init = function() {
		console.log("initQuery");
		return this;
	};
};
