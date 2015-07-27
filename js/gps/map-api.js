var MapAPI = function(canvas) {
	var self = this;
	
	self.mapL = {};
	self.canvas = canvas;
	self.markers = {};
	self.lines = {};
	self.circles = {};
	self.polygons = {};
	self.colors = ['#FF0000', '#00FF00', '#0000FF', '#990000', '#009900', '#000099'];
	
	this.init = function() {
		self.canvas = canvas;
		self.mapL = L.map(canvas).setView([0, 0], 16);
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(self.mapL);
	}
	
	this.getMarker = function(id) {
		return self.markers[id];
	}
	
	/**
		Object must contain properties: id, title, lat, lon\lng
	**/
	this.addMarker = function(obj, type) {
		var Icons = {
			'default': Point,
			'default-selected': PointSelected,
			'start': StartPoint,
			'start-selected': StartPointSelected,
			'finish': FinishPoint,
			'finish-selected': FinishPointSelected,
			'movement': SmallPoint,
			'movement-selected': PointSelected,
			'parking': ParkingPoint,
			'parking-selected': ParkingPointSelected
		};
		var icon = (type && type.indexOf('icon-') == 0) ? new ObjectIcon({iconUrl: 'img/markers/' + type + '.png'}) : Icons[type || 'default'];
		self.markers[obj.id] = L.marker([obj.lat, obj.lon], {title: obj.title || '', icon: icon});
	}
	
	this.showMarker = function(id) {
		var marker = self.getMarker(id)
		marker.addTo(self.mapL);
		self.showAt(marker.getLatLng(), 16);
	}
	
	this.hideMarker = function(id) {
		self.mapL.removeLayer(self.getMarker(id));
	}
	
	this.clearMarkers = function() {
		for(var id in self.markers) {
			self.hideMarker(id);
		}
		self.markers = {};
	}
	
	this.getMarkerLatLng = function(id) {
		return self.getMarker(id).getLatLng();
	}
	
	this.showAt = function(objLatLng, zoom) {
		self.mapL.setView(objLatLng, zoom);
	}
	
	this.bindMarkerPopup = function(id, html) {
		self.getMarker(id).bindPopup(html);
	}
	
	this.bindMapClick = function(callback) {
		self.mapL.on('click', callback);
	}
	
	this.addLine = function(obj) {
		var i = Object.keys(self.lines).length;
		self.lines[obj.id] = L.polyline(obj.latlons, {color: self.colors[i], weight: 3});
	}
	
	this.getLine = function(id) {
		return self.lines[id];
	}
	
	this.showLine = function(id) {
		var line = self.getLine(id);
		line.addTo(self.mapL);
		var latlons = line.getLatLngs();
		self.showAt(latlons[0]);
		// self.mapL.fitBounds(line.getBounds())
	}
	
	this.hideLine = function(id) {
		self.mapL.removeLayer(self.getLine(id));
	}
	
	this.clearLines = function() {
		for(var id in self.lines) {
			self.hideLine(id);
		}
		self.lines = {};
	}
	
	this.addCircle = function(obj) {
		var i = Object.keys(self.circles).length;
		self.circles[obj.id] = L.circle([obj.lat, obj.lon], obj.radius, {color: self.colors[i]});
	}
	
	this.getCircle = function(id) {
		return self.circles[id];
	}
	
	this.showCircle = function(id) {
		var circle = self.getCircle(id);
		circle.addTo(self.mapL);
		self.showAt(circle.getLatLng());
	}
	
	this.hideCircle = function(id) {
		self.mapL.removeLayer(self.getCircle(id));
	}
	
	this.clearCircles = function() {
		for(var id in self.circles) {
			self.hideCircle(id);
		}
		self.circles = {};
	}
	
	this.addPolygon = function(obj) {
		var i = Object.keys(self.polygons).length;
		self.polygons[obj.id] = L.polygon(obj.latlons, {color: self.colors[i]});
	}
	
	this.getPolygon = function(id) {
		return self.polygons[id];
	}
	
	this.showPolygon = function(id) {
		var polygon = self.getPolygon(id);
		polygon.addTo(self.mapL);
		var latlons = polygon.getLatLngs();
		self.showAt(latlons[0]);
	}
	
	this.hidePolygon = function(id) {
		self.mapL.removeLayer(self.getPolygon(id));
	}
	
	this.clearPolygons = function() {
		for(var id in self.polygons) {
			self.hidePolygon(id);
		}
		self.polygons = {};
	}
}

var PointIcon = L.Icon.extend({
	options: {
		iconSize: [16, 16],
		iconAnchor: [8, 8],
		popupAnchor: [0, -5]
	}
});
var Point = new PointIcon({iconUrl: 'img/markers/point.png'});
var PointSelected = new PointIcon({iconUrl: 'img/markers/point-selected.png'});
/*
var Point = L.icon({
	iconUrl: 'img//markers/point.png',
	iconSize: [16, 16],
	iconAnchor: [8, 8],
	popupAnchor: [0, -5]
});
*/
var SmallPoint = L.icon({
	iconUrl: 'img//markers/small-point.png',
	iconSize: [8, 8],
	iconAnchor: [4, 4],
	popupAnchor: [0, -2]
});

var RouteIcon = L.Icon.extend({
	options: {
		iconSize: [37, 42],
		iconAnchor: [10, 40],
		popupAnchor: [4, -38]
	}
});

var ObjectIcon = L.Icon.extend({
	options: {
		iconSize: [24, 24],
		iconAnchor: [17, 24],
		popupAnchor: [0, -23]
	}
});

var StartPoint = new RouteIcon({iconUrl: 'img//markers/start.png'});
var StartPointSelected = new RouteIcon({iconUrl: 'img//markers/start-selected.png'});
var FinishPoint = new RouteIcon({iconUrl: 'img//markers/finish.png'});
var FinishPointSelected = new RouteIcon({iconUrl: 'img//markers/finish-selected.png'});
var ParkingPoint = new RouteIcon({iconUrl: 'img//markers/parking.png'});
var ParkingPointSelected = new RouteIcon({iconUrl: 'img//markers/parking-selected.png'});