var Popup = function(params) {
	var self = this;
	
	self.params = $.extend({}, params);
	
	this.init = function() {
		console.log(self.params.tpl);
		$('body').append(tmpl('tmpl-popup', {
			title: self.params.title, 
			content: tmpl(self.params.tpl, {})
		}));
		$('.popup .close-popup').click(function() {
			self.close();
		});
	}
	
	this.open = function() {
		$('#shadow').fadeIn(400);
		$('.popup').fadeIn(400);
	}
	
	this.close = function() {
		$('#shadow').fadeOut(400);
		$('.popup').fadeOut(400);
	}
	
	self.init();
}