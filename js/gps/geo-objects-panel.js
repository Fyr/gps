var GeoObjectsPanel = function() {
	var self = this, $self = $('.tmpl-panel-map-object-list');
	
	extend(this, MapObjectsPanel);
	
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
	
	this.showObject = function(id) {
		if (self.objects[id].type == 'circle') {
			map.showCircle(id);
			var icon = self.getIcon(self.objects[id].icon);
			if (icon) {
				map.showMarker(id + '-icon');
			}
		}else if (self.objects[id].type == 'polygon') {
			map.showPolygon(id);
		}
	};
	
	this.hideObject = function(id) {
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
	
	this.edit = function() {
		self.dialog = new Popup({
			title: locale.addObject,
			content: Tmpl('popup-geoobject-edit').render(self)
		});
		self.dialog.open();
		
		$('#editForm [type=text]').focus(function(){
			self.dialog.hideFieldError($(this));
		});
		
		var miniMap = new MapAPI('minimap-canvas');
		miniMap.init();
		miniMap.showAt(self.getInitialLocation());
		miniMap.bindMapClick(function(e){
			var $radius = $('#editForm [name="radius"]');
			if ($('#editForm select[name="_type"]').val() == 'circle') {
				if (!$radius.val() && !$radius.hasClass('error')) {
					self.dialog.showFieldError($radius, locale.radiusRequired);
				} else {
					self.dialog.hideFieldError($('span.type'));
				}
				$('#editForm [name="lat"]').val(e.latlng.lat);
				$('#editForm [name="lon"]').val(e.latlng.lng);
				self.miniMap.clearCircles();
				self.miniMap.addCircle({id: 'edit-circle', lat: e.latlng.lat, lon: e.latlng.lng, radius: $radius.val()});
				self.miniMap.showCircle('edit-circle');
				/*
				miniMap.addMarker({id: id + '-eventForm', lat: e.latlng.lat, lon: e.latlng.lng});
				miniMap.showMarker(id + '-eventForm');
				*/
			} else if ($('#editForm select[name="_type"]').val() == 'polygon') {
				self.dialog.hideFieldError($('span.type'));
				self.addMiniMapPoint(e.latlng);
			}
			
		});
		self.miniMap = miniMap;
		self.miniMapPoints = [];
		self.changeType();
	};
	
	this.addMiniMapPoint = function(point) {
		var count = self.miniMapPoints.length;
		var id = 'edit-point-' + count;
		self.miniMapPoints.push(point);
		self.miniMap.clearPolygons();
		
		if (count >= 2) {
			self.miniMap.clearMarkers();
			self.miniMap.addPolygon({id: 'edit-polygon', latlons: self.miniMapPoints});
			self.miniMap.showPolygon('edit-polygon');
		} else {
			self.miniMap.addMarker({id: id, lat: point.lat, lon: point.lng}, 'small-point');
			self.miniMap.showMarker(id);
		}
	};
	
	this.isFormValid = function() {
		var $name = $('#editForm input[name="name"]');
		if (!$name.val()) {
			self.dialog.showFieldError($name, locale.errBlankField);
		}
		
		if ($('#editForm select[name="_type"]').val() == 'circle') {
			if (!($('#editForm [name="lat"]').val() && $('#editForm [name="lon"]').val())) {
				self.dialog.showFieldError($('span.type'), locale.errNoLocation);
			}
		}
		
		return !$('#editForm .error').length;
	};
	
	this.changeType = function() {
		var type = $('[name="_type"]').val();
		$('#editForm [name="type"]').val(self.settings.types[type]);
		$('.type').hide();
		$('.type-' + type).show();
		
		self.miniMap.clearCircles();
		self.miniMapPoints = [];
		self.miniMap.clearPolygons();
	};
	
	this.save = function() {
		if (self.isFormValid()) {
			var data = $('#editForm').serialize();
			self.dialog.close();
			sendApiRequest('post.poi', data, function(){
				self.dialog = new PopupInfo({
					title: locale.createEvent, 
					text: locale.geoObjectCreated
				});
				self.dialog.open();
			});
		}
	};
};