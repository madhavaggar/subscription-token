const json = require('../../src/contracts/config.json');
module.exports = async (contractList,Tezos) => {
    let contracts = []
    for(let c in contractList){
      try{
        for(var i in json){
            if(i.endsWith("ContractAddress") && i.startsWith(contractList[c])){
              contractAddress = json[i]
            }
          }
        console.log(contractList[c],contractAddress)
        let contract = await Tezos.contract.at(contractAddress)
        contracts[contractList[c]] = contract
        console.log("contract")
      }catch(e){console.log(e)}
    }
    return contracts
  }
