/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

getData = (key) => {
  return db.get(key)
    .catch(err => {
      if (err.name == 'NotFoundError')
        return undefined;

      throw err;
    });
}

getDataJSON = async key => {
  return getData(key)
    .then(result => {
      if (result)
        return JSON.parse(result);

      return undefined;
    })
}

delData = async key => {
  return db.del(key);
}

addData = async (key, value) => {
  return db.put(key, JSON.stringify(value));
}

addDataInBatch = async data => {
  return db.batch(data);
}

genKeyValuePair = (key, value) => {
  let pair = {};

  pair.type = 'put';
  pair.key = key;
  pair.value = value;

  return pair;
}

module.exports = {
  getData
  , getDataJSON
  , addData
  , addDataInBatch
  , delData
  , genKeyValuePair
}