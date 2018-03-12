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
					radioContainer[0].innerHTML = radioContainer[0].innerHTML + "<label><input checked class='regular-radio' type=\"checkbox\" id=" + response.data[k] +"CheckBox>" + response.data[k] + "</label>";
                }
                this._generateTable();
                this._generateCharts(response.data);
            }
            else {
				alert("Something went wrong");
			}
		}, this);
    };

	//retrieves all of the checked data sources
	this._getCheckedItems = function() {
		var result = [];
        var radioContainer = $("#radioContainer");
        for (var k = 0; k < radioContainer[0].children.length; k++) {
            if (radioContainer[0].children[k].children[0].checked) {
            	result.push(radioContainer[0].children[k].children[0].id.split("CheckBox")[0]);
			}
		}
		return result;
	};

	//add event handlers to needed controls
	this._addEventHandlers = function() {
		var runBtn = $("#queryBtn");
		var that = this;
		runBtn.on("click", function(e) {
			that._reloadTable();
		});
	};

	//load new data into the existing table
	this._reloadTable = function() {
        this._service.getData(
            {
                options: {
                    excludeNull: document.getElementById("excludeNull").checked || false,
                    excludeEmptyStr: document.getElementById("excludeEmptyStr").checked || false
                }
            },
        	{
            	sources: this._getCheckedItems()
			},
			function(response){
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

	//generates the table with the initial data set
	this._generateTable = function() {
		var that = this;
        this._service.getData({
                options: {
                    excludeNull: document.getElementById("excludeNull").checked || false,
                    excludeEmptyStr: document.getElementById("excludeEmptyStr").checked || false
                }
            },
            {
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
	this._generateCharts = function(dataSources) {
		var that = this;
		//first, get a list of all data dimensions
        this._service.getDataDimensions({},
            {
                sources: dataSources
            }, function(response){
                if (response.success) {
                	//group by dim 2
                    this._service.groupDataByDimension({
						dimension: response.data[1],
						options: {
							excludeNull: false,
							exlcluedEmptyStr: false
						}
					},{
                    	sources: dataSources
					},function(response){
                    	if (response.success){
							var chartContainer = document.getElementById("chartContainer");
							var chartElem = document.createElement("div");
							chartElem.className = "chartElem";
							chartElem.id = response.data.dimension;
							chartContainer.appendChild(chartElem);
							console.log(response.data);
							//format the data so highcharts can use it
							var categories = [];
                            var data = [{
                            	name: "Count",
								data: []
							}];
							for (var k in response.data.data) {
								categories.push(k);
								data[0].data.push(response.data.data[k]);
							}


							console.log(categories);
							console.log(data);
							//init highcharts
                            Highcharts.chart(response.data.dimension, {
                                chart: {
                                    type: 'bar'
                                },
                                title: {
                                    text: "Count of " + response.data.dimension
                                },
                                xAxis: {
                                    categories: categories,
                                    title: {
                                        text: null
                                    }
                                },
                                yAxis: {
                                    min: 0,
                                    title: {
                                        text: "count",
                                        align: "high"
                                    },
                                    labels: {
                                        overflow: 'justify'
                                    }
                                },
                                tooltip: {
                                    valueSuffix: "Count"
                                },
                                plotOptions: {
                                    bar: {
                                        dataLabels: {
                                            enabled: true
                                        }
                                    }
                                },
                                legend: {
                                    layout: 'vertical',
                                    align: 'right',
                                    verticalAlign: 'top',
                                    x: -40,
                                    y: 80,
                                    floating: true,
                                    borderWidth: 1,
                                    backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                                    shadow: true
                                },
                                credits: {
                                    enabled: false
                                },
                                series: data
                            });
						}
						else {
                            console.log(response.message);
						}
					}, this);
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
