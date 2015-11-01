function checkSystemJson(response) {
    if (response) {
        if (response.code) {
            showSystemError(response.code, (response.name) ? response.name : 'Unknown API-server error');
            return false;
        }
    }
    return true;
}

function checkJson(response) {
    if (checkSystemJson(response)) {
        if (response && response.status) {
            if (response.status == 'OK') {
                return true;
            } else {
            	var errMsg = (response.message) ? response.message : 'Incorrect API-server response';
                showJsonError(errMsg);
            }
        } else {
            showJsonError('Incorrect API-server response');
        }
    }
    return false;
}

function showSystemError(code, msg) {
    alert('System error!\nCode: ' + response.code + '\nError: ' + msg);
}

function showJsonError(msg) {
    alert('Error!\n' + msg);
}