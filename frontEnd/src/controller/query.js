hw02.controller = hw02.controller || {};
hw02.controller.query = function(targetElem) {
	this.target = targetElem;
	this._service = new hw02.service();
	this._sourceNames = undefined;

	this._generateRadioBtns = function () {
		this._service.getDataSourcesByName({}, function(response) {
			if (response.success) {
				this._sourceNames = response.data;
				var radioContainer = $("#radioContainer");
                for (var k = 0; k < response.data.length; k++) {
					radioContainer[0].innerHTML = radioContainer[0].innerHTML + "<label><input checked type=\"checkbox\" id=" + response.data[k] +"CheckBox>" + response.data[k] + "</label>";
                }
            }
            else {
				alert("Something went wrong");
			}
		}, this);
    };

	this._addEventHandlers = function() {
		var runBtn = $("#queryBtn");
		var that = this;
		runBtn.on("click", function(e) {
			that.query();
		});
	};

	//format the data into something that datatables can use
	this._formatData = function(d) {
		var fd = {};
		return fd;
	};
	this._getColumns = function() {
		return [
			columns: [
				{title:},
				{}
			]
		];
	};


	this.query = function() {
		console.log(this._service);
		this._dataTable = $("queryTable").DataTable({
			paging: false,
			searching: false,
			data
		});
	};
	
	this.init = function() {
		this._generateRadioBtns();
		this._addEventHandlers();
		return this;
	};
};
