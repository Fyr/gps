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
			var html = Tmpl('popup-add-object').render();
			var dialog = new Popup({
				title: 'Добавление обьекта',
				content: Tmpl('popup-add-object').render()
			});
			dialog.open();
		});
		$('.outerSearch input[type=text]', $self).keyup(function(){
			self.filterObjects($(this).val());
		});
	}
	
	this.update = function() {
		sendApiRequest('getTopicalityData', null, function(response) {
			if (checkJson(response)) {
				$('#checkAll', $self).prop('checked', false).trigger('refresh');
				self.clearObjects();
				self.setObjects(response.data);
				self.show();
			}
		});
	}
	
	this.setObjects = function(data) {
		self.objects = {};
		for(var i = 0; i < data.length; i++) {
			var id = data[i].guid;
			data[i].checkable = (data[i].topicality) && true;
			self.setObjectData(id, data[i]);
			self.setMapObject(id);
		}
	}
	
	this._updatedAgo = function(date) {
		var now = new Date();
		return Math.floor((now.getTime() - Date.fromSqlDate(date).getTime()) / Date.HOUR);
	}
	
	this.setObjectData = function(id, data) {
		self.objects[id] = data;
		self.objects[id].id = id;
		self.objects[id].checked = (data.checked) ? data.checked : false;
		self.objects[id].title = data.name;
		self.objects[id].updated_ago = (data.topicality) ? self._updatedAgo(data.topicality.replace(/T/, ' ')) : 0;
	}
	
	this.setMapObject = function(id) {
		if (self.objects[id].checkable) {
			map.addMarker(self.objects[id]);
			map.bindMarkerPopup(id, Tmpl('panel-map-object-infowin').render(self.objects[id]));
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
	
	this.filterObjects = function(q) {
		var visible = [];
		for(id in self.objects) {
			if (!q || self.objects[id].title.toLowerCase().indexOf(q.toLowerCase()) > -1) {
				visible.push(self.objects[id]);
			}
		}
		_old_objects = self.objects;
		self.clearObjects();
		self.setObjects(visible);
		self.show();
		self.objects = _old_objects;
	}
	
	this.checkAll = function() {
		var $e = $('#checkAll', $self);
		var checked = $e.prop('checked');
		// $('.item input[type=checkbox]', $self).prop('checked', checked).trigger('refresh');
		$('.item input[type=checkbox]', $self).each(function(){
			$(this).prop('checked', checked).trigger('refresh');
			$(this).change(); // call indirectly onchange for this checkbox
		});
		if (checked) {
			this.showMap();
		}
	}
	
	this.onCheckObject = function(checked, id) {
		self.objects[id].checked = checked; // save checked state for sorting
		self.hideObject(id);
		if (checked) {
			self.showObject(id);
		}
	}
	
	this.render = function() {
		$('.info', $self).html('');
		var html = '';
		for(var i in self.objects) {
			html+= Tmpl('panel-map-object-item').render(self.objects[i]);
		}
		if (!html) {
			html = '<div style="text-align: center; margin: 10px 0"> - нет обьектов -</div>';
		}
		$('.info', $self).html(html);
		$('input[type=checkbox]', $self).styler();
	}
	
	this.show = function() {
		self.render();
		self.showMap();
	}
	
	this.showMap = function() {
		if (!$.isEmptyObject(self.objects)) {
			// show all checked markers
			for(var id in self.objects) {
				if (self.objects[id].checked) {
					self.showObject(id);
				}
			}
			
			// show map for 1st marker (hidden or checked)
			var id = Object.keys(self.objects)[0];
			for(var _id in self.objects) {
				if (self.objects[_id].checked) {
					id = _id;
					break;
				}
			}
			map.showAt(self.getObjectLatLng(id));
		}
	}
	
	this.getObjectLatLng = function(id) {
		return {lat: self.objects[id].lat, lon: self.objects[id].lon};
	}
	
	this.getCheckedIds = function() {
		var ids = [];
		for(var id in self.objects) {
			if (self.objects[id].checked) {
				ids.push(id);
			}
		}
		return ids;
	}
	
	this.showObject = function(id) {
		map.showMarker(id);
	}
	
	this.hideObject = function(id) {
		map.hideMarker(id);
	}
	
	this.clearObjects = function() {
		map.clearMarkers();
		self.objects = {};
	}
}