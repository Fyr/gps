var ReportObjectsPanel = function() {
	var self = this, $self = $('.tmpl-panel-map-object-list');
	
	extend(this, MapObjectsPanel);
	
	self.reportId = null;
	
	this.init = function(reportId) {
		self.reportId = reportId;
		self.parent.init();
		sendApiRequest('getReportSettings', {guid: reportId}, function(response){
			self.renderReportForm(response.data);
		});
	}
	
	this.renderReportForm = function(data) {
		$('#reportForm').append(Tmpl('report-form').render(data));
		$('.rome-datetime').each(function(){
			rome(this);
		});
		$('.styler-select').styler();
	}
	
	this.submitReportForm = function() {
		$('#map-canvas').hide();
		$('#report-canvas').show();
		var params = {};
		$('#reportForm input, #reportForm select').each(function(){
			params[this.name] = this.value;
		});
		sendApiRequest('getReport', {guid: self.reportId, format: 'json', params: JSON.stringify(params)}, function(response){
			console.log(response.data);
			grida = webix.ui({
                container: "testA",
                view: "treetable",
                columns: [
                    // { id:"id",	header:"", css:{"text-align":"right"},  	width:50},
                    {
                        id: "monitoringObject", header: "monitoringObject", 
                        template: "{common.treetable()} #monitoringObject#"
                    },
                    {id: "day", header: "day", width: 200},
                    {id: "period", header: "period", width: 200},
                    {id: "status", header: "status", width: 200},
                    //{ id:"geofence",	header:"geofence",	width:200},
                    {id: "duration", header: "duration", width: 200},
                    {id: "milageGPS", header: "milageGPS", width: 200}

                ],
                autoheight: true,
                autowidth: true,

                data: response.data.data

            });
		});
	}
}