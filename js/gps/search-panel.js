var map;
var SearchPanel = function() {
	var self = this;
	
	this.init = function() {
		self.fixPanelHeight();
		map = new MapAPI('map-canvas');
		map.init();
		map.showAt({lat: 53.902568313055085, lon: 27.561521530151367}, 12);
		self.initHandlers();
	};
	
	this.genMarkerId = function() {
		var date = new Date();
		var id = 'marker-' + date.getTime();
		return id;
	};
	
	this.initHandlers = function() {
		$('#q').autoComplete({
			minChars: 3,
			delay: 500,
			source: function(q, callGetItems){
				sendApiRequest('getLocation', {q: q, format: 'json'}, function(response){
					var suggestions = [];
					for (var i = 0; i < response.data.length; i++) { 
						var marker = response.data[i];
						marker.id = self.genMarkerId();
						marker.title = marker.display_name;
						marker.lat = response.data[i].lat;
						marker.lon = response.data[i].lon;
						suggestions.push(marker);
					} 
					callGetItems(suggestions);
				});
			},
			renderItem: function (item, q){
				return Tmpl('search-item').render({item: item, q: q});
			},
			onSelect: function(e, q, $item){
				self.onSearchSelect(json_decode($item.data('item'), true));
            }
		});
	};
	
	this.onSearchSelect = function(marker) {
		map.clearMarkers();
		map.addMarker(marker, 'search');
		map.showMarker(marker.id);
	};
	
	this.getHeight = function(e) {
		return $(e).height() 
			+ parseInt($(e).css('margin-top').replace(/px/, ''))
			+ parseInt($(e).css('margin-bottom').replace(/px/, ''))
			+ parseInt($(e).css('padding-top').replace(/px/, ''))
			+ parseInt($(e).css('padding-bottom').replace(/px/, ''));
	};
	
	this.getFreeHeight = function(aElements) {
		var freeH = $(window).height();
		for(var i = 0; i < aElements.length; i++) {
			freeH-= self.getHeight(aElements[i]);
		}
		return freeH;
	};
	
	this.fixPanelHeight = function() {
		var freeH = self.getFreeHeight(['.header']) - 14;
		$('#map-canvas').css('height', freeH + 'px');
	};
	
};