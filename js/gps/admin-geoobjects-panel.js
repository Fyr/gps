var AdminGeoobjectsPanel = function() {
	var self = this;
	
	extend(this, AdminTablePanel);
	extend(this, GeoObjectsModel);
	
	this.init = function() {
		self.parent.init();
		self.tplList = 'panel-geoobjects-list';
		self.tplEdit = 'popup-geoobject-edit';
		self.settings = {};
		self.objects = {};
		
		sendApiRequest('getDataForSelect', null, function(response){
			self.settings = {users: [], iconsAll: {}, iconsPoi: {}, iconsObjects: {}};
			self.settings.types = {
				"circle": "Точка",
				"polygon": "Полигон"
			};
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
			self.refresh();
		});
	};
	
	this.isFormValid = function() {
		var $email = $('#editForm [name="email"]');
		if (!isEmailValid($email.val())) {
			self.dialog.showFieldError($email, locale.errEmail);
		}
		return !$('#editForm .error').length; 
	};
	
	this.fixPanelHeight = function() {
		var panel = $('.tmpl-panel-geoobjects-list').get(0);
		
		var freeH = self.getFreeHeight(['.header', '.tableHeader']) - 12;
		$(panel).css('height', freeH + 'px');
		niceScroller(panel);
	};
	
	this.save = function(id) {
		if (self.isFormValid()) {
			self.dialog.close();
			sendApiRequest(id ? 'post.poi?guid=' + id : 'post.poi', $('#editForm').serialize(), function(){
				self.afterSave(id);
			});
		}
	};
	
	this.refresh = function() {
		sendApiRequest('poi', null, function(response){
			for(var i = 0; i < response.data.length; i++) {
				var data = response.data[i];
				if (data.type == 'Точка') {
					data.type = 'circle';
				} else if (data.type == 'Полигон') {
					data.type = 'polygon';
				}
				self.objects[data.guid] = data;
			}
			self.show();
		});
	};
	
	this.remove = function(id) {
		sendApiRequest('poi?remove=' + id, null, function(response){
			self.refresh();
		});
	};
	
	this.getInitialLocation = function(id) {
		if (self.objects[id] && self.objects[id].lat && self.objects[id].lon) {
			return {lat: self.objects[id].lat, lon: self.objects[id].lon};
		}
		return {lat: 0, lon: 0}; // default location
	};
	
	this.getIcon = function(iconID) {
		return (self.settings.iconsAll[iconID]) ? self.settings.iconsAll[iconID] : '';
	};
};
