const db = require('./levelSandbox');
const cypher = require('./utils/cypher');
const validation = require('./utils/validation');
const keyGen = require('./utils/keyGenerator');
const authWindow = require('./utils/authorizationRequest');
const { Block } = require('./model/block');
const _block = 'block';
const _height = 'height';
const _wallet = 'wallet';

_initializeChain = async () => {
  try {
    _createGenesis();
  } catch (err) {
    console.log('Failed initializing chain', err);
  };
}

_createGenesis = async () => {
  let height = await _getHeight();

  if (height == undefined) {
    console.log('Creating genesis Block!');

    let data = {
      address: "16qenXoAms4BRT2Ntj3V5maZEUVP7UaTkY",
      star: {
        dec: "-26° 29''' 24.9",
        ra: "16h 29m 1.0s",
        story: "First block in the chain - Genesis block"
      }
    };
    let b = new Block(data, true);

    _addBlock(b, true)
      .then(result => console.log(result));
  }
}

_buildBlock = async newBlock => {
  const height = await _getHeight();

  if (height === undefined) {
    newBlock.height = 0;
  } else {
    const previous = await _getBlockByHeight(height || 0);

    newBlock.height = previous.height + 1;
    newBlock.previousBlockHash = previous.hash;
  }
  
  newBlock.time = new Date().getTime().toString().slice(0, -3);
  newBlock.body.star.story = cypher.toHexEncode(newBlock.body.star.story);

  newBlock.hash = cypher.toHash(newBlock);
  return newBlock;
}

_addBlock = async (block, isGenesis) => {
  const address = block.body.address;

  if (!isGenesis) {
    await _validateBlockBody(block);
  }

  await _buildBlock(block);

  let pairs = [];
  const height = block.height;
  const keyIndex = keyGen.genKey(_block, height.toString());
  const keyHash = keyGen.genKey(_block, block.hash);
  const keyWallet = keyGen.genKey(_wallet, address);
  let blocks = await _getBlocksByWallet(address);
  blocks.push(height);

  pairs.push(db.genKeyValuePair(keyIndex, block.hash));
  pairs.push(db.genKeyValuePair(keyHash, JSON.stringify(block)));
  pairs.push(db.genKeyValuePair(_height, height));
  pairs.push(db.genKeyValuePair(keyWallet, blocks));

  await db.addDataInBatch(pairs);

  await authWindow.removeAuthorization(address)

  return await _getBlockByHash(block.hash);
}

_getHeight = async () => {
  return db.getData(_height)
    .then(result => {
      if (!result) return undefined;

      return parseInt(result);
    });
}

_getBlockByHeight = async  height => {
  let key = keyGen.genKey(_block, height);
  let hash = await db.getData(key);

  if (!hash)
    throw new Error(`There is no block on height ${height}`);

  return _getBlockByHash(hash);
}

_getBlockByHash = async hash => {
  let key = keyGen.genKey(_block, hash);
  let block = await db.getDataJSON(key);

  if (!block)
    throw new Error(`There is no block on hash ${hash}`);

  return block;
}

_getBlocksByWallet = async address => {
  const key = keyGen.genKey(_wallet, address);

  return db.getData(key)
    .then(result => {
      if (!result) return [];

      return JSON.parse(`[${result}]`);
    });
}

// validate block
_validateBlock = async height => {
  // get block object
  let block = await _getBlockByHeight(height);
  let tmpBlock = Object.create(block);
  let blockHash = tmpBlock.hash;
  // remove block hash to test block integrity
  tmpBlock.hash = '';
  // generate block hash
  let validBlockHash = cypher.toHash(tmpBlock);
  // Compare
  return blockHash === validBlockHash;
}

// Validate blockchain
_validateChain = async () => {
  let errorLog = [];
  let promises = [];
  // let previous = undefined;

  const height = await _getHeight();
  if (!height) return;

  for (var i = 0; i < height - 1; i++) {
    promises.push(
      _getBlockByHeight(i)
        .then(block => {
          if (_validateBlock(block))
            errorLog.push(block.height);

          let retObj = {};
          retObj[block.height.toString()] = block;

          return retObj;
        })
    );//promisses.push
  }//for

  let results = await Promise.all(promises);
  results.forEach(element => {
    let b = Object.values(element)[0];

    if (b.height != 0) {
      let previous = results[b.height - 1][b.height - 1];
      let blockHash = previous.hash;
      let previousHash = b.previousBlockHash;

      if (blockHash !== previousHash)
        errorLog.push(b.height);
    }
  });

  if (errorLog.length > 0) {
    console.log('Block errors = ' + errorLog.length);
    console.log('Blocks: ' + errorLog);
  } else {
    console.log('No errors detected');
  }

  return errorLog;

}

_validateBlockBody = async block => {
  let errors = [];
  const address = block.body.address;
  const isAuthorized = await authWindow.isAddressAuthorized(address);
  validation.isBlockBodyValid(block.body, errors);

  if (!isAuthorized) {
    errors.push('No authorization to add blocks');
  }
  
  if (errors.length > 0){
    throw new Error(errors.join('; '));
  }
}

//Facede to hide private methods
class BlockChain {
  constructor() {
    console.log('Initializing chain!');
    _initializeChain();
  }

  async addBlock(block) {
    return _addBlock(block, false)
  }

  async getHeight() {
    return _getHeight();
  }

  async getBlockByHeight(height) {
    return _getBlockByHeight(height);
  }

  async getBlockByHash(hash) {
    return _getBlockByHash(hash);
  }

  async getBlocksByWallet(address) {
    const result = await _getBlocksByWallet(address);
    let promises = [];

    result.forEach(element => promises.push(this.getBlockByHeight(element)));

    return await Promise.all(promises);
  }

  async getAuthorization(address, doNotCreate) {
    return authWindow.getAuthorization(address, doNotCreate);
  }

  async verifyAuthorization(address, signature) {
    return authWindow.verifyAuthorization(address, signature);
  }

  async validateBlock(height) {
    return _validateBlock(height);
  }

  async validateChain() {
    return _validateChain();
  }
}


module.exports = {
  BlockChain
}