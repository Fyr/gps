var MapObjectsPanel = function() {
	var self = this, $self = $('.tmpl-panel-map-object-list');
	
	self.objects = {};
	
	this.init = function() {
		self.update();
		self.initHandlers();
	}
	
	this.initHandlers = function() {
		$('.panel input[type=checkbox]', $self).change(function(){
			self.checkAll();
		});
		$('.panel .icon-align-alphabet', $self).click(function(){
			self.sortObjects(1);
		});
		$('.panel .icon-align-alphabet-back', $self).click(function(){
			self.sortObjects(0);
		});
		$('.panel .icon-refresh', $self).click(function(){
			self.update();
		});
		$('.panel #addObject', $self).click(function(){
			console.log('#tmpl-popup-add-object:' + $('#tmpl-popup-add-object').length);
			console.log('1!');
			var html = Tmpl('popup-add-object').render();
			console.log('2!');
			var dialog = new Popup({
				title: 'Добавление обьекта',
				content: Tmpl('popup-add-object').render()
			});
			dialog.open();
		});
	}
	
	this.update = function() {
		sendApiRequest('getTopicalityData', null, function(response) {
			if (checkJson(response)) {
				$('#checkAll', $self).prop('checked', false).trigger('refresh');
				googleMap.clearMarkers();
				self.setObjects(response.data);
				self.show();
			}
		});
	}
	
	this._updatedAgo = function(date) {
		var now = new Date();
		return Math.floor((now.getTime() - Date.fromSqlDate(date).getTime()) / Date.HOUR);
	}
	
	this.setObjects = function(data) {
		self.objects = {};
		for(var i = 0; i < data.length; i++) {
			var id = data[i].guid;
			self.objects[id] = data[i];
			self.objects[id].id = id;
			self.objects[id].checked = false;
			self.objects[id].title = data[i].name;
			self.objects[id].updated_ago = self._updatedAgo(data[i].topicality.replace(/T/, ' '));
			googleMap.addMarker(self.objects[id]);
		}
	}
	
	this.sortObjects = function(lDesc) {
		// convert objects to array to be able to perform array sorting
		var aTitles = [];
		for(var id in self.objects) {
			aTitles.push({
				id: id,
				title: self.objects[id].title,
				item: self.objects[id],
				toString: function() {
					return this.title;
				}
			});
		}
		aTitles.sort();
		if (lDesc) {
			aTitles.reverse();
		}
		var objects = {};
		for(var i = 0; i < aTitles.length; i++) {
			var id = aTitles[i].id;
			objects[id] = aTitles[i].item;
		}
		
		self.objects = objects;
		self.show();
	}
	
	this.checkAll = function() {
		var $e = $('#checkAll', $self);
		var checked = $e.prop('checked');
		// $('.item input[type=checkbox]', $self).prop('checked', checked).trigger('refresh');
		$('.item input[type=checkbox]', $self).each(function(){
			$(this).prop('checked', checked).trigger('refresh');
			$(this).change(); // call indirectly onchange for this checkbox
		});
		this.showMap();
	}
	
	this.onCheckObject = function(checked, id) {
		self.objects[id].checked = checked; // save checked state for sorting
		googleMap.hideMarker(id);
		if (checked) {
			googleMap.showMarker(id);
		}
	}
	
	this.render = function() {
		$('.info', $self).html('');
		var html = '';
		for(var i in self.objects) {
			html+= Tmpl('panel-map-object-item').render(self.objects[i]);
		}
		$('.info', $self).html(html);
		$('input[type=checkbox]', $self).styler();
	}
	
	this.show = function() {
		self.render();
		self.showMap();
	}
	
	this.showMap = function() {
		if (self.objects) {
			// show map for 1st marker
			var id = Object.keys(self.objects)[0];
			for(var _id in self.objects) {
				if (self.objects[_id].checked) {
					id = _id;
					break;
				}
			}
			var marker = googleMap.getMarker(id); 
			googleMap.map.setCenter(marker.getPosition());
		}
	}
}