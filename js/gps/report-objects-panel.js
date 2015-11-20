var ReportObjectsPanel = function() {
	var self = this, $self = $('.tmpl-panel-map-object-list');
	
	extend(this, MapObjectsPanel);
	
	self.reportId = null;
	
	this.init = function(reportId) {
		self.reportId = reportId;
		self.parent.init();
		sendApiRequest('getReportSettings', {guid: reportId}, function(response){
			self.renderReportForm(response.data);
			self.fixPanelHeight();
		});
	};
	
	this.renderReportForm = function(data) {
		$('#reportForm').append(Tmpl('report-form').render(data));
		$('.rome-datetime').each(function(){
			var date = new Date();
			if (this.name == 'EndOfPeriod') {
				date.setHours(23);
				date.setMinutes(59);
			} else {
				date.setHours(0);
				date.setMinutes(0);
			}
			rome(this, {initialValue: date});
		});
		$('.styler-select').styler();
	};
	
	this.submitReportForm = function() {
		$('#map-canvas').hide();
		var params = {};
		$('#reportForm input, #reportForm select').each(function(){
			params[this.name] = this.value;
		});
		sendApiRequest('getReport', {guid: self.reportId, format: 'json', params: JSON.stringify(params)}, function(response){
			$('#report-canvas').show();
			self.columns = response.data.columns;
			self.groups = response.data.groups || [];
			self.processData(response.data.data);
			self.renderReport();
		});
	};
	
	this.processData = function(data) {
		self.data = data;
	};
	
	this.renderReport = function() {
		$('#report-canvas').html(Tmpl('report-table').render(self));
		$('#report-canvas table').treegrid();
	};
	
	this.fixPanelHeight = function() {
		var freeH = self.getFreeHeight(['.header', '.tmpl-panel-map-object-list .search', '.tmpl-panel-map-object-list .panel', '#reportForm']) - 4;
		var panel = $('.tmpl-panel-map-object-list .info').get(0);
		// $(panel).css('height', 'auto');
		$(panel).css('height', freeH + 'px');
		niceScroller(panel);
		
		freeH = self.getFreeHeight(['.header']);
		$('#map-canvas').css('height', freeH + 16 + 'px');
		
		freeH = self.getFreeHeight(['.header']);
		$('#report-canvas').css('height', freeH + 16 + 'px');
		niceScroller('#report-canvas');
	};
};