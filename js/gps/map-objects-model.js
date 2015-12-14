var MapObjectsModel = function() {
	var self = this;
	
	this.setObjectSettings = function(nextFn) {
		sendApiRequest('getDataForSelect', null, function(response){
			self.settings = {users: [], iconsAll: {}, iconsPoi: {}, iconsObjects: {}, protocols: {}, models: {}};
			for(var i = 0; i < response.data.users.length; i++) {
				var row = response.data.users[i];
				self.settings.users.push({name: row.name, guid: row.guid}) ;
			}
			for(var i = 0; i < response.data.monitoringObjectIcons.length; i++) {
				var row = response.data.monitoringObjectIcons[i];
				self.settings.iconsObjects[row.guid] = row.name;
				self.settings.iconsAll[row.guid] = row.name;
			}
			for(var i = 0; i < response.data.poiIcons.length; i++) {
				var row = response.data.poiIcons[i];
				self.settings.iconsPoi[row.guid] = row.name;
				self.settings.iconsAll[row.guid] = row.name;
			}
			for(var i = 0; i < response.data.protocols.length; i++) {
				var row = response.data.protocols[i];
				self.settings.protocols[row.guid] = row.name;
			}
			for(var i = 0; i < response.data.models.length; i++) {
				var row = response.data.models[i];
				self.settings.models[row.guid] = row.name;
			}

			if (nextFn) {
				nextFn();
			}
		});
	};
	
	this._updatedAgo = function(date) {
		var now = new Date();
		return Math.floor((now.getTime() - date.getTime()) / Date.HOUR);
	};
	
	this.setObjectData = function(id, data) {
		self.objects[id] = data;
		self.objects[id].id = id;
		self.objects[id].checked = (data.checked) ? data.checked : false;
		self.objects[id].title = data.name;
		
		data.checkable = true && data.topicality && data.lat && data.lon;
		
		if (data.topicality) {
			var date = Date.fromSqlDate(data.topicality.replace(/T/, ' '));
			self.objects[id].updated_ago = self._updatedAgo(date);
			self.objects[id].updated_date = date.fullDate('rus') + ' ' + date.hoursMinutes('rus');
		} else {
			self.objects[id].updated_ago = -1;
			self.objects[id].updated_date = '-';
		}
	};
	
	this.edit = function(id) {
		self.id = id;
		var editFn = function() {
			self.dialog = new Popup({
				title: (id) ? locale.editObject : locale.addObject,
				content: Tmpl('popup-edit-object').render(self)
			});
			self.dialog.open();
			
			$('#editForm input[type=text]').focus(function(){
				self.dialog.hideFieldError($(this));
			});
		};
		if ($.isEmptyObject(self.settings)) {
			self.setObjectSettings(editFn);
		} else {
			editFn();
		}
	};
	
	this.save = function(id) {
		if (self.isFormValid()) {
			var data = $('#editForm').serializeObject();
			data.isFolder = false;
			data = json_encode(data);
			self.dialog.close();
			sendApiRequest((id) ? 'put.monitoringObjects?guid=' + id : 'post.monitoringObjects', data, function(){
				self.dialog = new PopupInfo({
					title: id ? locale.recordEdit : locale.addObject,
					text: id ? locale.recordSaved : locale.objectCreated,
				});
				self.dialog.open();
			});
		}
	};
	
	this.isFormValid = function() {
		var $name = $('#editForm input[name="name"]');
		if (!$name.val()) {
			self.dialog.showFieldError($name, locale.errBlankField);
		}
		
		var $imei = $('#editForm input[name="imei"]');
		if (!$imei.val()) {
			self.dialog.showFieldError($imei, locale.errBlankField);
		}
		return !$('#editForm .error').length;
	};
	
};