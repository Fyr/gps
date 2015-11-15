var map;
var MapObjectsPanel = function() {
	var self = this;
	
	$self = $('.tmpl-panel-map-object-list');
	
	self.objects = {};
	self.settings = {};
	
	extend(this, MapObjectsModel);
	
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
				data.checkable = true && data.topicality && data.lat && data.lon;
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
			// data[i].checkable = (data[i].topicality) && true;
			self.setObjectData(id, data[i]);
			self.setMapObject(id, self.getIcon(data[i].icon));
		}
	};
	
	this.getIcon = function(iconID) {
		return (self.settings.iconsAll[iconID]) ? self.settings.iconsAll[iconID] : '';
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
		var objects = {};
		for(var id in self.objects) {
			if (self.objects[id].isFolder) {
				objects[id] = self.objects[id];
			} else {
				aTitles.push({
					id: id,
					title: self.objects[id].title,
					item: self.objects[id],
					toString: function() {
						return this.title;
					}
				});
			}
		}
		aTitles.sort();
		if (lDesc) {
			aTitles.reverse();
		}
		
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
			var id = this.id.replace(/check/, '');
			
			// $(this).change(); // call indirectly onchange for this checkbox
			
			self.objects[id].checked = checked; // save checked state for sorting
			if (!self.objects[id].isFolder) {
				self.hideObject(id);
				if (checked) {
					self.showObject(id);
				}
			}
		});
		setTimeout(function(){
			self.showMap();
		}, 50);
		
	};
	
	this.onCheckObject = function(checked, id) {
		self.objects[id].checked = checked; // save checked state for sorting
		if (!self.objects[id].isFolder) {
			self.hideObject(id);
			if (checked) {
				self.showObject(id);
			}
		}
		self.showMap();
	};
	
	this.onCheckFolder = function(checked, id) {
		self.objects[id].checked = checked; // save checked state for sorting
		$('#folder_' + id + ' .folderObjects .item input[type=checkbox]', $self).each(function(){
			$(this).prop('checked', checked).trigger('refresh');
			$(this).change(); // call indirectly onchange for this checkbox
		});
	};
	
	this.toggleFolder = function(id, lExpand) {
		self.objects[id].opened = lExpand;
		$('#folder_' + id + ' .folderItem .fa').toggle();
		if (lExpand) {
			$('#folder_' + id + ' .folderObjects').show();
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
					html+= Tmpl('panel-map-object-folder').render({id: i, title: self.objects[i].title, objects: aGroupObjects[i], checked: self.objects[i].checked});
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
		var points = [];
		if (!$.isEmptyObject(self.objects)) {
			// show all checked markers
			var lChecked = false;
			for(var id in self.objects) {
				if (!self.objects[id].isFolder && self.objects[id].checked) {
					if (self.objects[id].lat && self.objects[id].lon) {
						lChecked = true;
						points.push({lat: self.objects[id].lat, lon: self.objects[id].lon});
						// points.push([self.objects[id].lat, self.objects[id].lon]);
					}
				}
			}
			if (!lChecked) {
				for(var id in self.objects) {
					if (!self.objects[id].isFolder && self.objects[id].lat && self.objects[id].lon) {
						points.push({lat: self.objects[id].lat, lon: self.objects[id].lon});
						// points.push([self.objects[id].lat, self.objects[id].lon]);
					}
				}
			}
		}
		if (points.length) {
			/*
			var minLat = points[0].lat, maxLat = points[0].lat, minLon = points[0].lon, maxLon = points[0].lon;
			for(var i = 0; i < points.length; i++) {
				minLat = Math.min(minLat, points[i].lat);
				maxLat = Math.max(maxLat, points[i].lat);
				minLon = Math.min(minLon, points[i].lon);
				maxLon = Math.max(maxLon, points[i].lon);
			}
			*/
			var bounds = L.latLngBounds(points);
			// var bounds = [[minLat, minLon], [maxLat, maxLon]];
			setTimeout(function(){ map.mapL.fitBounds(bounds); }, 500);
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
	
	this.getInitialLocation = function() {
		var id = Object.keys(self.objects)[0];
		var ids = self.getCheckedIds();
		if (ids.length) {
			id = ids[0];
		}
		if (self.objects[id].lat && self.objects[id].lon) {
			return {lat: self.objects[id].lat, lon: self.objects[id].lon};
		}
		return {lat: 0, lon: 0}; // default location
	};
};