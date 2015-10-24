var map;
var MapObjectsPanel = function() {
	var self = this;
	$self = $('.tmpl-panel-map-object-list');
	
	self.objects = {};
	self.settings = {};
	
	this.init = function() {
		self.fixPanelHeight();
		map = new MapAPI('map-canvas');
		map.init();
		// self.update();
		self.setObjectSettings(function(){ self.update(); });
		self.initHandlers();
	};
	
	this.initHandlers = function() {
		$('.panel input[type=checkbox]', $self).change(function(){
			self.checkAll();
		});
		$('.panel .fa-sort-alpha-asc', $self).click(function(){
			$('.fa-sort-alpha-asc').toggle();
			$('.fa-sort-alpha-desc').toggle();
			self.sortObjects(0);
		});
		$('.panel .fa-sort-alpha-desc', $self).click(function(){
			$('.fa-sort-alpha-asc').toggle();
			$('.fa-sort-alpha-desc').toggle();
			self.sortObjects(1);
		});
		/*
		$('.panel .icon-align-alphabet-back', $self).click(function(){
			self.sortObjects(1);
		});
		$('.panel .icon-align-alphabet', $self).click(function(){
			self.sortObjects(0);
		});
		*/
		$('.panel .fa-plus-square-o, .panel .fa-minus-square-o', $self).click(function(){
			self.onToggleAll();
		});
		
		$('.panel .fa-list-alt, .panel .fa-list', $self).click(function(){
			self.onToggleView();
		});
		$('.panel .fa-refresh', $self).click(function(){
			self.updateStatus();
		});
		$('.outerSearch input[type=text]', $self).keyup(function(){
			self.filterObjects($(this).val());
		});
		
		$('.handle').click(function() {
			if (!$(this).hasClass('closed')) {
				$('.leftSide').addClass('closed');
				$(this).addClass('closed').text("»");
			} else {
				$('.leftSide').removeClass('closed');
				$(this).removeClass('closed').text("«");
			}
		});
	};
	
	this.edit = function() {
		var editFn = function() {
			self.dialog = new Popup({
				title: locale.addObject,
				content: Tmpl('popup-add-object').render(self)
			});
			self.dialog.open();
		};
		if ($.isEmptyObject(self.settings)) {
			self.setObjectSettings(editFn);
		} else {
			editFn();
		}
	};
	
	this.setObjectSettings = function(nextFn) {
		sendApiRequest('getDataForSelect', null, function(response){
			self.settings = {users: [], iconsAll: {}, iconsPoi: {}, iconsObjects: {}};
			for(var i = 0; i < response.data.users.length; i++) {
				var row = response.data.users[i];
				self.settings.users.push({name: row.name, guid: row.guid}) ;
			}
			for(var i = 0; i < response.data.monitoringObjectIcons.length; i++) {
				var row = response.data.monitoringObjectIcons[i];
				self.settings.iconsObjects[row.guid] = row.name;
				self.settings.iconsAll[row.guid] = row.name;
			}
			for(var i = 0; i < response.data.poiIcons.length; i++) {
				var row = response.data.poiIcons[i];
				self.settings.iconsPoi[row.guid] = row.name;
				self.settings.iconsAll[row.guid] = row.name;
			}
			if (nextFn) {
				nextFn();
			}
		});
	};
	
	this.update = function() {
		sendApiRequest('getTopicalityData', null, function(response) {
			$('#checkAll', $self).prop('checked', false).trigger('refresh');
			self.clearObjects();
			self.setObjects(response.data);
			self.show();
		});
	};
	
	this.updateStatus = function() {
		sendApiRequest('getTopicalityData', null, function(response) {
			for(var i = 0; i < response.data.length; i++) {
				var data = response.data[i];
				var id = data.guid;
				data.checkable = (data.topicality) && true;
				data.checked = (self.objects[id].checked) && true;
				data.opened = (self.objects[id].opened) && true;
				self.setObjectData(id, data);
			}
			self.render();
		});
	};
	
	this.setObjects = function(data) {
		self.objects = {};
		for(var i = 0; i < data.length; i++) {
			var id = data[i].guid;
			data[i].checkable = (data[i].topicality) && true;
			self.setObjectData(id, data[i]);
			self.setMapObject(id, self.getIcon(data[i].icon));
		}
	};
	
	this.getIcon = function(iconID) {
		return (self.settings.iconsAll[iconID]) ? self.settings.iconsAll[iconID] : '';
	};
	
	this._updatedAgo = function(date) {
		var now = new Date();
		return Math.floor((now.getTime() - Date.fromSqlDate(date).getTime()) / Date.HOUR);
	};
	
	this.setObjectData = function(id, data) {
		self.objects[id] = data;
		self.objects[id].id = id;
		self.objects[id].checked = (data.checked) ? data.checked : false;
		self.objects[id].title = data.name;
		self.objects[id].updated_ago = (data.topicality) ? self._updatedAgo(data.topicality.replace(/T/, ' ')) : -1;
	};
	
	this.setMapObject = function(id, icon) {
		if (self.objects[id].checkable) {
			map.addMarker(self.objects[id], (icon) ? 'icon:' + icon : '');
			map.bindMarkerPopup(id, Tmpl('panel-map-object-infowin').render(self.objects[id]));
		}
	};
	
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
	};
	
	this.filterObjects = function(q) {
		var visible = [];
		for(id in self.objects) {
			if (!q || self.objects[id].title.toLowerCase().indexOf(q.toLowerCase()) > -1) {
				visible.push(self.objects[id]);
			}
		}
		var _old_objects = self.objects;
		self.clearObjects();
		self.setObjects(visible);
		self.show();
		self.objects = _old_objects;
	};
	
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
	};
	
	this.onCheckObject = function(checked, id) {
		self.objects[id].checked = checked; // save checked state for sorting
		self.hideObject(id);
		if (checked) {
			self.showObject(id);
		}
	};
	
	this.toggleFolder = function(id, lExpand) {
		self.objects[id].opened = lExpand;
		$('#folder_' + id + ' .icon-folder').removeClass('open');
		if (lExpand) {
			$('#folder_' + id + ' .folderObjects').show();
			$('#folder_' + id + ' .icon-folder').addClass('open');
		} else {
			$('#folder_' + id + ' .folderObjects').hide();
		}
	};
	
	this.onToggleFolder = function(id) {
		self.toggleFolder(id, !self.objects[id].opened);
	};
	
	this.onToggleAll = function() {
		var lExpand = $('.panel .fa-minus-square-o:hidden').length;
		$('.panel .fa-plus-square-o').toggle();
		$('.panel .fa-minus-square-o').toggle();
		
		for(var id in self.objects) {
			if (self.objects[id].isFolder) {
				self.toggleFolder(id, lExpand);
			}
		}
	};
	
	this.onToggleView = function() {
		$('.panel .fa-list-alt').toggle();
		$('.panel .fa-list').toggle();
		self.show();
	};
	
	this.render = function() {
		$('.info', $self).html('');
		var html = '', aGroups = [], aGroupObjects = {}, toOpen = [];
		var lGroupView = $('.panel .fa-list-alt:hidden').length;
		
		if (lGroupView) {
			for(var i in self.objects) {
				if (self.objects[i].isFolder) {
					aGroups.push(i);
					aGroupObjects[i] = '';
				}
				if (typeof(self.objects[i].opened) == 'undefined') {
					self.objects[i].opened = false;
					// toOpen.push(self.objects[i].isFolder);
				} else if (self.objects[i].opened) {
					self.objects[i].opened = false;
					toOpen.push(i);
				}
			}
			
			for(var i in self.objects) {
				if (!self.objects[i].isFolder && in_array(self.objects[i].parent, aGroups)) {
					aGroupObjects[self.objects[i].parent]+= Tmpl('panel-map-object-item').render(self.objects[i]);
				}
			}
			
			for(var i in self.objects) {
				if (self.objects[i].isFolder) {
					html+= Tmpl('panel-map-object-folder').render({id: i, title: self.objects[i].title, objects: aGroupObjects[i]});
				} else if (!self.objects[i].isFolder && !in_array(self.objects[i].parent, aGroups)) {
					html+= Tmpl('panel-map-object-item').render(self.objects[i]);
				}
			}
		} else {
			for(var i in self.objects) {
				if (!self.objects[i].isFolder) {
					html+= Tmpl('panel-map-object-item').render(self.objects[i]);
				}
			}
		}
		
		if (!html) {
			html = '<div style="text-align: center; margin: 10px 0"> - ' + locale.noObjects + ' -</div>';
		}
		$('.info', $self).html(html);
		for(var i = 0; i < toOpen.length; i++) {
			self.onToggleFolder(toOpen[i]);
		}
		$('input[type=checkbox]', $self).styler();
		
		self.fixPanelHeight();
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
		freeH-= 20 + 8; // padding for mainContainer
		return freeH;
	};
	
	this.fixPanelHeight = function() {
		var freeH = self.getFreeHeight(['.header', '.tmpl-panel-map-object-list .search', '.tmpl-panel-map-object-list .panel']) - 2;
		var panel = $('.tmpl-panel-map-object-list .info').get(0);
		$(panel).css('height', 'auto');
		
		var panelH = self.getHeight(panel); 
		$(panel).css('height', freeH + 'px');
		niceScroller(panel);
		
		freeH = self.getFreeHeight(['.header']);
		$('#map-canvas').css('height', freeH + 16 + 'px');
	};
	
	this.show = function() {
		self.render();
		self.showMap();
	};
	
	this.showMap = function() {
		if (!$.isEmptyObject(self.objects)) {
			// show all checked markers
			for(var id in self.objects) {
				if (self.objects[id].checked) {
					self.showObject(id);
				}
			}
			
			// show map for 1st marker (hidden or checked)
			// var id = Object.keys(self.objects)[0];
			var _id = null;
			for(var id in self.objects) {
				if (self.objects[id].checked) {
					_id = id;
					break;
				}
			}
			if (!_id) {
				for(var id in self.objects) {
					if (self.objects[id].checkable) {
						_id = id;
						break;
					}
				}
			}
			if (_id) {
				map.showAt(self.getObjectLatLng(_id));
			}
		}
	};
	
	this.getObjectLatLng = function(id) {
		return {lat: self.objects[id].lat, lon: self.objects[id].lon};
	};
	
	this.getCheckedIds = function() {
		var ids = [];
		for(var id in self.objects) {
			if (self.objects[id].checked) {
				ids.push(id);
			}
		}
		return ids;
	};
	
	this.showObject = function(id) {
		map.showMarker(id);
	};
	
	this.hideObject = function(id) {
		map.hideMarker(id);
	};
	
	this.clearObjects = function() {
		map.clearMarkers();
		self.objects = {};
	};
	
	this.saveObject = function() {
		self.dialog.close();
		var params = $('#addObjectForm').serialize();
		sendApiRequest('post.monitoringObjects', params, function(){
			self.dialog = new PopupInfo({
				title: locale.addObject, 
				text: locale.objectCreated
			});
			self.dialog.open();
		});
	};
	
	this.isFormValid = function() {
		return $('#addObjectForm [name="name"]').val() && $('#addObjectForm [name="imei"]').val();
	};
	
	this.updateFormState = function() {
		$('#addObjectForm .btn').get(0).disabled = !self.isFormValid();
	};
};