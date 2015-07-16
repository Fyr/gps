var googleMap;

$(function(){
	googleMap = new GoogleMapAPI($('#map-canvas').get(0));
	googleMap.init();
});

var GoogleMapAPI = function(canvas) {
	var self = this;
	
	self.map = {};
	self.canvas = canvas;
	self.markers = {};
	
	this.init = function() {
		self.canvas = canvas;
		var mapOptions = {
			zoom: 16,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		
		self.map = new google.maps.Map(canvas, mapOptions);
	}
	
	this.getMarker = function(id) {
		return self.markers[id];
	}
	
	this.addMarker = function(obj, onclick) {
		var marker = new google.maps.Marker({
            position: new google.maps.LatLng(obj.lat, obj.lng),
            map: null,
            title: obj.title
        });
		self.markers[obj.id] = marker;
	}
	
	this.showMarker = function(id) {
		self._showMarker(id, true);
	}
	
	this.hideMarker = function(id) {
		self._showMarker(id, false);
	}
	
	this._showMarker = function(id, lVisible) {
		var marker = self.getMarker(id);
		marker.setMap(lVisible ? self.map : null);
		if (lVisible) {
			self.map.setCenter(marker.getPosition());
		}
	}
	
	this.clearMarkers = function() {
		for(var id in self.markers) {
			self.hideMarker(id);
		}
		self.markers = {};
	}
	
	this.bindMarkerPopup = function(id, html) {
		google.maps.event.addListener(self.getMarker(id), "click", function(e) {
			var infoWindow = new google.maps.InfoWindow();
			infoWindow.setContent(html);
			infoWindow.open(googleMap.map, googleMap.getMarker(id));
		});
	}
}