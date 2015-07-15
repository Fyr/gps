function sendApiRequest(method, data, successFn) {
	// var baseUrl = 'http://1c.softmax.by/sstm/hs/monitoringObjects/';
	var baseUrl = './server/', methodType = 'GET';
	if (method.indexOf('post.') > -1) {
		methodType = 'POST';
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
	/*
	$.get(baseUrl + method, aParams, function(response){ 
		if (typeof(response) == 'string') {
			response = JSON.parse(response);
		}
		if (!checkJson(response)) {
			return false;
		}
		successFn(response); 
	});
	*/
}

function getStatusColor(i) {
	if (i < 12) {
		return int2hex(parseInt(0xFF / 12 * i), 2) + 'FF00';
	}
	return 'FF' + int2hex(parseInt(0xFF / 12 * (24 - i)), 2) + '00';
	// return int2hex(0x00FF00 + (0xFF0000 - 0x00FF00) / 24 * i, 6);
}

function int2hex(n, length) {
	var s = '' + n.toString(16);
	while (s.length < length) s = '0' + s;
	return s.toUpperCase();
}

function toggleMarker(lShow, id) {
	markers[id].setMap((lShow) ? map : null);
}

function setCurrMenu(n, m) {
	$('ul.menu > li:eq(' + (n-1) + ')').addClass('active');
	if (m) {
		$('ul.subMenu > li:eq(' + (m-1) + ')', $('ul.menu > li:eq(' + (n-1) + ')')).addClass('active');
	}
}