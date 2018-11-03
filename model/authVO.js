
class AuthVO {
    constructor(address, window) {
        this.address = address,
            this.requestTimeStamp = new Date().getTime().toString().slice(0, -3),
            this.message = `${this.address}:${this.requestTimeStamp}:starRegistry`,
            this.validationWindow = window
    }
}

class AuthValidateVO {
    constructor(authWin, valid) {
        this.registerStar = valid,
            this.status = authWin,
            this.status.messageSignature = valid ? 'valid' : 'invalid';
    }
}

module.exports = {
    AuthVO
    , AuthValidateVO
};