var SendMessage = function() {
	var self = this;
	
	this.init = function(container, msgType) {
		self.container = container;
		self.msgType = msgType
	}
	
	this.validate = function() {
		var $email = $('input[name=email]', self.container);
		var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if (!re.test($email.val())) {
			$email.addClass('error');
		}
	}
}