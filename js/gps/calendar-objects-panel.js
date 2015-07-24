var CalendarObjectsPanel = function() {
	var self = this;
	
	self.PLANNED = locale.eventPlanned;
	self.OCCURED = locale.eventOccured;
	self.FAILED = locale.eventFailed;
	
	extend(this, MapObjectsPanel);
	
	this.init = function (){
		self.events = {};
		self.events[self.PLANNED] = [];
		self.events[self.OCCURED] = [];
		self.events[self.FAILED] = [];
		self.allEvents = {};
		
		self.parent.init();
	}
	
	this.onCheckObject = function(checked, id) {
		$('#loadEvents').get(0).disabled = !$('.tmpl-panel-map-object-list .info [type=checkbox]:checked').length;
		self.parent.onCheckObject(checked, id);
	}
	
	this.getEvents = function(status) {
		return self.events[status];
		if (self.events[status].length) {
			return self.events[status];
		}
		return [];
	}
	
	this.loadEvents = function() {
		var params = {
			monitoringObjects: self.getCheckedIds()
		};
		sendApiRequest('events', 'params=' + JSON.stringify(params), function(response) {
			$('#smallCalendar').show();
			self.processEvents(response.data);
			$('#calendar').fullCalendar('refetchEvents');
		});
	}
	
	this.processEvents = function(objects) {
		self.allEvents = {};
		self.events[self.PLANNED] = [];
		self.events[self.OCCURED] = [];
		self.events[self.FAILED] = [];
		for(var j = 0; j < objects.length; j++) {
			var data = objects[j].events;
			for(var i = 0; i < data.length; i++) {
				var event = data[i];
				event.title = data[i].summary;
				event.start = data[i].start.replace(/T/, ' ');
				event.end = data[i].end.replace(/T/, ' ');
				self.events[data[i].status].push(event);
				self.allEvents[data[i].id] = event;
			}
		}
	}
	
	this.getEvent = function(event_id) {
		return self.allEvents[event_id];
	}
	
	this.showSchedule = function() {
		$('.fc-schedule-view table').hide();
		$('.fc-schedule-view').addClass('block');
		$('.fc-schedule-view').append(Tmpl('schedule').render({events: self.allEvents}));
	}
	
	this.showEvent = function(event_id) {
		var event = self.getEvent(event_id);
		dialog = new Popup({
			title: event.title,
			content: Tmpl('popup-event-view').render(event)
		});
		dialog.open();
		
		var miniMap = new MapAPI('minimap-canvas');
		miniMap.init();
		miniMap.addMarker({id: event.id, lat: event.location.lat, lon: event.location.lon, title: event.title});
		miniMap.showMarker(event.id);
	}
	
	this.getObjectOptions = function() {
		var options = {};
		for(var id in self.objects) {
			options[id] = self.objects[id].title;
		}
		return options;
	}
	
	this.createEvent = function() {
		var id = Object.keys(self.objects)[0];
		var ids = self.getCheckedIds();
		if (ids.length) {
			id = ids[0];
		}
		
		dialog = new Popup({
			title: locale.createEvent,
			content: Tmpl('popup-event-edit').render({objectOptions: self.getObjectOptions()})
		});
		
		$('.rome-datetime').each(function(){
			rome(this);
		});
		$('select').styler();
		
		dialog.open();
		var miniMap = new MapAPI('minimap-canvas');
		miniMap.init();
		miniMap.showAt(self.objects[id]);
		miniMap.bindMapClick(function(e){
			$('#eventForm [name="location[lat]"]').val(e.latlng.lat);
			$('#eventForm [name="location[lon]"]').val(e.latlng.lng);
			miniMap.clearMarkers();
			miniMap.addMarker({id: id + '-eventForm', lat: e.latlng.lat, lon: e.latlng.lng});
			miniMap.showMarker(id + '-eventForm');
			self.updateEventForm();
		});
		
		self.dialog = dialog;
	}
	
	this.isFormValid = function() {
		return $('#eventForm [name="summary"]').val() && $('#eventForm [name="start"]').val() && $('#eventForm [name="end"]').val() 
			&& $('#eventForm [name="location[lat]"]').val() && $('#eventForm [name="location[lon]"]').val()
	}
	
	this.updateEventForm = function() {
		$('#eventForm .btn').get(0).disabled = !self.isFormValid();
	}
	
	this.saveEvent = function() {
		var data = $('#eventForm').serialize();
		self.dialog.close();
		sendApiRequest('post.events', data, function(){
			self.dialog = new Popup({
				title: locale.createEvent, 
				content: Tmpl('popup-event-created').render()
			});
			self.dialog.open();
		});
	}
	
	this.eventCreated = function() {
		self.dialog.close();
		if (!$.isEmptyObject(self.allEvents)) {
			self.loadEvents();
		}
	}
}