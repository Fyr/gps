var ObjectRoutesPanel = function() {
	var self = this, $self = $('.leftSide');
	
	extend(this, MapObjectsPanel);

	self.routes = {};
	
	this.toggleRoute = function(e, id) {
		$(e).toggleClass('icon-routes-disabled');
	}
	
	this.updateRoutes = function() {
		var ids = [];
		for(var i = 0; i < self.objects.length; i++) {
			var id = self.objects[i].guid;
			ids.push(id);
		}
		var params = {
			monitoringObjects: ids,
			startRoute: $('#period1').val() + 'T00:00:00',
			endRoute: $('#period2').val() + 'T00:00:00'
		}
		
		sendApiRequest('getRoute', 'params=' + JSON.stringify(params), function(response) {
			if (checkJson(response)) {
				var _old_objects = self.objects;
				//self.clearObjects();
				// console.log(_old_objects);
				// self.setObjects(_old_objects);
				self.setRoutes(response.data);
				self.show();
			}
		});
	}
	
	/*
	this.clearObjects = function() {
		map.clearMarkers();
		map.clearLines();
		self.objects = {};
	}
	*/
	
	this.setRoutes = function(routesData) {
		self.routes = {};
		$('.icon-routes').hide();
		for(var i = 0; i < routesData.length; i++) {
			var id = routesData[i].monitoringObject;
			var data = routesData[i];
			if (data.points && data.points.length) {
				data.id = id;
				for(var j = 0; j < data.points.length; j++) {
					var route = data.points[j];
					route.id = route.pointId;
					route.period = route.period.replace(/T/, ' ');
					if (route.parkingEnd) {
						route.parkingEnd = route.parkingEnd.replace(/T/, ' ');
					}
					if (j == 0) {
						map.addMarker(route);
						map.bindMarkerPopup(route.id, Tmpl('route-start').render(route));
					} else if (j == (data.points.length - 1)) {
						map.addMarker(route);
						map.bindMarkerPopup(route.id, Tmpl('route-finish').render(route));
					} else {
						map.addMarker(route);
						map.bindMarkerPopup(route.id, Tmpl('route-' + route.status).render(route));
					}
				}
				data.latlons = data.points;
				self.routes[id] = data;
				
				map.addLine(data);
			}
		}
	}
	
	this.show = function() {
		self.parent.render();
		self.parent.showMap();
		self.showRoutesAvail();
	}
	
	this.showRoutesAvail = function() {
		for(var id in self.routes) {
			$('#route' + id).show();
		}
	}
	
	this.showRoute = function(id) {
		// var id = $(e).prop('id').replace(/route/, '');
		var routes = self.routes[id];
		for(var i = 0; i < routes.points.length; i++) {
			map.showMarker(routes.points[i].id);
		}
		map.showLine(id);
	}
	
	this.hideRoute = function(id) {
		// var id = $(e).prop('id').replace(/route/, '');
		var routes = self.routes[id];
		map.hideLine(id);
		for(var i = 0; i < routes.points.length; i++) {
			map.hideMarker(routes.points[i].id);
		}
	}
	
	this.toggleRoute = function(e) {
		var id = $(e).prop('id').replace(/route/, '');
		$(e).toggleClass('icon-routes-disabled');
		if ($(e).hasClass('icon-routes-disabled')) {
			self.hideRoute(id);
		} else {
			self.showRoute(id);
		}
	}
}