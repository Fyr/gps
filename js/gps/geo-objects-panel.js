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
				
				self.settings.types = [
					{
						"guid": "circle",
						"name": "Окружность"
					},
					{
						"guid": "polygon",
						"name": "Полигон"
					}
				];
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
		var id = Object.keys(self.objects)[0];
		var ids = self.getCheckedIds();
		if (ids.length) {
			id = ids[0];
		}
		
		self.dialog = new Popup({
			title: locale.addObject,
			content: Tmpl('popup-geoobject-edit').render(self)
		});
		self.dialog.open();
		
		$('.miniColors').minicolors({
	    	animationSpeed: 50,
	    	animationEasing: 'swing',
			change: null,
			changeDelay: 0,
			// control: 'hue',
			defaultValue: '',
			hide: null,
			hideSpeed: 100,
			inline: false,
			letterCase: 'lowercase',
			opacity: false,
			position: 'bottom left',
			show: null,
			showSpeed: 100,
			// theme: 'bootstrap'
		});
		
		$('#iconsSelectBox').ImageSelect({ 
			height: 16,
			width: 75,
			dropdownWidth: 400,
			borderColor:'#fff200'
		});
		
		$('#editForm [name="radius"]').focus(function(){
			$(this).removeClass('error');
			$(this).parent().find('span.note.error').remove();
		});
		
		var miniMap = new MapAPI('minimap-canvas');
		miniMap.init();
		miniMap.showAt(self.objects[id]);
		miniMap.bindMapClick(function(e){
			var radius = $('[name="radius"]').val();
			if ($('#editForm [name="type"]').val() == 'circle') {
				if (!radius && !$('#editForm [name="radius"]').hasClass('error')) {
					$('#editForm [name="radius"]')
						.addClass('error')
						.parent().append('<span class="note error">' + locale.radiusRequired + '</span>');
				}
				
				$('#eventForm [name="location[lat]"]').val(e.latlng.lat);
				$('#eventForm [name="location[lon]"]').val(e.latlng.lng);
				self.miniMap.clearCircles();
				self.miniMap.addCircle({id: 'edit-circle', lat: e.latlng.lat, lon: e.latlng.lng, radius: radius});
				self.miniMap.showCircle('edit-circle');
				/*
				miniMap.addMarker({id: id + '-eventForm', lat: e.latlng.lat, lon: e.latlng.lng});
				miniMap.showMarker(id + '-eventForm');
				*/
				self.updateFormState();
			} else if ($('#editForm [name="type"]').val() == 'polygon') {
				self.addMiniMapPoint(e.latlng);
			}
		});
		self.miniMap = miniMap;
		self.miniMapPoints = [];
		self.changeType();
		self.updateFormState();
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
		return $('#editForm [name="name"]').val();
	};
	
	this.updateFormState = function() {
		$('#editForm .btn').get(0).disabled = !self.isFormValid();
	};
	
	this.changeType = function() {
		var type = $('[name="type"]').val();
		$('.type').hide();
		$('.type-' + type).show();
		
		self.miniMap.clearCircles();
		self.miniMapPoints = [];
		self.miniMap.clearPolygons();
	};
	
	this.save = function() {
		var data = $('#editForm').serialize();
		self.dialog.close();
		sendApiRequest('post.objectsMap', data, function(){
			self.dialog = new PopupInfo({
				title: locale.createEvent, 
				text: locale.geoObjectCreated
			});
			self.dialog.open();
		});
	};
};