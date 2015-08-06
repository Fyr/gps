function sendApiRequest(method, data, successFn) {
	// var prodUrl = 'http://1c.softmax.by/sstm/hs/monitoringObjects/';
	// var baseUrl = (window.location.href.indexOf('1c.softmax.by') > -1) ? prodUrl : './server/';
	var baseUrl = './server/';
	
	var methodType = 'GET';
	if (method.indexOf('.') > -1) {
		methodType = method.split('.')[0];
		method = method.split('.')[1];
	}
	$.ajax({
		url: baseUrl + method,
		data: data,
		dataType: 'json',
		method: methodType,
		success: function(response) {
			if (typeof(response) == 'string') {
				response = JSON.parse(response);
			}
			if (!checkJson(response)) {
				return false;
			}
			successFn(response); 
		}
	});
	
}

function getStatusColor(i) {
	if (i < 12) {
		return int2hex(parseInt(0xFF / 12 * i), 2) + 'FF00';
	}
	return 'FF' + int2hex(parseInt(0xFF / 12 * (24 - i)), 2) + '00';
}

function int2hex(n, length) {
	var s = '' + n.toString(16);
	while (s.length < length) s = '0' + s;
	return s.toUpperCase();
}

function setCurrMenu(n, m) {
	sendApiRequest('getReports', null, function(response){
		MainMenu[3].submenu = [];
		for(var i = 0; i < response.data.length; i++) {
			var item = response.data[i];
			if (item.items) {
				var items = [];
				for(var j = 0; j < item.items.length; j++) {
					var item3 = item.items[j];
					items.push({href: 'reports.html?report=' + item3.guid, title: item3.name});
				}
				MainMenu[3].submenu.push({href: 'javascript:void(0)', title: item.name, submenu: items});
			} else {
				MainMenu[3].submenu.push({href: 'reports.html?report=' + item.guid, title: item.name});
			}
		}
		$('.tmpl-menu').html(Tmpl('menu').render());
		$('ul.menu > li:eq(' + (n-1) + ')').addClass('active');
		if (m) {
			$('ul.subMenu > li:eq(' + (m-1) + ')', $('ul.menu > li:eq(' + (n-1) + ')')).addClass('active');
		}
		
		$('.menu').slicknav({
			label: 'меню',
			prependTo: '.header'
		});
	});
}

function extend(self, fnObj) {
	fnObj.call(self);
	
	self.parent = {};
	for(var prop in self) {
		if (typeof(self[prop]) == 'function') {
			self.parent[prop] = self[prop];
		}
	}
}

function json_encode(param, lEscapeQuotes) {
	var _ret = JSON.stringify(param);
	return (lEscapeQuotes) ? _ret.replace(/\"/g, "'"): _ret;
}

function json_decode(json, lEscapeQuotes) {
	return JSON.parse((lEscapeQuotes) ? json.replace(/\'/g, '"') : json);
}

function in_array(needle, haystack) {
	return $.inArray(needle, haystack) > -1;
}

function niceScroller(e) {
	$(e).niceScroll({autohidemode:false, cursorcolor: "#ecdc00", background: "#dddddd", cursorborderradius: "0", cursorwidth: "7px"});
}