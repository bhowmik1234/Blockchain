const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const port = process.argv[3];
const rp = require('request-promise')


const nodeAddress = uuidv4().split('-').join('');   // address for the new block with was created as reward

const Blockchain = require('./blockchain');
const bitcoin = new Blockchain;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// send the bitcoin blockchan to the network
app.get('/blockchain', function (req, res) {
    res.send(bitcoin);
});

// recieve the transaction and to the pending transaction
app.post('/transaction', function (req, res) {
    const transaction_info = req.body;
    const blockIndex = bitcoin.addTransactionToPendingTransaction(transaction_info);
    res.json({note: `Transaction will be added in the block ${blockIndex}`});
});

// add transaction to existing node and broadcast it to all other node
app.post('/transaction/broadcast', function(req, res) {
    const newTransaction = bitcoin.addNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionToPendingTransaction(newTransaction);

    const allPromises = [];
    bitcoin.NetworkNodes.forEach(networkUrl => {
        const requestOption = {
            uri: networkUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };

        allPromises.push(rp(requestOption)); 
    });

    Promise.all(allPromises)
    .then(data => {
        res.send({note: "All transaction created and broadcast successfully."});
    });
});

// add block to the single node network
app.get('/mine', function (req, res) {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock.Hash;

    const currentBlockData = {
        transaction: bitcoin.pendingTransaction,
        index: lastBlock['index'] + 1
    };

    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const currentBlockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, currentBlockHash);

    const requestPromises = [];
    bitcoin.NetworkNodes.forEach(networkUrl => {
        const requestOption = {
            uri: networkUrl + '/recieve-new-block',
            method: 'POST',
            body: {newBlock: newBlock},
            json: true
        };

        requestPromises.push(rp(requestOption)); 
    });

    Promise.all(requestPromises)
    .then(data =>{
        const requestOption = {
            uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body:{
                amount: 12.5,
                recipient: "56J34L5K6H3L",
                sender: "00"
            },
            json: true
        };

        return rp(requestOption);
    })
    .then(data =>{
        res.json({
            note: "New block mined to blockchain,",
            block: newBlock
        });
    });

    
});

// it recieve new block and add it to all other node
app.post('/recieve-new-block', function(req, res) {
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctIndex = (lastBlock['index'] + 1) ===  newBlock['index'];
    const correctHash = lastBlock.Hash === newBlock.previousBlockHash;

    if(correctHash && correctIndex)
    {
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransaction = [];
        res.json({
            note: 'New block mined successfully',
            newBlock: newBlock
        });
    }
    else{
        res.json({
            note: 'New Block rejected',
            newBlock: newBlock
        });
    }
});

// it will register a block and broadcast it to all other network node
app.post('/register-and-broadcast-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    if(bitcoin.NetworkNodes.indexOf(newNodeUrl) === -1 && newNodeUrl !== bitcoin.currentNodeUrl) bitcoin.NetworkNodes.push(newNodeUrl);

    const regNodesPromises = [];
    bitcoin.NetworkNodes.forEach(networkNodeUrl =>{
        const requestOption = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: {newNodeUrl: newNodeUrl},
            json: true
        };
        regNodesPromises.push(rp(requestOption));
    });

    Promise.all(regNodesPromises)
    .then(data => {
        const bulkRegisterOption = {
            uri: newNodeUrl + '/register-node-bulk',
            method: 'POST',
            body: {netWorkNodes: [...bitcoin.NetworkNodes, bitcoin.currentNodeUrl]},    // ... used to spread the array [[a,b,c,d]] to [a,b,c,d]
            json: true
        };
        return rp(bulkRegisterOption);
    })
    .then(data => {
        res.json({note: 'New Node register with the network successfully.'});
    })
});

// it will accept the new node and register it url
app.post('/register-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = bitcoin.NetworkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.NetworkNodes.push(newNodeUrl);
    res.json({note: 'New Node reigster with the current node'});

});

// the new node will register all nodes url in the network
app.post('/register-node-bulk', function(req, res){
    const netWorkNodes = req.body.netWorkNodes;
    netWorkNodes.forEach(netWorkNodeUrl => {
        const nodeNotAlreadyPresent = bitcoin.NetworkNodes.indexOf(netWorkNodeUrl) == -1;
        const notCurrentNode = bitcoin.currentNodeUrl !== netWorkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.NetworkNodes.push(netWorkNodeUrl)
    })

    

    res.json({note: 'Bulk node register successfullly.'});
});

// consenses algorithm (longest chain)
app.get('/consenses', function(req, res){
    const requestPromises = [];
    bitcoin.NetworkNodes.forEach(networkNodeUrl =>{
        const requestOption = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        };

        requestPromises.push(rp(requestOption));
    });

    Promise.all(requestPromises)
    .then(blockchains =>{
        const currentChainLength = bitcoin.chain.length;
        const maxChainLength = currentChainLength;
        const newLongestChain = null;
        const pendingTransaction = null;

        blockchains.forEach(blockchain =>{
            if(blockchain.chain.length > currentChainLength)
            {
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                pendingTransaction = blockchain.pendingTransaction;
            };
        });

        if(!newLongestChain || (newLongestChain && bitcoin.chainIsValid(newLongestChain)))
        {
            res.json({
                note: 'newLongest chain is not valid.',
                chain: bitcoin.chain
            })
        }
        else if (newLongestChain && bitcoin.chainIsValid(newLongestChain))
        {
            bitcoin.chain = newLongestChain;
            bitcoin.pendingTransaction = pendingTransaction;
            res.json({
                note: 'current Node chain is replaced by new longest chain.',
                chain: newLongestChain 
            });
        }

    })
});


// Determine to run blockchain in which port
app.listen(port, function(){
    console.log(`Listening to port ${port}.....`);
})