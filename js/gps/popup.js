var Popup = function(params) {
	var self = this;
	
	self.params = $.extend({title: '', content: ''}, params);
	
	this.init = function() {
		$('body').append(Tmpl('popup').render(self.params));
		$('.popup').css('left', parseInt($(window).width() / 2 - $('.popup').width() / 2) + 'px');
		$('.popup').css('top', parseInt($(window).height() / 2 - $('.popup').height() / 2) + 'px');
		$('.popup .close-popup').click(function() {
			self.close();
		});
	}
	
	this.open = function() {
		$('#shadow').show();
		$('.popup').show();
		
		$('input[type=checkbox]').styler();
		$('select').styler();
		$('.rome-datetime').each(function(){
			rome(this);
		});
		niceScroller('.niceScroller');
	}
	
	this.close = function() {
		$('#shadow').hide();
		$('.popup').remove();
	}
	
	this.init();
}