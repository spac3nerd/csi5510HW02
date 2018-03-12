hw02.controller = hw02.controller || {};
hw02.controller.query = function(targetElem) {
	this.target = targetElem;
	this._service = new hw02.service();
	this._sourceNames = undefined;

	this._generateRadioBtns = function () {
		this._service.getDataSourcesName({}, function(response) {
			if (response.success) {
				this._sourceNames = response.data;
				var radioContainer = $("#radioContainer");
                for (var k = 0; k < response.data.length; k++) {
					radioContainer[0].innerHTML = radioContainer[0].innerHTML + "<label><input checked type=\"checkbox\" id=" + response.data[k] +"CheckBox>" + response.data[k] + "</label>";
                }
                this._generateTable();
            }
            else {
				alert("Something went wrong");
			}
		}, this);
    };

	this._getCheckedItems = function() {
		var result = [];
        var radioContainer = $("#radioContainer");
        for (var k = 0; k < radioContainer[0].children.length; k++) {
            if (radioContainer[0].children[k].children[0].checked) {
            	result.push(radioContainer[0].children[k].children[0].id.split("CheckBox")[0]);
			}
		}
		console.log(result);
		return result;
	};

	this._addEventHandlers = function() {
		var runBtn = $("#queryBtn");
		var that = this;
		runBtn.on("click", function(e) {
			that._reloadTable();
		});
	};

	this._reloadTable = function() {
        this._service.getData({
            sources: this._getCheckedItems()
        }, function(response){
            if (response.success) {
                this._dataTable.clear();
                this._dataTable.rows.add(response.data.data);
                this._dataTable.draw();
            }
            else {
                alert(response.message);
            }
        }, this);
	};

	//takes the columns sent by the server and modifies them into something that DataTable can use
	this._formatColumns = function(cols) {
		var result = [];
		for (var k = 0; k < cols.length; k++) {
			result.push({
				"data": cols[k],
				"title": cols[k]
			});
		}
		return result;
	};

	this._generateTable = function() {
		var that = this;
        this._service.getData({
			sources: this._getCheckedItems()
		}, function(response){
        	if (response.success) {
                this._dataTable = $("#queryTable").DataTable({
                    paging: true,
					pageLength: 20,
                    searching: true,
                    columns: that._formatColumns(response.data.cols),
                    data: response.data.data
                });
            }
            else {
        		alert(response.message);
			}
		}, this);

	};
	
	this.init = function() {
		this._generateRadioBtns();
		this._addEventHandlers();
		return this;
	};
};
