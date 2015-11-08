var SendMessagePopup = function(params) {
	var self = this;
	
	self.params = params;
	
	this.init = function() {
		var params = {
			title: self.params.title,
			content: tmpl(self.params.tpl, {msgType: self.params.msgType})
		};
		self.dialog = new Popup(params);
		$('.popup-actions .btn').click(function(e){
			e.stopPropagation();
			if (self.isValid()) {
				self.submit();
			}
		});
		
		$('.popup .line [name]').focus(function(){
			self.dialog.hideFieldError($(this));
		});
	};
	
	this.submit = function() {
		var data = $('.popup form').serialize();
		sendApiRequest('post.setRecourse', data, function(response) {
			self.close();
			
			if (checkJson(response)) {
				var dialog = new PopupInfo({
					title: self.params.title, 
					text: locale.messageSent
				});
				dialog.open();
			}
		});
	};
	
	this.open = function() {
		self.dialog.open();
	};
	
	this.close = function() {
		self.dialog.close();
	};
	
	this.isValid = function() {
		self.container = $('.popup').get(0);
		
		var $email = $('input[name=email]', self.container);
		if (!isEmailValid($email.val())) {
			self.dialog.showFieldError($email, locale.errEmail);
		}
		
		$subject = $('input[name=subject]', self.container);
		if (!$subject.val()) {
			self.dialog.showFieldError($email, locale.errBlankField);
		}
		
		$message = $('textarea[name=message]', self.container);
		if (!$message.val()) {
			self.dialog.showFieldError($message, locale.errBlankField);
		}
		return !$('.error', self.container).length;
	};
	
	self.init();
};