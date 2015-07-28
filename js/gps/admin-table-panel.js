var AdminTablePanel = function() {
	var self = this;
	
	self.dialog = null;
	self.items = {};
	
	this.init = function() {
		self.fixPanelHeight();
		self.tplList = 'panel-admintable-list';
		self.tplEdit = 'popup-admintable-edit';
	}
	
	this.edit = function(id) {
		self.id = id;
		self.dialog = new Popup({
			title: (id) ? locale.recordEdit : locale.recordCreate,
			content: Tmpl(self.tplEdit).render(self)
		});
		self.dialog.open();
		
		$('input[type=checkbox]').styler();
		$('select').styler();
		$('.rome-datetime').each(function(){
			rome(this);
		});
		niceScroller('.niceScroller');
		self.updateFormState();
	}
	
	this.isFormValid = function() {
		return true;
	}
	
	this.updateFormState = function() {
		$('#editForm .btn').get(0).disabled = !self.isFormValid();
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
	}
	
	this.save = function() {
		self.dialog.close();
		self.afterSave();
	}
	
	this.afterSave = function(lUpdated) {
		var dialog = new PopupInfo({
			title: lUpdated ? locale.recordEdit : locale.recordCreate,
			text: locale.recordSaved,
			afterClose: function(){
				self.refresh();
			}
		});
		dialog.open();
	}
	
	this.refresh = function() {
		self.items = {};
	}
	
	this.show = function() {
		$('.tmpl-' + self.tplList).html(Tmpl(self.tplList).render(self));
	}
}