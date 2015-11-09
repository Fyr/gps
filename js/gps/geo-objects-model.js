var GeoObjectsModel = function() {
	var self = this;
	
	this.edit = function(id) {
		self.id = id;
		self.dialog = new Popup({
			title: (id) ? locale.recordEdit : locale.recordCreate,
			content: Tmpl('popup-geoobject-edit').render(self)
		});
		self.dialog.open();
		
		$('#editForm [type=text]').focus(function(){
			self.dialog.hideFieldError($(this));
		});
		
		var miniMap = new MapAPI('minimap-canvas');
		miniMap.init();
		if (id) {
			if (self.objects[id].type == 'circle') {
				miniMap.addCircle(self.objects[id]);
				var icon = self.getIcon(self.objects[id].icon);
				if (icon) {
					var obj = self.objects[id];
					miniMap.addMarker({id: id + '-icon', lat: obj.lat, lon: obj.lon, title: obj.name}, 'icon:' + icon);
				}
			} else if (self.objects[id].type == 'polygon') {
				miniMap.addPolygon(self.objects[id]);
			}
		}
		miniMap.showAt(self.getInitialLocation(id));
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
					title: locale.addObject, 
					text: locale.geoObjectCreated
				});
				self.dialog.open();
			});
		}
	};
	
};