const sha256 = require('sha256');
const currentNodeUrl = process.argv[4];
const { v4: uuidv4 } = require('uuid');

// Genese block means the first block in block chain

// create newblock
// getlast block
// add new transaction
// hashblock
// proof of work
function Blockchain()
{
    this.chain = [];
    this.pendingTransaction = [];

    this.currentNodeUrl = currentNodeUrl;
    this.NetworkNodes = [];

    this.createNewBlock(100, '56HLKJ4625H', 'JH6G2JH3K65KJ6');
} 

// Add block to the blockchain
// Blockchain.prototype.addBlock = function()
// {
//     const lastBlockHash = this.lastBlockHash();
//     const nonce = this.proofOfWork(lastBlockHash, this.transaction);
//     var newBlock = {
//         index: this.chain.length + 1,
//         Hash: this.hashBlock(lastBlockHash, this.transaction, nonce),
//         previousBlockHash: lastBlockHash,
//         transaction: this.pendingTransaction,
//         timestamp: Date.now(),
//         nonce: nonce,
//     }

//     this.pendingTransaction = [];
//     this.chain.push(newBlock);

// }

// Creation of new block 
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, Hash)
{
    var newBlock = {
        index: this.chain.length + 1,
        Hash: Hash,
        previousBlockHash: previousBlockHash,
        transaction: this.pendingTransaction,
        timestamp: Date.now(),
        nonce: nonce,
    }

    this.pendingTransaction = [];
    this.chain.push(newBlock);

    return newBlock;
}



// give all details related to last Block
Blockchain.prototype.getLastBlock = function()
{
    return this.chain[this.chain.length - 1];
}

// Add new transaction to blockchain    
Blockchain.prototype.addNewTransaction = function(amount, sender, recipient)
{
    const newTransaction = {
        amount: amount, 
        recipient: recipient,
        sender: sender,
        transactionId: uuidv4().split('-').join('')
    };

    return newTransaction;
}

// add transaction to the pending transaction
Blockchain.prototype.addTransactionToPendingTransaction = function (transactionObj)
{
    this.pendingTransaction.push(transactionObj);
    return this.getLastBlock()['index'] + 1;
}

// returh hash of block according to the data 
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce)
{
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);

    return hash;
}

// proog for the data to check wheather the block is legitimate or not
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData)
{
    var nonce = 0;
    var hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while(hash.substring(0,4) != '0000')
    {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
}

module.exports = Blockchain;