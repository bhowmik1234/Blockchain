const Blockchain = require('./blockchain');

const bitcoin = new Blockchain;

bitcoin.addNewTransaction(200, 'E4JKJL5H4', '234JKH5L2KJ34H5');
bitcoin.addBlock();
bitcoin.addNewTransaction(1045, 'JKH624234HG5', '2GFD56J57K');
bitcoin.addBlock();


// const previousBlockHash = bitcoin.lastBlockHash();
// const blockData = [
//     {
//         amount: 1234,
//         sender: '5463hl5635',
//         recipient: '5463L5H6245'
//     },
//     {
//         amount: 5996,
//         sender: '5J6H5E6W',
//         recipient: '56546H;345K6J354'
//     }
// ];

// const nonce =  bitcoin.proofOfWork(previousBlockHash, blockData);
// bitcoin.createNewBlock(nonce, previousBlockHash, bitcoin.hashBlock(previousBlockHash, blockData, nonce));

// console.log(bitcoin.hashBlock(previousBlockHash, blockData, 26245));

// console.log(bitcoin);
console.log(bitcoin.chain[1]['transaction'])