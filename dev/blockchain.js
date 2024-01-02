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

    this.createNewBlock(100, '56HLKJ4625H', '56HLKJ4625H');
} 

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

// it checks the chain in the blockchain in valid
Blockchain.prototype.chainIsValid = function(blockchain){
    let validChain = true;
    for(var i=1; i<blockchain.length; i++)
    {
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i - 1];
        const blockHash = this.hashBlock(prevBlock['Hash'], {transaction: currentBlock['transaction'], index: currentBlock['index']}, currentBlock['nonce']);
        if(blockHash.substring(0, 4) !== '0000') validChain = false;

        if(currentBlock['previousBlockHash'] !== prevBlock['Hash']) validChain = false;
    }

    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce'] === 100;
    const correctPreviousHash = genesisBlock['previousBlockHash'] === '56HLKJ4625H';
    const correctHash = genesisBlock['Hash'] === '56HLKJ4625H';
    const correctTransaction = genesisBlock['transaction'].length === 0;

    if(!correctNonce || !correctPreviousHash || !correctHash || !correctTransaction) validChain=false;

    return validChain;
};


Blockchain.prototype.getBlock = function(blockHash){
    let correctBlock = null;
    this.chain.forEach(eachBlock =>{
        if(eachBlock.Hash === blockHash) correctBlock = eachBlock;
    });

    return correctBlock;
};

Blockchain.prototype.getTransaction = function(transactionId){
    let correctTransaction = null;
    let correctBlock = null;
    this.chain.forEach(block =>{
        block.transaction.forEach(transaction =>{
            if(transaction.transactionId === transactionId){
                correctBlock = block;
                correctTransaction = transaction;
            }
        })
    });
    return {
        transaction: correctTransaction,
        block: correctBlock
    }
};


Blockchain.prototype.getTransactionData = function(address){
    const addressTransaction = [];
    this.chain.forEach(block =>{
        block.transaction.forEach(transaction =>{
            if(transaction.sender === address || transaction.recipient === address)
            {
                addressTransaction.push(transaction);
            }
        });
    });

    let balance = 0;
    addressTransaction.forEach(transaction =>{
        if(transaction.recipient === address) balance += transaction.amount;
        if(transaction.sender === address) balance -= transaction.amount;
    })

    return {
        addressTransaction: addressTransaction,
        balance: balance
    }
};

module.exports = Blockchain;