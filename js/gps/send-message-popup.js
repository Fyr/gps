var SendMessagePopup = function(params) {
	var self = this;
	
	self.params = params;
	
	this.init = function() {
		var params = {
			title: self.params.title,
			content: tmpl(self.params.tpl, {msgType: self.params.msgType})
		};
		self.popup = new Popup(params);
		$('.popup-actions .btn').click(function(e){
			e.stopPropagation();
			if (self.isValid()) {
				self.submit();
			}
		});
		
		$('.popup .line [name]').focus(function(){
			$(this).removeClass('error');
			$(this).parent().find('span.note.error').remove();
		});
	};
	
	this.submit = function() {
		var data = $('.popup form').serialize();
		sendApiRequest('post.setRecourse', data, function(response) {
			self.close();
			
			if (checkJson(response)) {
				var dialog = new Popup({
					title: self.params.title, 
					content: tmpl('tmpl-popup-message-thanks', {})
				});
				dialog.open();
			}
		});
	};
	
	this.open = function() {
		self.popup.open();
	};
	
	this.close = function() {
		self.popup.close();
	};
	
	this.isValid = function() {
		self.container = $('.popup').get(0);
		
		var $email = $('input[name=email]', self.container);
		var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		var $errNote = $('<span class="note error"/>');
		if (!re.test($email.val())) {
			$email.addClass('error');
			$email.parent().append('<span class="note error">Некорректный email-адрес</span>');
		}
		
		$subject = $('input[name=subject]', self.container);
		if (!$subject.val()) {
			$subject.addClass('error');
			$subject.parent().append('<span class="note error">Поле должно быть заполнено</span>');
		}
		
		$message = $('textarea[name=message]', self.container);
		if (!$message.val()) {
			$message.addClass('error');
			$message.parent().append('<span class="note error">Поле должно быть заполнено</span>');
		}
		return !$('.error', self.container).length;
	};
	
	self.init();
};