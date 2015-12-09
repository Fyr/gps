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
		// self.mapL = L.map(canvas).setView([0, 0], 16);
		// L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(self.mapL);
		var layers = {};
		layers[locale.layersStandart] = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {id: 'mapbox.standart'});
		layers[locale.layersTransport] = L.tileLayer('http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', {id: 'mapbox.transport'});
		layers[locale.layersCycle] = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {id: 'mapbox.cycle'});
		layers[locale.layersHumanitarian] = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {id: 'mapbox.humanitarian'});
		layers['Google'] = new L.Google();
		layers['Google Terrain'] = new L.Google('TERRAIN');
		layers['Google'] = new L.Google();
		layers['Yandex'] = new L.Yandex();
		self.mapL = L.map(canvas, {
			center: [0, 0],
			zoom: 16,
			layers: layers[Object.keys(layers)[0]]
		});
		L.control.layers(layers).addTo(self.mapL);
	};
	
	this.getMarker = function(id) {
		return self.markers[id];
	};
	
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
			'parking-selected': ParkingPointSelected,
			'small-point': SmallPoint,
			'search': SearchPoint
		};
		
		var icon;
		if (type && type.indexOf('icon:') == 0) {
			icon = new ObjectIcon({iconUrl: type.replace(/icon\:/, '')});
		} else if (type && type.indexOf('dir-selected-') == 0) {
			icon = DirIconSelected[parseInt(type.replace(/dir-selected-/, ''))];
		} else if (type && type.indexOf('dir-') == 0) {
			icon = DirIcon[parseInt(type.replace(/dir-/, ''))];
		} else {
			icon = Icons[type || 'default'];
		}
		self.markers[obj.id] = L.marker([obj.lat, obj.lon], {title: obj.title || '', icon: icon});
	};
	
	this.showMarker = function(id) {
		var marker = self.getMarker(id);
		marker.addTo(self.mapL);
		self.showAt(marker.getLatLng(), 16);
	};
	
	this.hideMarker = function(id) {
		self.mapL.removeLayer(self.getMarker(id));
	};
	
	this.clearMarkers = function() {
		for(var id in self.markers) {
			self.hideMarker(id);
		}
		self.markers = {};
	};
	
	this.getMarkerLatLng = function(id) {
		return self.getMarker(id).getLatLng();
	};
	
	this.showAt = function(objLatLng, zoom) {
		self.mapL.setView(objLatLng, zoom);
	};
	
	this.bindMarkerPopup = function(id, html) {
		self.getMarker(id).bindPopup(html);
	};
	
	this.bindMapClick = function(callback) {
		self.mapL.on('click', callback);
	};
	
	this.addLine = function(obj) {
		// var i = Object.keys(self.lines).length;
		self.lines[obj.id] = L.polyline(obj.latlons, {color: '#000', weight: 3});
	};
	
	this.getLine = function(id) {
		return self.lines[id];
	};
	
	this.showLine = function(id) {
		var line = self.getLine(id);
		line.addTo(self.mapL);
		var latlons = line.getLatLngs();
		self.showAt(latlons[0]);
		// self.mapL.fitBounds(line.getBounds())
	};
	
	this.hideLine = function(id) {
		self.mapL.removeLayer(self.getLine(id));
	};
	
	this.clearLines = function() {
		for(var id in self.lines) {
			self.hideLine(id);
		}
		self.lines = {};
	};
	
	this.addCircle = function(obj) {
		// var i = Object.keys(self.circles).length; // color = self.colors[i];
		var color = (obj.color) ? obj.color : '#136aec';
		self.circles[obj.id] = L.circle([obj.lat, obj.lon], obj.radius, {color: color, weight: 1});
	};
	
	this.getCircle = function(id) {
		return self.circles[id];
	};
	
	this.showCircle = function(id) {
		var circle = self.getCircle(id);
		circle.addTo(self.mapL);
		self.showAt(circle.getLatLng());
	};
	
	this.hideCircle = function(id) {
		self.mapL.removeLayer(self.getCircle(id));
	};
	
	this.clearCircles = function() {
		for(var id in self.circles) {
			self.hideCircle(id);
		}
		self.circles = {};
	};
	
	this.addPolygon = function(obj) {
		// var i = Object.keys(self.polygons).length; var color = self.colors[i];
		var color = (obj.color) ? obj.color : '#136aec';
		self.polygons[obj.id] = L.polygon(obj.latlons, {color: color, weight: 1});
	};
	
	this.getPolygon = function(id) {
		return self.polygons[id];
	};
	
	this.showPolygon = function(id) {
		var polygon = self.getPolygon(id);
		polygon.addTo(self.mapL);
		var latlons = polygon.getLatLngs();
		self.showAt(latlons[0]);
	};
	
	this.hidePolygon = function(id) {
		self.mapL.removeLayer(self.getPolygon(id));
	};
	
	this.clearPolygons = function() {
		for(var id in self.polygons) {
			self.hidePolygon(id);
		}
		self.polygons = {};
	};
	
	this.refresh = function() {
		self.mapL.invalidateSize({reset: true});
	};
};

var SearchPoint = L.icon({
	iconUrl: 'img/markers/pointer.png',
	iconSize: [41, 41],
	iconAnchor: [10, 40],
	popupAnchor: [4, -38]
});

var PointIcon = L.Icon.extend({
	options: {
		iconSize: [16, 16],
		iconAnchor: [8, 8],
		popupAnchor: [0, -5]
	}
});
var Point = new PointIcon({iconUrl: 'img/markers/point.png'});
var PointSelected = new PointIcon({iconUrl: 'img/markers/point-selected.png'});

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

var StartPoint = new RouteIcon({iconUrl: 'img/markers/start.png'});
var StartPointSelected = new RouteIcon({iconUrl: 'img/markers/start-selected.png'});
var FinishPoint = new RouteIcon({iconUrl: 'img/markers/finish.png'});
var FinishPointSelected = new RouteIcon({iconUrl: 'img/markers/finish-selected.png'});
var ParkingPoint = new RouteIcon({iconUrl: 'img/markers/parking.png'});
var ParkingPointSelected = new RouteIcon({iconUrl: 'img/markers/parking-selected.png'});

var DirIcon = [];
var DirIconSelected = [];
for (var i = 0; i < 360; i += 10) {
	DirIcon[i] = L.divIcon({className: 'line-marker-' + i, iconSize: [16, 16]});
	DirIconSelected[i] = L.divIcon({className: 'line-marker-selected-' + i, iconSize: [16, 16]});
}

function getAngle(point, nextPoint) {
    var angle = Math.atan2(
        	(parseFloat(nextPoint.lon) * 100000 - parseFloat(point.lon) * 100000),
        	(parseFloat(nextPoint.lat) * 100000 - parseFloat(point.lat) * 100000)
    	) * (180 / Math.PI);
    if (angle < 0) {
        angle += 360;
    }
    for (var i = 0; i < 360; i += 10) {
        if (angle > (i - 5) && angle <= (i + 5)) {
            return i;
        }
    }
    return 0;
}