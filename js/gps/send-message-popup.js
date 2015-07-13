var SendMessagePopup = function(params) {
	var self = this;
	
	self.params = params;
	
	this.init = function() {
		self.popup = new Popup(self.params);
	}
	
	this.open = function() {
		self.popup.open();
	}
	
	this.validate = function() {
		var $email = $('input[name=email]', self.container);
		var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if (!re.test($email.val())) {
			$email.addClass('error');
		}
	}
	
	self.init();
}