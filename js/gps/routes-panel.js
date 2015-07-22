var ObjectRoutesPanel = function() {
	var self = this;
	
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
					var point = data[j];
					point.id = point.pointId;
					point.period = point.period.replace(/T/, ' ');
					if (point.parkingEnd) {
						point.parkingEnd = point.parkingEnd.replace(/T/, ' ');
					}
				}
				self.objects[id].routesEnabled = true;
				self.objects[id].chartsEnabled = true;
				self.objects[id].showRoute = true;
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
				self.addRoutePoint(id, j);
			}
		}
	}
	
	this.addRoutePoint = function(id, i, selected) {
		selected = (selected) ? '-selected' : '';
		var point = self.objects[id].routes[i];
		if (i == 0) {
			map.addMarker(point, 'start' + selected);
			map.bindMarkerPopup(point.id, Tmpl('route-start').render(point));
		} else if (i == (self.objects[id].routes.length - 1)) {
			map.addMarker(point, 'finish' + selected);
			map.bindMarkerPopup(point.id, Tmpl('route-finish').render(point));
		} else {
			map.addMarker(point, point.status + selected);
			map.bindMarkerPopup(point.id, Tmpl('route-' + point.status).render(point));
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
	
	this.updateSensorCharts = function(id) {
		var sensor_ids = [];
		$('#selectSensors [type=checkbox]:checked').each(function(){
			sensor_ids.push($(this).prop('id').replace(/sensor/, ''));
		});
		var params = {
			monitoringObjects: [id],
			startRoute: $('#period1').val() ? $('#period1').val() + 'T00:00:00' : '',
			endRoute: $('#period2').val() ? $('#period2').val() + 'T00:00:00' : '',
			sensors: [sensor_ids]
		}
		sendApiRequest('getSensorData', 'params=' + JSON.stringify(params), function(response) {
			self.dialog.close();
			self.showCharts(id, response.data[0].sensors);
		});
	}
	
	this.showCharts = function(id, data) {
		var xItems = [], series = [], yAxis = [], opposite = false;
		for(var j = 0; j < data.length; j++) {
			xItems = []; 
			var s_data = [], points = [];
			for(var n = 0; n < data[j].points.length; n++) {
				var _data = data[j].points[n];
				var dt = Date.fromSqlDate(_data.period.replace(/T/, ''));
				xItems.push(dt.fullDate('rus') + ' ' + dt.hoursMinutes('rus'));
				s_data.push(_data.data);
				points.push(_data.pointId);
			}
			var sensorTitle = self.sensors[id][data[j].sensor];
			yAxis.push({opposite: opposite, title: {text: sensorTitle}});
			series.push({name: sensorTitle, data: s_data, yAxis: j, guid: id, points: points});
			
			opposite = !opposite;
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
	        yAxis: yAxis,
	        tooltip: {
	            shared: true
	        },
	        legend: {
	            layout: 'vertical',
	            align: 'right',
	            verticalAlign: 'top',
	            borderWidth: 0,
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
							},
							unselect: function(e) {
								self.unselectPoint(e.target.series.userOptions.guid, e.target.series.userOptions.points[e.target.index]);
							}
						}
					}
				}
			}
	    };
		$('#charts-canvas').highcharts(options);
	}
	
	this.onChartsClick = function(id) {
		var params = {
			monitoringObjects: [id]
		};
		sendApiRequest('getSensors', 'params=' + JSON.stringify(params), function(response){
			self.sensors[id] = {};
			var sensors = {};
			for(var i = 0; i < response.data[0].sensors.length; i++) {
				var sensor = response.data[0].sensors[i];
				sensors[sensor.guid] = sensor.name;
			}
			self.sensors[id] = sensors;
			
			self.dialog = new Popup({
				title: locale.selectSensors,
				content: Tmpl('popup-check-sensors').render({id: id, sensors: response.data[0].sensors})
			});
			self.dialog.open();
			$('[type=checkbox]').styler();
		});
	}
	
	this.getRoutePoint = function(id, pointId) {
		for(i = 0; i < self.objects[id].routes.length; i++) {
			if (self.objects[id].routes[i].pointId == pointId) {
				return i;
			}
		}
	}
	
	this.selectPoint = function(id, pointId) {
		// show selected point after unselected to center on shown marker
		if (!$('#route' + id).hasClass('disabled')) {
			setTimeout(function(){
				map.hideMarker(pointId);
				self.addRoutePoint(id, self.getRoutePoint(id, pointId), true);
				map.showMarker(pointId);
			}, 10);
		}
	}
	
	this.unselectPoint = function(id, pointId) {
		if (!$('#route' + id).hasClass('disabled')) {
			map.hideMarker(pointId);
			self.addRoutePoint(id, self.getRoutePoint(id, pointId), false);
			map.showMarker(pointId);
		}
	}
	
	this.onCheckObject = function(checked, id) {
		$('.tmpl-panel-map-object-form .btn').get(0).disabled = !$('.tmpl-panel-map-object-list .info [type=checkbox]:checked').length
		self.parent.onCheckObject(checked, id);
	}
}