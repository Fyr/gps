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
                showJsonError((response.status == 'ERROR' && response.errMsg) ? response.errMsg : 'Incorrect API-server response');
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