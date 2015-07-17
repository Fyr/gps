var ObjectRoutesPanel = function() {
	var self = this, $self = $('.leftSide');
	
	extend(this, MapObjectsPanel);
	
	this.update = function() {
		sendApiRequest('getTopicalityData', null, function(response) {
			if (checkJson(response)) {
				var objectsData = response.data;
				var ids = [];
				for(var i = 0; i < objectsData.length; i++) {
					var id = objectsData[i].guid;
					ids.push(id);
				}
				var params = {
					monitoringObjects: ids,
					startRoute: $('#period1').val() + 'T00:00:00',
					endRoute: $('#period2').val() + 'T00:00:00'
				}
				
				sendApiRequest('getRoute', 'params=' + JSON.stringify(params), function(response) {
					if (checkJson(response)) {
						$('#checkAll', $self).prop('checked', false).trigger('refresh');
						$('.rightSide, .tmpl-panel-map-object-list').show();
						
						objectsData = self.mergeData(objectsData, response.data);
						self.clearObjects();
						self.setObjects(objectsData);
						self.show();
					}
				});
			}
		});
	}
	
	this.mergeData = function(objectsData, routesData) {
		var routes = {};
		for(var i = 0; i < routesData.length; i++) {
			var id = routesData[i].monitoringObject;
			routes[id] = routesData[i].points;
		}
		
		self.objects = {};
		for(var i = 0; i < objectsData.length; i++) {
			var id = objectsData[i].guid;
			objectsData[i].latlons = routes[id] || [];
		}
		return objectsData;
	}
	
	this.setObjects = function(objectsData) {
		self.objects = {};
		for(var i = 0; i < objectsData.length; i++) {
			var id = objectsData[i].guid;
			var data = objectsData[i];
			data.checkable = data.topicality && data.latlons.length;
			self.setObjectData(id, data);
			self.setMapObject(id);
		}
	}
	
	this.setMapObject = function(id) {
		if (self.objects[id].checkable) {
			map.addLine(self.objects[id]);
			var latlonsStart = self.objects[id].latlons[0];
			var latlonsFinish = self.objects[id].latlons[self.objects[id].latlons.length - 1];
			map.addMarker({id: id + '_start', title: 'start route', lat: latlonsStart.lat, lon: latlonsStart.lon});
			map.addMarker({id: id + '_finish', title: 'finish route', lat: latlonsFinish.lat, lon: latlonsFinish.lon});
			// map.addMarker(latlons[latlons.length - 1]);
			// map.addMarker(self.objects[id]);
			// map.bindMarkerPopup(id, Tmpl('panel-map-object-infowin').render(self.objects[id]));
		}
	}
	
	this.showObject = function(id) {
		map.showMarker(id + '_finish');
		map.showMarker(id + '_start');
		map.showLine(id);
	}
	
	this.hideObject = function(id) {
		map.hideMarker(id + '_start');
		map.hideMarker(id + '_finish');
		map.hideLine(id);
	}
	
	this.clearObjects = function() {
		map.clearMarkers();
		map.clearLines();
		self.objects = {};
	}
	
	this.getObjectLatLng = function(id) {
		var latlonsStart = self.objects[id].latlons[0];
		return {lat: latlonsStart.lat, lon: latlonsStart.lon};
	}
}