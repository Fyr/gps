var map;

$(function(){
	map = new MapAPI('map-canvas');
	map.init();
});

var MapAPI = function(canvas) {
	var self = this;
	
	self.mapL = {};
	self.canvas = canvas;
	self.markers = {};
	self.lines = {};
	self.colors = ['#FF0000', '#00FF00', '0000FF'];
	
	this.init = function() {
		self.canvas = canvas;
		self.mapL = L.map(canvas).setView([0, 0], 16);
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
			maxZoom: 18,
			id: 'mapbox.streets'
		}).addTo(self.mapL);
	}
	
	this.getMarker = function(id) {
		return self.markers[id];
	}
	
	/**
		Object must contain properties: id, title, lat, lon\lng
	**/
	this.addMarker = function(obj) {
		self.markers[obj.id] = L.marker([obj.lat, obj.lon], {title: obj.title});
	}
	
	this.showMarker = function(id) {
		var marker = self.getMarker(id)
		marker.addTo(self.mapL);
		self.showAt(marker.getLatLng());
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
	
	this.showAt = function(objLatLng) {
		self.mapL.setView(objLatLng);
	}
	
	this.bindMarkerPopup = function(id, html) {
		self.getMarker(id).bindPopup(html);
	}
	
	this.addLine = function(obj) {
		var i = Object.keys(self.lines).length;
		self.lines[obj.id] = L.polyline(obj.latlons, {color: self.colors[i]});
	}
	
	this.getLine = function(id) {
		return self.lines[id];
	}
	
	this.showLine = function(id) {
		var line = self.getLine(id);
		line.addTo(self.mapL);
		var latlons = line.getLatLngs();
		self.showAt(latlons[0]);
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
}