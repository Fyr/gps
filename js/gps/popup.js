var Popup = function(params) {
	var self = this;
	
	self.params = $.extend({title: '', content: ''}, params);
	
	this.init = function() {
		$('body').append(Tmpl('popup').render(params));
		$('.popup .close-popup').click(function() {
			self.close();
		});
	}
	
	this.open = function() {
		/*
		$('#shadow').fadeIn(400);
		$('.popup').fadeIn(400);
		*/
		$('#shadow').show();
		$('.popup').show();
	}
	
	this.close = function() {
		/*
		$('#shadow').fadeOut(400);
		$('.popup').fadeOut(400);
		*/
		$('#shadow').hide();
		$('.popup').remove();
		// setTimeout(function(), 400);
	}
	
	this.init();
}