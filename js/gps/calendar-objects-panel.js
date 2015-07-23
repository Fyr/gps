var CalendarObjectsPanel = function() {
	var self = this;
	
	extend(this, MapObjectsPanel);
	
	self.events = [];
		
	this.onCheckObject = function(checked, id) {
		$('#loadEvents').get(0).disabled = !$('.tmpl-panel-map-object-list .info [type=checkbox]:checked').length;
		self.parent.onCheckObject(checked, id);
	}
	
	this.getEvents = function() {
		return self.events;
	}
	
	this.loadEvents = function() {
		var params = {
			monitoringObjects: self.getCheckedIds()
		};
		sendApiRequest('getEvents', 'params=' + JSON.stringify(params), function(response) {
			$('#smallCalendar').show();
			self.processEvents(response.data);
			$('#calendar').fullCalendar('refetchEvents');
		});
	}
	
	this.processEvents = function(objects) {
		self.events = [];
		for(var j = 0; j < objects.length; j++) {
			var data = objects[j].events;
			for(var i = 0; i < data.length; i++) {
				var event = data[i];
				event.title = data[i].summary;
				event.start = data[i].start.replace(/T/, ' ');
				event.end = data[i].end.replace(/T/, ' ');
				self.events.push(event);
			}
		}
	}
}