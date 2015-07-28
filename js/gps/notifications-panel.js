var NotificationsPanel = function() {
	var self = this;
	
	extend(this, AdminTablePanel);
	
	this.init = function() {
		self.parent.init();
		self.tplList = 'panel-notifications-list';
		self.tplEdit = 'popup-notifications-edit';
		sendApiRequest('getNotificationSettings', null, function(response){
			self.settings = response.data;
		});
		self.refresh();
	}
	
	this.isFormValid = function() {
		return true;
	}
	
	this.fixPanelHeight = function() {
		var freeH = self.getFreeHeight(['.header', '#mailings', '#notifications .tableHeader']) - 22;
		$('.tmpl-panel-notifications-list').css('height', freeH + 'px');
		niceScroller('.tmpl-panel-notifications-list');
	}
	
	this.save = function(id) {
		self.dialog.close();
		sendApiRequest(id ? 'post.notifications?guid=' + id : 'post.notifications', $('#editForm').serialize(), function(){
			self.afterSave(id);
		});
	}
	
	this.refresh = function() {
		sendApiRequest('notifications', null, function(response){
			for(var i = 0; i < response.data.length; i++) {
				var data = response.data[i];
				data.start = data.start.replace(/T/, ' ');
				data.end = data.end.replace(/T/, ' ');
				self.items[data.guid] = data;
			}
			self.show();
		});
	}
	
}
