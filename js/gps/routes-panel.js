var ObjectRoutesPanel = function() {
	var self = this;
	
	extend(this, MapObjectsPanel);

	self.routes = {};
	self.sensors = {};
	self.lRedraw = true;
	
	this.updateRoutes = function() {
		var params = {
			monitoringObjects: self.getCheckedIds(),
			startRoute: $('#period1').val() ? getDate($('#period1').val()) : '',
			endRoute: $('#period2').val() ? getDate($('#period2').val()) : ''
		};
		sendApiRequest('getRoute', 'params=' + JSON.stringify(params), function(response) {
			var _old_objects = [];
			for(var id in self.objects) {
				_old_objects.push(self.objects[id]);
			}
			self.clearObjects();
			self.setObjects(_old_objects, response.data);
			self.render();
			for(var id in self.objects) {
				if (!self.objects[id].isFolder && self.objects[id].checked) {
					self.showObject(id, false);
				}
			}
			self.showMap();
		});
	};

	this.clearObjects = function() {
		map.clearMarkers();
		map.clearLines();
		self.objects = {};
	};
	
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
	};
	
	this.setRoutes = function(routesData) {
		for(var i = 0; i < routesData.length; i++) {
			var id = routesData[i].monitoringObject;
			var data = routesData[i].points;
			self.objects[id].routesEnabled = false;
			if (data && data.length) {
				// data.id = id;
				var points = [];
				for(var j = 0; j < data.length; j++) {
					var point = data[j];
					point.id = point.pointId;
					point.period = point.period.replace(/T/, ' ');
					if (point.parkingEnd) {
						point.parkingEnd = point.parkingEnd.replace(/T/, ' ');
					}
					points.push(point);
				}
				
				self.objects[id].routesEnabled = true;
				self.objects[id].chartsEnabled = true;
				self.objects[id].showRoute = true;
				self.objects[id].showChart = false;
				self.objects[id].routes = points;
				self.objects[id].latlons = points;
			}
		}
	};
	
	this.setMapObject = function(id) {
		self.parent.setMapObject(id, self.objects[id].type);
		if (self.objects[id].checkable && self.objects[id].routesEnabled) {
			map.addLine(self.objects[id]);
			
			var routes = self.objects[id].routes;
			self.pointsStep = (routes.length > 50) ? Math.floor(routes.length / 50) : 1;
			self.pointsCount = self.pointsStep;
			self.objects[id].routeMarkers = [];
			for(var j = 0; j < routes.length; j++) {
				self.addRoutePoint(id, j);
			}
		}
	};
	
	this.addRoutePoint = function(id, i, selected) {
		selected = (selected) ? '-selected' : '';
		var point = self.objects[id].routes[i];
		if (i == 0) {
			map.addMarker(point, 'start' + selected);
			map.bindMarkerPopup(point.id, Tmpl('route-start').render(point));
			self.objects[id].routeMarkers.push(i);
		} else if (i == (self.objects[id].routes.length - 1)) {
			map.addMarker(point, 'finish' + selected);
			map.bindMarkerPopup(point.id, Tmpl('route-finish').render(point));
			self.objects[id].routeMarkers.push(i);
		} else if (in_array(point.status, ['parking'])) {
			map.addMarker(point, point.status + selected);
			map.bindMarkerPopup(point.id, Tmpl('route-' + point.status).render(point));
			self.objects[id].routeMarkers.push(i);
		} else {
			if (self.pointsCount >= self.pointsStep) {
				var nextPoint = self.objects[id].routes[i + 1];
				map.addMarker(point, 'dir' + selected + '-' + getAngle(point, nextPoint));
				map.bindMarkerPopup(point.id, Tmpl('route-' + point.status).render(point));
				self.pointsCount = 1;
				self.objects[id].routeMarkers.push(i);
			} else {
				self.pointsCount++;
			}
		}
	};
	
	this.showObject = function(id, lShowMap) {
		lShowMap = (typeof(lShowMap) == 'undefined') ? true : lShowMap;
		self.parent.showObject(id, false);
		if (self.objects[id].showRoute) {
			self.showRoute(id, false);
		}
		if (lShowMap) {
			self.showMap();
		}
	};

	this.hideObject = function(id, lShowMap) {
		lShowMap = (typeof(lShowMap) == 'undefined') ? true : lShowMap;
		self.parent.hideObject(id, false);
		if (self.objects[id].showRoute) {
			self.hideRoute(id, false);
		}
		if (lShowMap) {
			self.showMap();
		}
	};
	
	this.showRoute = function(id, lShowMap) {
		if (self.objects[id].routesEnabled) {
			lShowMap = (typeof(lShowMap) == 'undefined') ? true : lShowMap;
			var routes = self.objects[id].routes, points = [];
			for (var i = 0; i < routes.length; i++) {
				points.push({lat: routes[i].lat, lon: routes[i].lon});
				if (in_array(i, self.objects[id].routeMarkers)) {
					map.showMarker(routes[i].id);
				}
			}
			map.showLine(id);
			self.objects[id].showRoute = true;

			if (lShowMap) {
				self.showMap();
			}
		}
	};
	
	this.hideRoute = function(id, lShowMap) {
		if (self.objects[id].routesEnabled) {
			var routes = self.objects[id].routes;
			map.hideLine(id);
			for (var i = 0; i < routes.length; i++) {
				if (in_array(i, self.objects[id].routeMarkers)) {
					map.hideMarker(routes[i].id);
				}
			}
			self.objects[id].showRoute = false;

			if (lShowMap) {
				self.showMap();
			}
		}
	};
	
	this.toggleRoute = function(e) {
		var id = $(e).prop('id').replace(/route/, '');
		$(e).toggleClass('disabled');
		if ($(e).hasClass('disabled')) {
			self.hideRoute(id);
		} else {
			self.showRoute(id);
		}
	};
	
	this.updateSensorCharts = function(id) {
		var sensor_ids = [];
		$('#selectSensors [type=checkbox]:checked').each(function(){
			sensor_ids.push($(this).prop('id').replace(/sensor/, ''));
		});
		var params = {
			monitoringObjects: [id],
			startRoute: $('#period1').val() ? getDate($('#period1').val()) : '',
			endRoute: $('#period2').val() ? getDate($('#period2').val()) : '',
			sensors: sensor_ids
		};
		sendApiRequest('getSensorData', 'params=' + JSON.stringify(params), function(response) {
			self.dialog.close();
			self.showCharts(id, response.data[0].sensors);
		});
	};
	
	this.showCharts = function(id, data) {
		var xItems = [], series = [], yAxis = [], opposite = false;
		for(var j = 0; j < data.length; j++) {
			xItems = []; 
			var s_data = [], points = [];
			var _date = '', _showDate = '';
			for(var n = 0; n < data[j].points.length; n++) {
				var _data = data[j].points[n];
				var dt = Date.fromSqlDate(_data.period.replace(/T/, ' '));
				
				xItems.push((_date !== dt.fullDate('rus') ? dt.fullDate('rus') : '') + ' ' + dt.hoursMinutes('rus'));
				s_data.push(_data.data);
				points.push(_data.pointId);
				
				if (_date !== dt.fullDate('rus')) {
					_date = dt.fullDate('rus');
				}
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
	    
	    self.objects[id].showChart = true;
		$('#chart' + id).removeClass('disabled');
	    $('#charts-canvas').show();
	    self.fixPanelHeight();
		$('#charts-canvas').highcharts(options);
	};
	
	this.onChartsClick = function(id) {
		if ($('#charts-canvas:visible').length) {
			$('#charts-canvas').hide();
			self.objects[id].showChart = false;
			$('#chart' + id).addClass('disabled');
			self.fixPanelHeight();
			return;
		}
		
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
		});
	};
	
	this.getRoutePoint = function(id, pointId) {
		for(i = 0; i < self.objects[id].routes.length; i++) {
			if (self.objects[id].routes[i].pointId == pointId) {
				return i;
			}
		}
	};
	
	this.selectPoint = function(id, pointId) {
		// show selected point after unselected to center on shown marker
		if (!$('#route' + id).hasClass('disabled')) {
			setTimeout(function(){
				map.hideMarker(pointId);
				self.addRoutePoint(id, self.getRoutePoint(id, pointId), true);
				map.showMarker(pointId);
			}, 10);
		}
	};
	
	this.unselectPoint = function(id, pointId) {
		if (!$('#route' + id).hasClass('disabled')) {
			map.hideMarker(pointId);
			self.addRoutePoint(id, self.getRoutePoint(id, pointId), false);
			map.showMarker(pointId);
		}
	};

	this.checkAll = function() {
		self.parent.checkAll();
		$('.tmpl-panel-map-object-form .btn').get(0).disabled = !$('.tmpl-panel-map-object-list .info [type=checkbox]:checked').length;
	};

	this.onCheckObject = function(checked, id) {
		self.parent.onCheckObject(checked, id);
		$('.tmpl-panel-map-object-form .btn').get(0).disabled = !$('.tmpl-panel-map-object-list .info [type=checkbox]:checked').length;
	};
	
	this.fixPanelHeight = function() {
		var freeH = self.getFreeHeight([
			'.header', 
			'.tmpl-panel-map-object-list .search', 
			'.tmpl-panel-map-object-list .panel', 
			'.tmpl-panel-map-object-form'
		])-7;
		var panel = $('.tmpl-panel-map-object-list .info').get(0);
		// $(panel).css('height', 'auto');
		$(panel).css('height', freeH + 'px');
		niceScroller(panel);
		
		var divs = ['.header'];
		if ($('#charts-canvas:visible').length) {
			divs.push('#charts-canvas');
		}
		freeH = self.getFreeHeight(divs) + 13;
		$('#map-canvas').css('height', freeH + 'px');
		setTimeout(function(){ map.refresh(); }, 10);
	};
	
	this.showPointData = function(pointId) {
		sendApiRequest('getPointData', 'pointId=' + pointId, function(response){
			$('#point_' + pointId).html(Tmpl('route-sensors').render(response.data));
		});
	};

	this.showMap = function() {
		var points = [];
		console.log('showMap');
		if (!$.isEmptyObject(self.objects)) {
			// show all checked markers
			var lChecked = false;
			for(var id in self.objects) {
				if (!self.objects[id].isFolder) {
					if (self.objects[id].checked && self.objects[id].lat && self.objects[id].lon) {
						lChecked = true;
						points.push({lat: self.objects[id].lat, lon: self.objects[id].lon});
					}
					/*
					var routes = self.objects[id].routes;
					if (routes) {
						for (var i = 0; i < routes.length; i++) {
							points.push({lat: routes[i].lat, lon: routes[i].lon});
						}
					}
					*/
				}
			}
			if (!lChecked) {
				for(var id in self.objects) {
					if (!self.objects[id].isFolder && self.objects[id].lat && self.objects[id].lon) {
						points.push({lat: self.objects[id].lat, lon: self.objects[id].lon});
						// points.push([self.objects[id].lat, self.objects[id].lon]);
					}
				}
			}
		}

		if (points.length) {
			var bounds = L.latLngBounds(points);
			setTimeout(function(){ map.mapL.fitBounds(bounds); }, 500);
		}
	};

};