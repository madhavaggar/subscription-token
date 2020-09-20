"use strict";

const { Tezos } = require('@taquito/taquito');
const { InMemorySigner } = require('@taquito/signer')
const axios = require('axios');
const express = require('express');
const helmet = require('helmet');
const app = express();
const fs = require('fs');
const Redis = require('ioredis');
const ContractLoader = require('./modules/contractLoader.js');

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
var cors = require('cors')
app.use(cors())
const admin = require('../utils/keystore/admin');
const { parse } = require('path');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });


//const DESKTOPMINERACCOUNT = 4 //index in geth
//const APIKEY = fs.readFileSync("../api.key").toString().trim()
const APPPORT = 10003

/*
let accounts
web3.eth.getAccounts().then((_accounts) => {
    accounts = _accounts
    console.log("ACCOUNTS", accounts)
})
*/

//const NETWORK = parseInt(fs.readFileSync("../deploy.network").toString().trim())
//if (!NETWORK) {
//    console.log("No deploy.network found exiting...")
//    process.exit()
//}
const NETWORK = 0
console.log("NETWORK:", NETWORK)

let subscriptionListKey = "subscriptionListTokenSubDotCom" + NETWORK


let redisHost = 'localhost'
let redisPort = 57300

let LOOPTIME = 15000

if (NETWORK > 0 && NETWORK < 9) {
    redisHost = 'cryptogsnew.048tmy.0001.use2.cache.amazonaws.com'
    redisPort = 6379
    LOOPTIME = 15000
}
let redis = new Redis({
    port: redisPort,
    host: redisHost,
})



//my local geth node takes a while to spin up so I don't want to start parsing until I'm getting real data
async function checkForGeth() {

    const signer = await InMemorySigner.fromSecretKey(admin.privateKey);
    Tezos.setProvider({ rpc: 'https://testnet.tezster.tech', signer: signer });

    console.log("Starting parsers...")
    startParsers()
}
checkForGeth()

async function startParsers() {
    console.log("Parsers firing up, checking blocknumber...")
    setInterval(() => {
        redis.get(subscriptionListKey, async (err, result) => {
            let subscriptions
            try {
                subscriptions = JSON.parse(result)
            } catch (e) { contracts = [] }
            if (!subscriptions) subscriptions = []
            console.log("current subscriptions:", subscriptions.length)
            for (let t in subscriptions) {
                try {
                    let sign = await Tezos.signer.sign(subscriptions[t].subscriptionHash)
                    subscriptions[t].signature = sign.prefixSig
                    console.log("Subscription details", subscriptions[t])
                    console.log("Check changed Signature:", subscriptions[t].signature)
                    console.log("Loading Subscription ......")
                    let contract = await Tezos.contract.at(subscriptions[t].subscriptionContract)
                    console.log("Running initial Checks.....")
                    let WasteToken = await Tezos.contract.at(subscriptions[t].parts[2])
                    let storage = await WasteToken.storage()
                    let value1 = await storage['balances'].get(subscriptions[t].parts[0])
                    let balances
                    if(value1)
                        balances = value1['balance']
                    if(!balances){
                        balances = 0
                    }
                    else{
                        balances = balances.toNumber()
                    }
                    console.log("BALANCE",balances)
                    let value2 = await storage['balances'].get(subscriptions[t].parts[0])
                    let approvals
                    if(value2){
                        approvals = await value2['approvals'].get(subscriptions[t].subscriptionContract)
                    }
                    if(!approvals){
                        approvals=0
                    }
                    else{
                        approvals = approvals.toNumber()
                    }
                    console.log("ALLOWANCE",approvals)
                    //let doubleCheckHash = await contract.methods.getSubscriptionHash(subscriptions[t].parts[0], subscriptions[t].parts[1], subscriptions[t].parts[2], subscriptions[t].parts[3], subscriptions[t].parts[4], subscriptions[t].parts[5], subscriptions[t].parts[6]).call()
                    //console.log("doubleCheckHash:", doubleCheckHash)
                    //console.log("checking if ready...")
                    //let ready = await contract.methods.isSubscriptionReady(subscriptions[t].parts[0], subscriptions[t].parts[1], subscriptions[t].parts[2], subscriptions[t].parts[3], subscriptions[t].parts[4], subscriptions[t].parts[5], subscriptions[t].parts[6], subscriptions[t].signature).call()
                    //console.log("READY:", ready)
                    //if (ready) {
                     //   console.log("subscription says it's ready...........")
                    console.log("Check Log", parseFloat(subscriptions[t].parts[3])+ parseFloat(subscriptions[t].parts[5]))
                    if( (approvals >= parseFloat(subscriptions[t].parts[3]) + parseFloat(subscriptions[t].parts[5]) ) && 
                    (balances >= parseFloat(subscriptions[t].parts[3]) + parseFloat(subscriptions[t].parts[5]) ) ){
                        console.log("Balance-Approval check passed")
                        doSubscription(contract, subscriptions[t],Tezos)
                    }
                    //}
                } catch (e) { console.log(e) }
            }
        });
    }, LOOPTIME)
}


function removeSubscription(sig) {
    redis.get(subscriptionListKey, function (err, result) {
        let subscriptions
        try {
            subscriptions = JSON.parse(result)
        } catch (e) { subscriptions = [] }
        if (!subscriptions) subscriptions = []
        let newSubscriptions = []
        for (let t in subscriptions) {
            if (subscriptions[t].signature != sig) {
                newSubscriptions.push(subscriptions[t])
            }
        }
        redis.set(subscriptionListKey, JSON.stringify(newSubscriptions), 'EX', 60 * 60 * 24 * 7);
    });
}

app.get('/test', (req, res) => {
    console.log("TEST")
})

/*
app.get('/removesubscription/:sig/:key', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.params.key == APIKEY) {
        console.log("/removesubscription/" + req.params.sig)
        removeSubscription(req.params.sig)
        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify({ hello: "world" }));
        redis.set(subscriptionListKey, JSON.stringify([]), 'EX', 60 * 60 * 24 * 7);
    } else {
        res.end(JSON.stringify({ hello: "world" }));
    }

});


app.get('/clear/:key', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.params.key == APIKEY) {
        console.log("/clear")
        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify({ hello: "world" }));
        redis.set(subscriptionListKey, JSON.stringify([]), 'EX', 60 * 60 * 24 * 7);
    } else {
        res.end(JSON.stringify({ hello: "world" }));
    }

});

*/

app.get('/', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("/")
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({ hello: "world" }));
});


app.get('/miner', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("/miner")
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({ address: admin.publicKeyHash }));
});

app.get('/subscriptions', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("/subscriptions")
    redis.get(subscriptionListKey, function (err, result) {
        res.set('Content-Type', 'application/json');
        res.end(result);
    })
});

app.get('/subscriptionsByContract/:contractAddress', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("/subscriptionsByContract", req.params)
    redis.get(subscriptionListKey, function (err, result) {
        let mysubs = []
        try {
            let allsubs = JSON.parse(result)
            //console.log("allsubs:",allsubs)
            for (let s in allsubs) {
                if (allsubs[s].subscriptionContract == req.params.contractAddress) {
                    mysubs.push(allsubs[s])
                }
            }
        } catch (e) { console.log(e) }
        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify(mysubs));
    })
});

app.get('/subscription/:subscriptionHash', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("/subscription/" + req.params.subscriptionHash)
    let sigsKey = req.params.contract + "sigs"
    redis.get(subscriptionListKey, function (err, result) {
        res.set('Content-Type', 'application/json');

        let subscriptions
        try {
            subscriptions = JSON.parse(result)
        } catch (e) { subscriptions = [] }
        for (let t in subscriptions) {
            if (subscriptions[t].subscriptionHash == req.params.subscriptionHash) {
                res.end(JSON.stringify(subscriptions[t]));
            }
        }

        res.end(JSON.stringify(false));
    })
});

/*
app.post('/sign', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("/sign", req.body)
    let account = web3.eth.accounts.recover(req.body.message, req.body.sig)
    console.log("RECOVERED:", account)
    if (account.toLowerCase() == req.body.account.toLowerCase()) {
        console.log("Correct sig... log them into the contract...")
        let sigsKey = req.body.address + "sigs"
        redis.get(sigsKey, function (err, result) {
            let sigs
            try {
                sigs = JSON.parse(result)
            } catch (e) { sigs = [] }
            if (!sigs) sigs = []
            console.log("current sigs:", sigs)
            if (sigs.indexOf(req.body.account.toLowerCase()) < 0) {
                sigs.push(req.body.account.toLowerCase())
                console.log("saving sigs:", sigs)
                redis.set(sigsKey, JSON.stringify(sigs), 'EX', 60 * 60 * 24 * 7);
            }
        });
    //}
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({ hello: "world" }));
});
*/

app.post('/deploysub', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("/deploysub ", req.body)
    let deployingAddress = req.body.deployingAddress
    let deployedContractsKey = "deployedtokensubscriptioncontracts" + NETWORK
    redis.get(deployedContractsKey, function (err, result) {
        let contracts
        try {
            contracts = JSON.parse(result)
        } catch (e) { contracts = [] }
        if (!contracts) contracts = []
        console.log("current contracts:", contracts)
        if (contracts.indexOf(deployingAddress) < 0) {
            contracts.push(deployingAddress)
        }
        console.log("saving contracts:", contracts)
        redis.set(deployedContractsKey, JSON.stringify(contracts), 'EX', 60 * 60 * 24 * 7);
        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify({ contract: deployingAddress }));
    });
})

/*
app.get('/contracts/:key', (req, res) => {
    if (req.params.key == APIKEY) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log("/contracts")
        let deployedContractsKey = "deployedtokensubscriptioncontracts" + NETWORK
        redis.get(deployedContractsKey, function (err, result) {
            res.set('Content-Type', 'application/json');
            res.end(result);
        })
    } else {
        res.end("no");
    }
});
*/

app.post('/saveSubscription', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("/saveSubscription", req.body)
    //let account = web3.eth.accounts.recover(req.body.subscriptionHash, req.body.signature)////instead of trusting the hash you pass them you should really go get it yourself once the parts look good
    //console.log("RECOVERED:", account)
    //if (account.toLowerCase() == req.body.parts[0].toLowerCase()) {
    console.log("Passed Signature",req.body.signature);
    console.log("Generated Signature",Tezos.tz.getBalance(req.body.parts[0]))
    //req.body.signature = Tezos.signer.sign(req.body.subscriptionHash)
        console.log("Correct sig... relay subscription to contract... might want more filtering here, but just blindly do it for now")
        redis.get(subscriptionListKey, function (err, result) {
            let subscriptions
            try {
                subscriptions = JSON.parse(result)
            } catch (e) { contracts = [] }
            if (!subscriptions) subscriptions = []
            console.log("current subscriptions:",subscriptions)
            subscriptions.push(req.body)
            console.log("saving subscriptions:",subscriptions)
            redis.set(subscriptionListKey, JSON.stringify(subscriptions), 'EX', 60 * 60 * 24 * 7);
        });
    //}
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({ subscriptionHash: req.body.subscriptionHash }));

});


app.listen(APPPORT);
console.log(`http listening on `, APPPORT);


/*
function doTransaction(contract, txObject) {
    //console.log(contracts.BouncerProxy)
    console.log("Forwarding tx to ", contract._address, " with local account ", accounts[3])
    let txparams = {
        from: accounts[DESKTOPMINERACCOUNT],
        gas: txObject.gas,
        gasPrice: Math.round(4 * 1000000000)
    }
    //const result = await clevis("contract","forward","BouncerProxy",accountIndexSender,sig,accounts[accountIndexSigner],localContractAddress("Example"),"0",data,rewardAddress,reqardAmount)
    console.log("TX", txObject.sig, txObject.parts[1], txObject.parts[2], txObject.parts[3], txObject.parts[4], txObject.parts[5], txObject.parts[6], txObject.parts[7])
    console.log("PARAMS", txparams)
    contract.methods.forward(txObject.sig, txObject.parts[1], txObject.parts[2], txObject.parts[3], txObject.parts[4], txObject.parts[5], txObject.parts[6], txObject.parts[7]).send(
        txparams, (error, transactionHash) => {
            console.log("TX CALLBACK", error, transactionHash)
        })
        .on('error', (err, receiptMaybe) => {
            console.log("TX ERROR", err, receiptMaybe)
        })
        .on('transactionHash', (transactionHash) => {
            console.log("TX HASH", transactionHash)
        })
        .on('receipt', (receipt) => {
            console.log("TX RECEIPT", receipt)
        })
        .on('confirmation', (confirmations,receipt)=>{
          console.log("TX CONFIRM",confirmations,receipt)
        })
        .then((receipt) => {
            console.log("TX THEN", receipt)
        })
}
*/

async function doSubscription(contract, subscriptionObject,Tezos) {
    console.log("!!!!!!!!!!!!!!!!!!!\n------------ Running subscription on contract ", subscriptionObject.subscriptionContract, " \nwith local account ", admin.publicKeyHash, " with gas set by Default")

    //const result = await clevis("contract","forward","BouncerProxy",accountIndexSender,sig,accounts[accountIndexSigner],localContractAddress("Example"),"0",data,rewardAddress,reqardAmount)
    console.log("subscriptionObject", subscriptionObject.parts[0], subscriptionObject.parts[1], subscriptionObject.parts[2], subscriptionObject.parts[3], subscriptionObject.parts[4], subscriptionObject.parts[5], subscriptionObject.parts[6])
    console.log("---========= EXEC ===========-----")
    console.log(subscriptionObject)
    var key = await Tezos.signer.publicKey()
    console.log("Sent public key",key)
    try{
        const op = await contract.methods.executeSubs(
            subscriptionObject.parts[0],
            subscriptionObject.parts[1],
            subscriptionObject.parts[2],
            subscriptionObject.parts[3],
            subscriptionObject.parts[4],
            subscriptionObject.parts[5],
            subscriptionObject.parts[6],
            subscriptionObject.signature,
            key,
            ).send();
        await op.confirmation(3);
        var hash = await op.hash;
        console.log("Operation injected: https://carthagenet.tzstats.com/",hash)
    }catch (e) { console.log(e) }   
}