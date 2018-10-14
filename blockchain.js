/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const Block = require('./block')
const SHA256 = require('crypto-js/sha256');
const leveldb = require('./levelSandbox');

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.createGenesisBlock();
  }

  // create the Genesis block
  async createGenesisBlock() {
    console.log("create Genesis block")
    const height = await leveldb.getBlockHeight();
    if(height==0){
      this.addBlock(new Block("First block in the chain - Genesis block"));
    }
  }
  // Add new block
  async addBlock(newBlock){
    // Block height
    const height = await leveldb.getBlockHeight();
    newBlock.height = height;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if(newBlock.height>0){
      let preBlock = await leveldb.getBlock(newBlock.height - 1);
      newBlock.previousBlockHash = preBlock.hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
  	const ret = await leveldb.addBlock(newBlock.height, JSON.stringify(newBlock));
    console.log(ret);
  }

  // Get block height
  async getBlockHeight () {
    const height = await leveldb.getBlockHeight()
    return height
  }

  // get block
  async getBlock (blockHeight) {
    const block = await leveldb.getBlock(blockHeight)
    return block
  }

  // get chain
  async getChain () {
    const chain = await leveldb.getChain()
    return chain
  }
    
    // validate block
    async validateBlock(blockHeight){
      // get block object
      let block = await leveldb.getBlock(blockHeight);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          return true;
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }
    }

   // Validate blockchain
   async validateChain(){
      let errorLog = [];
      const chain = await leveldb.getChain();
      for (var i = 0; i < chain.length-1; i++) {
        // validate block
        if (!this.validateBlock(i))errorLog.push(i);
        // compare blocks hash link
        let block = await leveldb.getBlock(i);
        let blockHash = block.hash;
        let prevBlock = await leveldb.getBlock(i+1);
        let previousHash = prevBlock.previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
  }
  
  // batch add
  async batchAddBlock() {
    for (var i = 0; i <= 10; i++) {
      await blockchain.addBlock(new Block("test data "+i));
    }
  }
}

module.exports = Blockchain