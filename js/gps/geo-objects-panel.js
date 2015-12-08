var GeoObjectsPanel = function() {
	var self = this, $self = $('.tmpl-panel-map-object-list');
	
	extend(this, MapObjectsPanel);
	extend(this, GeoObjectsModel);
	
	self.settings = {};
	
	this.update = function() {
		sendApiRequest('poi', null, function(response) {
			if (checkJson(response)) {
				$('#checkAll', $self).prop('checked', false).trigger('refresh');
				self.clearObjects();
				self.setObjects(response.data);
				self.show();
				
				self.settings.types = {
					"circle": "Точка",
					"polygon": "Полигон"
				};
			}
		});
	};
	
	this.setObjects = function(data) {
		self.objects = {};
		for(var i = 0; i < data.length; i++) {
			var id = data[i].guid; // (data[i].id.indexOf('geo-object-') < 0) ? 'geo-object-' + data[i].guid :
			if (data[i].type == 'Точка') {
				data[i].type = 'circle';
			} else if (data[i].type == 'Полигон') {
				data[i].type = 'polygon';
			}
			
			data[i].checkable = (data[i].type == 'circle' || data[i].type == 'polygon'); // 
			self.setObjectData(id, data[i]);
			self.setMapObject(id);
		}
	};
	
	this.setObjectData = function(id, data) {
		self.objects[id] = data;
		self.objects[id].id = id;
		self.objects[id].checked = (data.checked) ? data.checked : false;
		self.objects[id].title = data.name;
		self.objects[id].latlons = data.points || [];
		self.objects[id].updated_ago = -1;
	};
	
	this.setMapObject = function(id) {
		if (self.objects[id].checkable) {
			if (self.objects[id].type == 'circle') {
				map.addCircle(self.objects[id]);
				var icon = self.getIcon(self.objects[id].icon);
				if (icon) {
					var obj = self.objects[id];
					map.addMarker({id: id + '-icon', lat: obj.lat, lon: obj.lon, title: obj.name}, 'icon:' + icon);
				}
			} else if (self.objects[id].type == 'polygon') {
				map.addPolygon(self.objects[id]);
			}
			// map.bindMarkerPopup(id, Tmpl('panel-map-object-infowin').render(self.objects[id]));
		}
	};
	
	this.getObjectLatLng = function(id) {
		if (self.objects[id].type == 'polygon') {
			return self.objects[id].latlons[0];
		}
		return {lat: self.objects[id].lat, lon: self.objects[id].lon};
	};
	
	this.showObject = function(id, lShowMap) {
		if (self.objects[id].type == 'circle') {
			var icon = self.getIcon(self.objects[id].icon);
			if (icon) {
				map.showMarker(id + '-icon');
			}
			map.showCircle(id);
		} else if (self.objects[id].type == 'polygon') {
			map.showPolygon(id);
		}
	};

	this.hideObject = function(id, lShowMap) {
		if (self.objects[id].type == 'circle') {
			map.hideCircle(id);
			var icon = self.getIcon(self.objects[id].icon);
			if (icon) {
				map.hideMarker(id + '-icon');
			}
		} else if (self.objects[id].type == 'polygon') {
			map.hidePolygon(id);
		}
	};

	this.clearObjects = function() {
		map.clearCircles();
		map.clearPolygons();
		self.objects = {};
	};

	this.showMap = function() {
		var points = [];
		if (!$.isEmptyObject(self.objects)) {
			// show all checked markers
			var lChecked = false;
			for(var id in self.objects) {
				if (!self.objects[id].isFolder && self.objects[id].checked) {
					lChecked = true;
					self.pushPoints(id, points);
				}
			}
			if (!lChecked) {
				for(var id in self.objects) {
					self.pushPoints(id, points);
				}
			}
		}

		if (points.length) {
			var bounds = L.latLngBounds(points);
			setTimeout(function(){ map.mapL.fitBounds(bounds); }, 500);
		}
	};
};