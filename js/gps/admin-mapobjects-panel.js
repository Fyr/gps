var AdminMapObjectsPanel = function() {
	var self = this;
	
	extend(this, AdminTablePanel);
	extend(this, MapObjectsModel);
	
	this.init = function() {
		self.parent.init();
		self.tplList = 'panel-mapobjects-list';
		self.tplEdit = 'popup-edit-object';
		self.settings = {};
		self.objects = {};
		
		self.setObjectSettings(function(){
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
		var panel = $('.tmpl-panel-mapobjects-list').get(0);
		
		var freeH = self.getFreeHeight(['.header', '.tableHeader']) - 12;
		$(panel).css('height', freeH + 'px');
		niceScroller(panel);
	};
	
	this.save = function(id) {
		if (self.isFormValid()) {
			self.dialog.close();
			sendApiRequest(id ? 'post.monitoringObjects?guid=' + id : 'post.monitoringObjects', $('#editForm').serialize(), function(){
				self.afterSave(id);
			});
		}
	};
	
	this.refresh = function() {
		sendApiRequest('getTopicalityData', null, function(response){
			for(var i = 0; i < response.data.length; i++) {
				var data = response.data[i];
				var id = data.guid;
				if (!data.isFolder) {
					self.setObjectData(id, data);
				}
			}
			self.show();
		});
	};
	
	this.remove = function(id) {
		sendApiRequest('monitoringObjects?remove=' + id, null, function(response){
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
