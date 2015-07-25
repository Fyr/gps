var MailingsPanel = function() {
	var self = this;
	
	self.dialog = null;
	self.settings = {};
	self.items = [];
	
	this.init = function() {
		self.fixPanelHeight();
		sendApiRequest('getMailingSettings', null, function(response){
			self.settings = response.data;
			self.update();
		});
	}
	
	this.createMailing = function() {
		self.dialog = new Popup({
			title: locale.createMailing,
			content: Tmpl('popup-mailing-edit').render(self)
		});
		self.dialog.open();
		$('select').styler();
	}
	
	this.isFormValid = function() {
		return $('#mailingForm input[name=name]').val() && $('#mailingForm input[name=email]').val();
	}
	
	this.updateForm = function() {
		$('#mailingForm .btn').get(0).disabled = !self.isFormValid();
	}
	
	this.getHeight = function(e) {
		return $(e).height() 
			+ parseInt($(e).css('margin-top').replace(/px/, ''))
			+ parseInt($(e).css('margin-bottom').replace(/px/, ''))
			+ parseInt($(e).css('padding-top').replace(/px/, ''))
			+ parseInt($(e).css('padding-bottom').replace(/px/, ''));
	}
	
	this.getFreeHeight = function(aElements) {
		var freeH = $(window).height();
		for(var i = 0; i < aElements.length; i++) {
			freeH-= self.getHeight(aElements[i]);
		}
		return freeH;
	}
	
	this.fixPanelHeight = function() {
		var freeH = self.getFreeHeight(['.header', '.tableHeader']) - 24;
		$('#map-canvas').css('height', freeH + 'px');
		$('.tmpl-panel-mailings-list').css('height', freeH);
	}
	
	this.saveMailing = function() {
		self.dialog.close();
		sendApiRequest('mailing', $('#mailingForm').serialize(), function(){
			var dialog = new PopupInfo({
				title: locale.createMailing,
				text: locale.mailingSaved,
				afterClose: function(){
					alert('Closed');
				}
			});
			dialog.open();
		});
	}
	
	this.update = function() {
		sendApiRequest('getMailings', null, function(response){
			console.log(response);
			self.items = response.data;
			self.show();
		});
	}
	
	this.show = function() {
		$('.tmpl-panel-mailings-list').html(Tmpl('panel-mailings-list').render(self));
	}
}