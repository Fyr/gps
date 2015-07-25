var map;
var SearchPanel = function() {
	var self = this;
	
	this.init = function() {
		self.fixPanelHeight();
		map = new MapAPI('map-canvas');
		map.init();
		map.showAt({lat: 53.902568313055085, lon: 27.561521530151367}, 12);
		self.initHandlers();
	}
	
	this.initHandlers = function() {
		$('#q').autoComplete({
			minChars: 3,
			delay: 500,
			source: function(q, callGetItems){
				sendApiRequest('getLocation', {adress: q}, function(response){
					var suggestions = [];
					for (var i = 0; i < response.data.length; i++) { 
						suggestions.push(response.data[i]);
					} 
					callGetItems(suggestions);
				});
			},
			renderItem: function (item, q){
				return Tmpl('search-item').render({item: item, q: q});
			},
			onSelect: function(e, q, item){
				map.clearMarkers();
				var marker = $(item).data();
				marker.id = 'map-marker';
				map.addMarker(marker);
				map.showMarker('map-marker');
            }
		});
	}
	
	this.getHeight = function(e) {
		return $(e).height() 
			+ parseInt($(e).css('margin-top').replace(/px/, ''))
			+ parseInt($(e).css('margin-bottom').replace(/px/, ''))
			+ parseInt($(e).css('padding-top').replace(/px/, ''))
			+ parseInt($(e).css('padding-bottom').replace(/px/, ''));
	}
	
	this.getFreeHeight = function(aElements) {
		var freeH = $(window).height();
		for(var i = 0; i < aElements.length; i++) {
			freeH-= self.getHeight(aElements[i]);
		}
		freeH-= 14; // padding for mainContainer
		return freeH;
	}
	
	this.fixPanelHeight = function() {
		var freeH = self.getFreeHeight(['.header']);
		$('#map-canvas').css('height', freeH + 'px');
	}
	
}