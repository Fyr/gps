var GeoObjectsPanel = function() {
	var self = this, $self = $('.tmpl-panel-map-object-list');
	
	extend(this, MapObjectsPanel);
	
	this.update = function() {
		sendApiRequest('getObjectsMap', null, function(response) {
			if (checkJson(response)) {
				$('#checkAll', $self).prop('checked', false).trigger('refresh');
				self.clearObjects();
				self.setObjects(response.data);
				self.show();
			}
		});
	}
	
	this.setObjects = function(data) {
		self.objects = {};
		for(var i = 0; i < data.length; i++) {
			var id = (data[i].id.indexOf('geo-object-') < 0) ? 'geo-object-' + data[i].id : data[i].id;
			data[i].checkable = (data[i].type == 'circle' || data[i].type == 'polygon'); // 
			self.setObjectData(id, data[i]);
			self.setMapObject(id);
		}
	}
	
	this.setObjectData = function(id, data) {
		self.objects[id] = data;
		self.objects[id].id = id;
		self.objects[id].checked = (data.checked) ? data.checked : false;
		self.objects[id].title = data.name;
		self.objects[id].latlons = data.points || [];
		self.objects[id].updated_ago = 0;
	}
	
	this.setMapObject = function(id) {
		if (self.objects[id].checkable) {
			if (self.objects[id].type == 'circle') {
				map.addCircle(self.objects[id]);
			} else if (self.objects[id].type == 'polygon') {
				map.addPolygon(self.objects[id]);
			}
			// map.bindMarkerPopup(id, Tmpl('panel-map-object-infowin').render(self.objects[id]));
		}
	}
	
	this.getObjectLatLng = function(id) {
		if (self.objects[id].type == 'polygon') {
			return self.objects[id].latlons[0];
		}
		return {lat: self.objects[id].lat, lon: self.objects[id].lon};
	}
	
	this.showObject = function(id) {
		if (self.objects[id].type == 'circle') {
			map.showCircle(id);
		}else if (self.objects[id].type == 'polygon') {
			map.showPolygon(id);
		}
	}
	
	this.hideObject = function(id) {
		if (self.objects[id].type == 'circle') {
			map.hideCircle(id);
		} else if (self.objects[id].type == 'polygon') {
			map.hidePolygon(id);
		}
	}
	
	this.clearObjects = function() {
		map.clearCircles();
		map.clearPolygons();
		self.objects = {};
	}
}