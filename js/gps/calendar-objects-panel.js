var CalendarObjectsPanel = function() {
	var self = this;
	
	self.PLANNED = 0;
	self.OCCURED = 1;
	self.FAILED = 2;
	
	extend(this, MapObjectsPanel);
	
	this.init = function (){
		self.events = {};
		self.events[self.PLANNED] = [];
		self.events[self.OCCURED] = [];
		self.events[self.FAILED] = [];
		self.allEvents = {};
		
		self.parent.init();
	};
	
	this.onCheckObject = function(checked, id) {
		$('#loadEvents').get(0).disabled = !$('.tmpl-panel-map-object-list .info [type=checkbox]:checked').length;
		self.parent.onCheckObject(checked, id);
	};
	
	this.getEvents = function(status) {
		return self.events[status];
		if (self.events[status].length) {
			return self.events[status];
		}
		return [];
	};
	
	this.loadEvents = function() {
		var params = {
			monitoringObjects: self.getCheckedIds()
		};
		sendApiRequest('events', 'params=' + JSON.stringify(params), function(response) {
			// $('#smallCalendar').show();
			self.processEvents(response.data);
			$('#calendar').fullCalendar('refetchEvents');
		});
	};
	
	this.processEvents = function(objects) {
		self.allEvents = {};
		self.events[self.PLANNED] = [];
		self.events[self.OCCURED] = [];
		self.events[self.FAILED] = [];
		for(var j = 0; j < objects.length; j++) {
			var data = objects[j].events;
			for(var i = 0; i < data.length; i++) {
				var event = data[i];
				event.id = data[i].guid;
				event.monitoringObject = objects[j].monitoringObject;
				event.title = data[i].summary;
				event.start = data[i].beginOfPeriod.replace(/T/, ' ');
				event.end = data[i].endOfPeriod.replace(/T/, ' ');
				event.beginOfPeriod = data[i].beginOfPeriod.replace(/T/, ' ');
				event.endOfPeriod = data[i].endOfPeriod.replace(/T/, ' ');
				event.statusName = self.getStatusName(event.status);
				self.events[data[i].status].push(event);
				self.allEvents[event.id] = event;
			}
		}
	};
	
	this.getEvent = function(event_id) {
		return self.allEvents[event_id];
	};
	
	this.showSchedule = function() {
		$('.fc-schedule-view table').hide();
		$('.fc-schedule-view').addClass('block');
		$('.fc-schedule-view').append(Tmpl('schedule').render({events: self.allEvents}));
	};
	
	this.showEvent = function(event_id) {
		var event = self.getEvent(event_id);
		dialog = new Popup({
			title: event.title,
			content: Tmpl('popup-event-view').render(event)
		});
		dialog.open();
		
		var miniMap = new MapAPI('minimap-canvas');
		miniMap.init();
		miniMap.addMarker({id: event.id, lat: event.location.lat, lon: event.location.lon, title: event.summary});
		miniMap.showMarker(event.id);
	};
	
	this.getObjectOptions = function() {
		var options = {};
		for(var id in self.objects) {
			if (!self.objects[id].isFolder) {
				options[id] = self.objects[id].title;
			}
		}
		return options;
	};
	
	this.edit = function(id) {
		var event = self.getEvent(id);
		dialog = new Popup({
			title: (id) ? locale.recordEdit : locale.recordCreate,
			content: Tmpl('popup-event-edit').render({objectOptions: self.getObjectOptions(), event: event})
		});
		dialog.open();
		
		var miniMap = new MapAPI('minimap-canvas');
		miniMap.init();
		if (event) {
			miniMap.addMarker({id: event.id, lat: event.location.lat, lon: event.location.lon, title: event.summary});
			miniMap.showMarker(event.id);
		} else {
			miniMap.showAt(self.getInitialLocation());
		}

		miniMap.bindMapClick(function(e){
			$('#eventForm [name="location[lat]"]').val(e.latlng.lat);
			$('#eventForm [name="location[lon]"]').val(e.latlng.lng);
			miniMap.clearMarkers();
			miniMap.addMarker({id: id + '-eventForm', lat: e.latlng.lat, lon: e.latlng.lng});
			miniMap.showMarker(id + '-eventForm');
		});

		self.miniMap = miniMap;
		
		// extra handlers for popup inputs
		$('#eventForm input[type=text]').focus(function(){
			self.dialog.hideFieldError($(this));
		});
		
		self.dialog = dialog;
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
	
	this.genMarkerId = function() {
		var date = new Date();
		var id = 'marker-' + date.getTime();
		return id;
	};
	
	this.onSearchSelect = function(marker) {
		self.miniMap.clearMarkers();
		self.miniMap.addMarker(marker);
		self.miniMap.showMarker(marker.id);
		$('#eventForm [name="location[lat]"]').val(marker.lat);
		$('#eventForm [name="location[lon]"]').val(marker.lon);
	};
	
	this.isFormValid = function() {
		var $summary = $('#eventForm [name="summary"]');
		if (!$summary.val()) {
			self.dialog.showFieldError($summary, locale.errBlankField);
		}
		
		var $start = $('#eventForm [name="beginOfPeriod"]');
		if (!$start.val()) {
			self.dialog.showFieldError($start, locale.errBlankField);
		}
		
		var $end = $('#eventForm [name="endOfPeriod"]');
		if (!$end.val()) {
			self.dialog.showFieldError($end, locale.errBlankField);
		}
		
		if (!($('#eventForm [name="location[lat]"]').val() && $('#eventForm [name="location[lon]"]').val())) {
			self.dialog.showFieldError($('#q'), locale.errNoLocation);
		}
		
		return !$('#eventForm .error').length;
	};
	
	this.saveEvent = function(id) {
		if (self.isFormValid()) {
			$('#eventForm .rome-datetime').each(function(){
				$(this).val($(this).val().replace(/\s/, 'T'));
			});
			var data =json_encode($('#eventForm').serializeObject());
			self.dialog.close();
			sendApiRequest((id) ? 'put.events?guid=' + id : 'post.events', data, function(){
				self.dialog = new PopupInfo({
					title: id ? locale.recordEdit : locale.createEvent,
					text: id ? locale.recordSaved : locale.eventCreated,
				});
				self.dialog.open();
			});
		}
	};

	this.removeEvent = function(id) {
		self.dialog.close();
		sendApiRequest('delete.events?guid=' + id, null, function(){
			self.dialog = new PopupInfo({
				title: locale.recordDelete,
				text:locale.recordRemoved,
			});
			self.dialog.open();
		});
	};

	this.fixPanelHeight = function() {
		
	};
	
	this.getStatusName = function(status) {
		var aNames = {};
		aNames[self.PLANNED] = locale.eventPlanned;
		aNames[self.OCCURED] = locale.eventOccured;
		aNames[self.FAILED] = locale.eventFailed;
		return aNames[status];
	};
	
	this.onClickEvent = function(id) {
		var event = self.getEvent(id);
		if (event.status == self.PLANNED) {
			self.edit(id);
		} else {
			self.showEvent(id);
		}
	};
}