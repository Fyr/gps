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
	
	this.addMarker = function(obj) {
		var marker = L.marker([obj.lat, obj.lon], {title: obj.title});
		
		self.markers[obj.id] = marker;
	}
	
	this.showMarker = function(id) {
		self.getMarker(id).addTo(self.mapL);
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
}