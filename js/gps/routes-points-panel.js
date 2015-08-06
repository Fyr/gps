var RoutesPointsPanel = function() {
	var self = this;
	
	extend(this, SearchPanel);
	self.objects = {};

	this.init = function() {
		self.parent.init();
		self.render();
		map.bindMapClick(function(e){ self.onMapClick(e); });
	};
	
	this.render = function() {
		$('.tmpl-panel-routes-points-list .info').html(Tmpl('panel-routes-points-item').render(self));
		self.fixPanelHeight();
	};
	
	this.onSearchSelect = function(marker) {
		self.addObject(marker);
		self.show();
	};
	
	this.onMapClick = function(e) {
		sendApiRequest('getAdress', {params: json_encode(e.latlng)}, function(response){
			var marker = {
				id: self.genMarkerId(),
				lat: e.latlng.lat,
				lon: e.latlng.lng,
				title: response.data
			};
			self.addObject(marker);
			self.show();
		});
	};
	
	this.addObject = function(marker) {
		self.objects[marker.id] = marker;
	};
	
	this.onObjectRemove = function (id) {
		delete self.objects[id];
		self.show();
	};
	
	this.show = function() {
		self.render();
		
		map.clearMarkers();
		map.clearLines();
		var first = Object.keys(self.objects)[0];
		var last = Object.keys(self.objects)[Object.keys(self.objects).length - 1];
		var latlons = [];
		for(var id in self.objects) {
			var type = 'movement';
			if (id == first) {
				type = 'start';
			} else if (id == last) {
				type = 'finish';
			}
			map.addMarker(self.objects[id], type);
			map.showMarker(id);
			latlons.push(map.getMarkerLatLng(id));
		}
		if (latlons.length > 1) {
			map.addLine({id: 'route', latlons: latlons});
			map.showLine('route');
		}
	};
	
	this.fixPanelHeight = function() {
		var freeH = self.getFreeHeight(['.header', '.tmpl-panel-routes-points-list .search']) - 28;
		var panel = $('.tmpl-panel-routes-points-list .info').get(0);
		$(panel).css('height', 'auto');
		
		var panelH = self.getHeight(panel); 
		if (panelH > freeH) {
			$(panel).css('height', freeH + 'px');
			$(panel).niceScroll({autohidemode:false, cursorcolor: "#ecdc00", background: "#dddddd", cursorborderradius: "0", cursorwidth: "7px"});
		}
		
		freeH = self.getFreeHeight(['.header']) - 28;
		$('#map-canvas').css('height', freeH + 16 + 'px');
	};
};
