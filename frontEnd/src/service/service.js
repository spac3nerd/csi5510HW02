hw02.service = function() {
	
	this._req = function(route, type, data, headers, callback, context) {
		$.ajax({
			url: document.URL + route,
			type: type,
			headers: headers || {},
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
		this._req("data/getAll", "GET", data, {}, callback, context);
	};
    this.getDataSourcesName = function(data, callback, context) {
        this._req("data/getDataSources", "GET", undefined, data, callback, context);
    };
    this.getData = function(data, headers, callback, context) {
        this._req("data/getDataSourcesByName/", "POST", data, headers, callback, context);
    };
    this.getDataDimensions = function(data, headers, callback, context) {
        this._req("data/getDataDimensions/", "GET", data, headers, callback, context);
    };
    this.groupDataByDimension = function(data, headers, callback, context) {
        this._req("data/groupDataByDimension/", "POST", data, headers, callback, context);
    };
	
};
