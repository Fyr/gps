var Popup = function() {
	var self = this;
	
	this.open = function(id) {
		$('#shadow').fadeIn(400);
		$('#' + id).fadeIn(400);
	}
	
	this.close = function(id) {
		$('#shadow').fadeOut(400);
		$('#' + id).fadeOut(400);
	}
}