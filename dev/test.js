const Blockchain = require('./blockchain');
const bitcoin = new Blockchain;

const bc1 =
{
    "chain": [
        {
            "index": 1,
            "Hash": "56HLKJ4625H",
            "previousBlockHash": "56HLKJ4625H",
            "transaction": [],
            "timestamp": 1704027983629,
            "nonce": 100
        },
        {
            "index": 2,
            "Hash": "0000b04b62ac0c9c93976caaa0502c6dc0a0a8543816063e596ff73edcb09110",
            "previousBlockHash": "56HLKJ4625H",
            "transaction": [],
            "timestamp": 1704028128916,
            "nonce": 44539
        },
        {
            "index": 3,
            "Hash": "00000063188e0533cf768d212d1b63aead972d2b039f844d5cb2487f9f497f24",
            "previousBlockHash": "0000b04b62ac0c9c93976caaa0502c6dc0a0a8543816063e596ff73edcb09110",
            "transaction": [
                {
                    "amount": 12.5,
                    "recipient": "56J34L5K6H3L",
                    "sender": "00",
                    "transactionId": "9227b0d269cc4db582d15ed10df8d811"
                },
                {
                    "amount": 540,
                    "sender": "4K56H3L4",
                    "recipient": "543GVJBJYHL"
                },
                {
                    "amount": 100,
                    "sender": "4K56H3L4",
                    "recipient": "543GVJBJYHL"
                },
                {
                    "amount": 48,
                    "sender": "4K56H3L4",
                    "recipient": "543GVJBJYHL"
                }
            ],
            "timestamp": 1704028170242,
            "nonce": 29646
        },
        {
            "index": 4,
            "Hash": "00005f94820316303b6cb3100f3bb8630bc5b1db57c5d22e14ec2952ed233575",
            "previousBlockHash": "00000063188e0533cf768d212d1b63aead972d2b039f844d5cb2487f9f497f24",
            "transaction": [
                {
                    "amount": 12.5,
                    "recipient": "56J34L5K6H3L",
                    "sender": "00",
                    "transactionId": "387d00b3448148b68d557442934ff2d6"
                },
                {
                    "amount": 980,
                    "sender": "4K56H3L4",
                    "recipient": "543GVJBJYHL"
                }
            ],
            "timestamp": 1704028195643,
            "nonce": 86590
        }
    ],
    "pendingTransaction": [
        {
            "amount": 12.5,
            "recipient": "56J34L5K6H3L",
            "sender": "00",
            "transactionId": "88151f07c0df4878ae4cd4e8f7cfaaed"
        }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "NetworkNodes": []
};

console.log("valid: ", bitcoin.chainIsValid(bc1['chain']));
