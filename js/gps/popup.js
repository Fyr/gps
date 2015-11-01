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
	};
	
	this.open = function() {
		$('#shadow').show();
		$('.popup').show();
		
		$('input[type=checkbox]').styler();
		$('select:not(.noStyler)').styler();
		$('.rome-datetime').each(function(){
			rome(this);
		});
		niceScroller('.niceScroller');
		
		if ($('.miniColors').length) {
			$('.miniColors').minicolors({
		    	animationSpeed: 50,
		    	animationEasing: 'swing',
				change: null,
				changeDelay: 0,
				// control: 'hue',
				defaultValue: '',
				hide: null,
				hideSpeed: 100,
				inline: false,
				letterCase: 'lowercase',
				opacity: false,
				position: 'bottom left',
				show: null,
				showSpeed: 100,
				// theme: 'bootstrap'
			});
		}
		if ($('.iconsSelect').length) {
			$('.iconsSelect').ImageSelect({ 
				height: 16,
				width: 75,
				dropdownWidth: 400,
				borderColor:'#fff200'
			});
		}
	};
	
	this.close = function() {
		$('#shadow').hide();
		$('.popup').remove();
	};
	
	this.showFieldError = function($e, errMsg) {
		self.hideFieldError($e);
		
		$e.addClass('error');
		$e.parent().append('<span class="note error">' + errMsg + '</span>');
	};
	
	this.hideFieldError = function($e) {
		$e.removeClass('error');
		$e.parent().find('span.note.error').remove();
	};
	
	this.init();
}