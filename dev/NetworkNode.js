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

app.get('/blockchain', function (req, res) {
    res.send(bitcoin);
});

app.post('/transaction', function (req, res) {
    const transaction_info = req.body;
    const blockIndex = bitcoin.addNewTransaction(transaction_info.amount, transaction_info.sender, transaction_info.recipient);
    res.json({note: `Transaction will be added in the block ${blockIndex}`});
});

app.get('/mine', function (req, res) {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];

    const currentBlockData = {
        transaction: bitcoin.pendingTransaction,
        index: lastBlock['index'] + 1
    };

    bitcoin.addNewTransaction(12.5, "00", nodeAddress);

    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const currentBlockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, currentBlockHash);

    res.json({
        note: "New block mined to blockchain,",
        block: newBlock
    });
});

// it will register a block and broadcast it to all other network node
app.post('/register-and-broadcast-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    if(bitcoin.NetworkNodes.indexOf(newNodeUrl) == -1) bitcoin.NetworkNodes.push(newNodeUrl);

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
sdfadfgit 
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

app.listen(port, function(){
    console.log(`Listening to port ${port}.....`);
})