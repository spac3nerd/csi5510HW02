hw02.service = function() {
	
	this._req = function(route, type, data, callback, context) {
		$.ajax({
			url: document.URL + route,
			type: type,
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data)
		}).done(function(data) {
			if (callback) {
				callback.apply(context, arguments);
			}
		});
	};
	
	this.getAllData = function(data, callback, context) {
		this._req("data/getAll", "GET", data, callback, context);
	};
    this.getDataSourcesByName = function(data, callback, context) {
        this._req("data/getDataSources", "GET", data, callback, context);
    };
	
};
