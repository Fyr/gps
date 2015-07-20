var ObjectRoutesPanel = function() {
	var self = this, $self = $('.leftSide');
	
	extend(this, MapObjectsPanel);

	self.routes = {};
	self.sensors = {};
	
	this.updateRoutes = function() {
		var params = {
			monitoringObjects: self.getCheckedIds(),
			startRoute: $('#period1').val() ? $('#period1').val() + 'T00:00:00' : '',
			endRoute: $('#period2').val() ? $('#period2').val() + 'T00:00:00' : ''
		};
		sendApiRequest('getRoute', 'params=' + JSON.stringify(params), function(response) {
			var _old_objects = [];
			for(var id in self.objects) {
				_old_objects.push(self.objects[id]);
			}
			self.clearObjects();
			self.setObjects(_old_objects, response.data);
			self.show();
		});
		
		var params = {
			monitoringObjects: self.getCheckedIds()
		};
		sendApiRequest('getSensors', 'params=' + JSON.stringify(params), function(response){
			var sensors = {};
			for(var i = 0; i < response.data.length; i++) {
				var id = response.data[i].monitoringObject;
				for(var j = 0; j < response.data[i].sensors.length; j++) {
					var data = response.data[i].sensors[j];
					sensors[data.guid] = data.name;
				}
			}
			for(var id in sensors) {
				var option = '<option value="' + id + '">' + sensors[id] + '</option>';
				$('select').append(option);
			}
			$('select').styler({selectPlaceholder: locale.selectSensor});
			$('#sensors').show();
		});
	}
	
	this.setObjects = function(data, routesData) {
		self.objects = {};
		for(var i = 0; i < data.length; i++) {
			var id = data[i].guid;
			data[i].checkable = (data[i].topicality) && true;
			self.setObjectData(id, data[i]);
		}
		
		if (routesData) {
			self.setRoutes(routesData);
		}
		
		for(var id in self.objects) {
			self.setMapObject(id);
		}
	}
	
	this.clearObjects = function() {
		map.clearMarkers();
		map.clearLines();
		self.objects = {};
	}
	
	this.setRoutes = function(routesData) {
		for(var i = 0; i < routesData.length; i++) {
			var id = routesData[i].monitoringObject;
			var data = routesData[i].points;
			self.objects[id].routesEnabled = false;
			if (data && data.length) {
				data.id = id;
				for(var j = 0; j < data.length; j++) {
					var route = data[j];
					route.id = route.pointId;
					route.period = route.period.replace(/T/, ' ');
					if (route.parkingEnd) {
						route.parkingEnd = route.parkingEnd.replace(/T/, ' ');
					}
				}
				self.objects[id].routesEnabled = true;
				self.objects[id].showRoute = false;
				self.objects[id].routes = data;
				self.objects[id].latlons = data;
			}
		}
	}
	
	this.setMapObject = function(id) {
		self.parent.setMapObject(id);
		
		if (self.objects[id].checkable && self.objects[id].routesEnabled) {
			map.addLine(self.objects[id]);
			for(var j = 0; j < self.objects[id].routes.length; j++) {
				var route = self.objects[id].routes[j];
				if (j == 0) {
					map.addMarker(route);
					map.bindMarkerPopup(route.id, Tmpl('route-start').render(route));
				} else if (j == (self.objects[id].routes.length - 1)) {
					map.addMarker(route);
					map.bindMarkerPopup(route.id, Tmpl('route-finish').render(route));
				} else {
					map.addMarker(route);
					map.bindMarkerPopup(route.id, Tmpl('route-' + route.status).render(route));
				}
			}
		}
	}
	
	this.showObject = function(id) {
		self.parent.showObject(id);
		if (self.objects[id].showRoute) {
			self.showRoute(id);
		}
	}
	
	this.showRoute = function(id) {
		var routes = self.objects[id].routes;
		for(var i = 0; i < routes.length; i++) {
			map.showMarker(routes[i].id);
		}
		map.showLine(id);
		self.objects[id].showRoute = true;
	}
	
	this.hideRoute = function(id) {
		var routes = self.objects[id].routes;
		map.hideLine(id);
		for(var i = 0; i < routes.length; i++) {
			map.hideMarker(routes[i].id);
		}
		self.objects[id].showRoute = false;
	}
	
	this.toggleRoute = function(e) {
		var id = $(e).prop('id').replace(/route/, '');
		$(e).toggleClass('disabled');
		if ($(e).hasClass('disabled')) {
			self.hideRoute(id);
		} else {
			self.showRoute(id);
		}
	}
	
	this.updateSensorCharts = function(sensor_code) {
		var params = {
			monitoringObjects: self.getCheckedIds(),
			startRoute: $('#period1').val() ? $('#period1').val() + 'T00:00:00' : '',
			endRoute: $('#period2').val() ? $('#period2').val() + 'T00:00:00' : '',
			sensors: [sensor_code]
		}
		sendApiRequest('getSensorData', 'params=' + JSON.stringify(params), function(response) {
			self.showCharts(response.data);
		});
	}
	
	this.showCharts = function(data) {
		var xItems = [], series = [];
		
		for(var i = 0; i < data.length; i++) {
			for(var j = 0; j < data[i].sensors.length; j++) {
				xItems = []; 
				var s_data = [], points = [];
				for(var n = 0; n < data[i].sensors[j].points.length; n++) {
					var _data = data[i].sensors[j].points[n];
					var dt = Date.fromSqlDate(_data.period.replace(/T/, ''));
					xItems.push(dt.fullDate('rus') + ' ' + dt.hoursMinutes('rus'));
					s_data.push(_data.data);
					points.push(_data.pointId);
				}
			}
			var id = data[i].monitoringObject;
			series.push({name: self.objects[id].title, data: s_data, guid: id, points: points});
		}
		var options = {
	        title: {
	            text: locale.chartsTitle,
	            x: -20 //center
	        },
	        subtitle: {
	            text: $('.jq-selectbox__select-text').html(),
	            x: -20
	        },
	        xAxis: {
	            categories: xItems
	        },
	        yAxis: {
	            title: {
	                text: locale.chartYAxis
	            }
	        },
	        tooltip: {
	            shared: true
	        },
	        legend: {
	            layout: 'vertical',
	            align: 'right',
	            verticalAlign: 'top',
	            borderWidth: 0,
	            floating: true
	        },
	        series: series,
	        chart: { 
	        	zoomType: 'xy'
	        },
	        credits: {
				enabled: false
			},
			plotOptions: {
				series: {
					allowPointSelect: true,
					point: {
						events: {
							select: function(e) {
								self.selectPoint(e.target.series.userOptions.guid, e.target.series.userOptions.points[e.target.index]);
								// console.log([e.target.index, e.target.series.userOptions.guid, e.target.series.userOptions.points]);
							},
							unselect: function(e) {
								self.unselectPoint(e.target.series.userOptions.guid, e.target.series.userOptions.points[e.target.index]);
								// console.log(e);
								// console.log([e.target.index, e.target.series.userOptions.guid, e.target.series.userOptions.points]);
							}
						}
					}
				}
			}
	    };
		$('#charts-canvas').highcharts(options);
	}
	
	this.getPointLatLon = function(id, pointId) {
		for(i = 0; i < self.objects[id].routes.length; i++) {
			
		}
	}
	
	this.selectPoint = function(id, pointId) {
		
	}
	
	this.unselectPoint = function(id, PointId) {
		
	}
}