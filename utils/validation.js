_isAscii = value => value && /^[\x00-\x7F]*$/.test(value);

//Validate hours
_isRAValid = (value) => {
    if (!value) return false;
    const parts = value.split(' ');
    const blH = /^([01]?[0-9]|2[0-3])[h]$/.test(parts[0]);
    const blM = /^([0-5]?[0-9])[m]$/.test(parts[1]);
    const blS = /^([0-5]?[0-9])([.][0-9]+)?[s]$/.test(parts[2]);
    
    return blH && blM && blS;
}

//Validate Coordinates
_isDECValid = (value) => {
    if (!value) return false;
    const parts = value.split(' ');
    let blH = /^[+-]?([0-8]?[0-9]|90)[°]$/.test(parts[0]);
    const blM = /^([0-5]?[0-9])[']$/.test(parts[1]);
    const blS = /^([0-5]?[0-9])([.][0-9]+)?"?$/.test(parts[2]);

    if (parts[0].replace('-', '') == '90°'
        && (parseInt(parts[1].replace('\'', '')) != 0
            || parseFloat(parts[2].replace('"', '')) != 0.0)
    ) {
        blH = false;
    }
 
    return blH && blM && blS;
}

_isStarValid = (star, errors) => {
    if (!_isRAValid(star.ra)) errors.push('Star\'s right ascension not valid (Example: 16h 29m 1.0s)');
    if (!_isDECValid(star.dec)) errors.push('Star\'s declination not valid (Example: -26 29\' 24.9)');
    if (!_isAscii(star.story)) errors.push('Star\'s story not informed or not in ASCII format');
    if (star.story && star.story.length > 500) errors.push('Star\'s story must have a maximum of 500 bytes');
}

isBlockBodyValid = (body, errors) => {
    if (!body) errors.push('The body\'s block can\'t be empty');
    if (!body.address) errors.push('Wallet address not informed');
    if (!body.star) errors.push('Star not informed');
    _isStarValid(body.star, errors);
    
    return errors.length == 0;
}

module.exports = {
    isBlockBodyValid
}