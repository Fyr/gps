var GeoObjectsModel = function() {
	var self = this;
	
	this.edit = function(id) {
		self.id = id;
		self.dialog = new Popup({
			title: (id) ? locale.recordEdit : locale.recordCreate,
			content: Tmpl('popup-geoobject-edit').render(self)
		});
		self.dialog.open();

		self.miniMap = new MapAPI('minimap-canvas');
		var miniMap = self.miniMap;
		miniMap.init();

		self.changeType();

		$('#editForm [type=text]').focus(function(){
			self.dialog.hideFieldError($(this));
		});

		if (id) {
			if (self.objects[id].type == 'circle') {
				var obj = self.objects[id];
				miniMap.addCircle({id: 'edit-circle', lat: obj.lat, lon: obj.lon, radius: obj.radius});
				miniMap.showCircle('edit-circle');
				var icon = self.getIcon(self.objects[id].icon);
				if (icon) {
					var obj = self.objects[id];
					miniMap.addMarker({id: 'edit-icon', lat: obj.lat, lon: obj.lon, title: obj.name}, 'icon:' + icon);
					miniMap.showMarker('edit-icon');
				}
			} else if (self.objects[id].type == 'polygon') {
				miniMap.addPolygon(self.objects[id]);
				miniMap.showPolygon(id);
			}
		}
		// miniMap.showAt(self.getInitialLocation(id));
		var points = [];
		for(var id in self.objects) {
			self.pushPoints(id, points);
		}
		if (points.length) {
			var bounds = L.latLngBounds(points);
			// miniMap.mapL.fitBounds(bounds);
			setTimeout(function(){ miniMap.mapL.fitBounds(bounds); }, 50);
		}

		miniMap.bindMapClick(function(e){
			var $radius = $('#editForm [name="radius"]');
			if ($('#editForm select[name="_type"]').val() == 'circle') {
				if (!$radius.val() && !$radius.hasClass('error')) {
					self.dialog.showFieldError($radius, locale.radiusRequired);
				} else {
					self.dialog.hideFieldError($('span.type'));
				}
				if ($radius.val()) {
					$('#editForm [name="lat"]').val(e.latlng.lat);
					$('#editForm [name="lon"]').val(e.latlng.lng);
					self.miniMap.clearCircles();
					self.miniMap.addCircle({
						id: 'edit-circle',
						lat: e.latlng.lat,
						lon: e.latlng.lng,
						radius: $radius.val(),
						color: $('[name="color"]').val()
					});
					self.miniMap.showCircle('edit-circle');

					self.miniMap.clearMarkers();
					var icon = self.getIcon($('[name="icon"]').val());
					self.miniMap.addMarker({
						id: 'edit-icon',
						lat: e.latlng.lat,
						lon: e.latlng.lng,
						title: $('[name="name"]').val()
					}, 'icon:' + icon);
					self.miniMap.showMarker('edit-icon');
				}
			} else if ($('#editForm select[name="_type"]').val() == 'polygon') {
				self.dialog.hideFieldError($('span.type'));
				self.addMiniMapPoint(e.latlng);
			}
		});
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
		
		self.miniMapPoints = [];
		self.miniMap.clearMarkers();
		self.miniMap.clearCircles();
		self.miniMap.clearPolygons();
	};
	
	this.save = function(id) {
		if (self.isFormValid()) {
			var data = json_encode($('#editForm').serializeObject());
			self.dialog.close();
			sendApiRequest(id ? 'put.poi?guid=' + id : 'post.poi', data, function(){
				self.dialog = new PopupInfo({
					title: id ? locale.recordEdit : locale.addObject,
					text: id ? locale.recordSaved : locale.geoObjectCreated
				});
				self.dialog.open();
			});
		}
	};

	this.pushPoints = function(id, points) {
		if (self.objects[id].type == 'circle') {
			if (self.objects[id].lat && self.objects[id].lon && self.objects[id].radius) {
				points.push({
					lat: self.objects[id].lat - self.objects[id].radius / 10000,
					lon: self.objects[id].lon - self.objects[id].radius / 10000
				});
				points.push({
					lat: self.objects[id].lat + self.objects[id].radius / 10000,
					lon: self.objects[id].lon + self.objects[id].radius / 10000
				});
			}
		} else if (self.objects[id].type == 'polygon' && self.objects[id].points) {
			for(var i = 0; i < self.objects[id].points.length; i++) {
				if (self.objects[id].points[i].lat && self.objects[id].points[i].lon) {
					points.push({lat: self.objects[id].points[i].lat, lon: self.objects[id].points[i].lon});
				}
			}
		}
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
};