var PopupInfo = function(params) {
	var self = this;
	
	extend(this, Popup);
	
	self.params = $.extend({title: '', text: '', afterClose: null }, params);
	
	this.init = function() {
		self.params.content = Tmpl('popup-info').render({text: self.params.text});
		self.parent.init(self.params);
	}
	
	this.close = function() {
		self.parent.close();
		if (self.params.afterClose) {
			self.params.afterClose();
		}
	}
	
	this.init();
}