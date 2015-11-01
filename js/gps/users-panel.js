var UsersPanel = function() {
	var self = this;
	
	extend(this, AdminTablePanel);
	
	this.init = function() {
		self.parent.init();
		self.tplList = 'panel-users-list';
		self.tplEdit = 'popup-users-edit';
		sendApiRequest('getUsersSettings', null, function(response){
			self.settings = response.data;
		});
		self.refresh();
	};
	
	this.isFormValid = function() {
		var $email = $('#editForm [name="email"]');
		if (!isEmailValid($email.val())) {
			self.dialog.showFieldError($email, locale.errEmail);
		}
		return !$('#editForm .error').length; 
	};
	
	this.fixPanelHeight = function() {
		var panel = $('.tmpl-panel-users-list').get(0);
		
		var freeH = self.getFreeHeight(['.header', '.tableHeader']) - 12;
		$(panel).css('height', freeH + 'px');
		niceScroller(panel);
	};
	
	this.save = function(id) {
		if (self.isFormValid()) {
			self.dialog.close();
			sendApiRequest(id ? 'post.users?guid=' + id : 'post.users', $('#editForm').serialize(), function(){
				self.afterSave(id);
			});
		}
	};
	
	this.refresh = function() {
		sendApiRequest('users', null, function(response){
			for(var i = 0; i < response.data.length; i++) {
				var data = response.data[i];
				self.items[data.guid] = data;
			}
			self.show();
		});
	};
	
	this.remove = function(id) {
		sendApiRequest('users?remove=' + id, null, function(response){
			self.refresh();
		});
	};
};
