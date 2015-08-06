var MailingsPanel = function() {
	var self = this;
	
	extend(this, AdminTablePanel);
	
	this.init = function() {
		self.parent.init();
		self.tplList = 'panel-mailings-list';
		self.tplEdit = 'popup-mailings-edit';
		sendApiRequest('getMailingsSettings', null, function(response){
			self.settings = response.data;
		});
		self.refresh();
	};
	
	this.isFormValid = function() {
		return true;
	};
	
	this.fixPanelHeight = function() {
		var panel = $('.tmpl-panel-mailings-list').get(0);
		
		// var freeH = self.getFreeHeight(['.header']);
		// $('.maket').css('height', freeH + 'px');
		
		var freeH = self.getFreeHeight(['.header', '#mailings .tableHeader', '#notifications .tableHeader']) - 10;
		$(panel).css('height', (Math.floor(freeH / 2) - 5) + 'px');
		niceScroller(panel);
	};
	
	this.save = function(id) {
		self.dialog.close();
		sendApiRequest(id ? 'post.mailings?guid=' + id : 'post.mailings', $('#editForm').serialize(), function(){
			self.afterSave(id);
		});
	};
	
	this.refresh = function() {
		sendApiRequest('mailings', null, function(response){
			for(var i = 0; i < response.data.length; i++) {
				var data = response.data[i];
				self.items[data.guid] = data;
			}
			self.show();
		});
	};
	
	this.remove = function(id) {
		sendApiRequest('mailings?remove=' + id, null, function(response){
			self.refresh();
		});
	};
};
