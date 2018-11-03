//const bitcoin = require('bitcoinjs-lib');
const db = require('../levelSandbox');
const bitcoinMessage = require('bitcoinjs-message');
const key = require('./keyGenerator');
const { AuthVO, AuthValidateVO } = require('../model/authVO');
const _auth = 'valid';
const _validationWindow = 300; //in seconds

getAuthorization = async (address, doNotCreate) => {
    let authWin = await _getAuthorization(address);
    let mustCreate = !doNotCreate;

    if (mustCreate && !_isWindowOpen(authWin)) {
        authWin = await _generateWindow(address);
    }

    return authWin;
}


verifyAuthorization = async (address, signature) => {
    let auth = await getAuthorization(address, true);

    if (!auth) throw new Error('No authorization request was made');
    if (!_isWindowOpen(auth)) throw new Error('Validation Window Expired');
    if (auth.registerStar) return auth;

    let valid = await bitcoinMessage.verify(auth.message, address, signature);

    let validation = new AuthValidateVO(auth, valid);

    if (validation.registerStar)
        _saveAuthorization(address, validation);

    return validation;
}

isAddressAuthorized = async address => {
    const authWindow = await _getAuthorization(address);
    return (authWindow && authWindow.registerStar) || false;
}

removeAuthorization = async (address) => {
    return _delAuthorization(address);
}

_generateWindow = address => {
    let authWin = new AuthVO(address, _validationWindow);

    _setTimeoutValidation(address);
    _saveAuthorization(address, authWin);

    return authWin;
}

_isWindowOpen = (authWin) => {
    if (!authWin) return false;
    if (authWin.registerStar) authWin = authWin.status;

    let actualTimeStamp = parseInt(new Date().getTime().toString().slice(0, -3));
    let diff = actualTimeStamp - parseInt(authWin.requestTimeStamp);

    //Update the seconds in validation window
    authWin.validationWindow = _validationWindow - diff;

    //Negative values, indicate expiration, than obrigate user to create new one
    const isWindowOpen = (authWin.validationWindow > 0);

    if (!isWindowOpen) {
        _delAuthorization(authWin.address);
    }

    return (isWindowOpen);
}

_getAuthorization = async address => {
    let authKey = key.genKey(_auth, address);
    let auth = await db.getDataJSON(authKey);

    if (_isWindowOpen(auth))
        return auth;
    else
        return undefined;
}

_saveAuthorization = (address, auth) => {
    let authKey = key.genKey(_auth, address);
    return db.addData(authKey, auth);
}

_delAuthorization = address => {
    let authKey = key.genKey(_auth, address);
    return db.delData(authKey);
}

_setTimeoutValidation = address => {
    setTimeout(() => {
        console.log('matou');
        _delAuthorization(address);
    }, _validationWindow * 1000);
}

module.exports = {
    getAuthorization
    , verifyAuthorization
    , removeAuthorization
    , isAddressAuthorized
};