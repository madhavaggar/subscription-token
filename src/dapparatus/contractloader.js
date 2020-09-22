import React, { Component } from 'react';
import deepmerge from 'deepmerge';
const json = require('../contracts/config.json');

let defaultConfig = {}
defaultConfig.DEBUG = true;
defaultConfig.hide = true;
class ContractLoader extends Component {
  constructor(props) {
    super(props);
    let config = defaultConfig
    if(props.config) {
      config = deepmerge(config, props.config)
    }
    this.state = {
      config: config,
      contracts: {}
    }
  }
  contractLoader = async (contractName,customAddress) => {
    let {DEBUG} = this.state.config
    let resultingContract
   
    let contractAddress
    for(var i in json){
      if(i.endsWith("ContractAddress") && i.startsWith(contractName)){
        contractAddress = json[i]
      }
    }
    try{
      let contractObject = {
        address: contractAddress
      }
      if(customAddress){
        contractObject.address = customAddress
      }
      if(DEBUG) console.log("ContractLoader - Loading ",contractName,contractObject)

      this.props.Tezos.setProvider({ rpc: 'https://api.tez.ie/rpc/carthagenet' })

      let contract = await this.props.Tezos.contract.at(contractObject.address);

      resultingContract = contract.methods
      resultingContract._address = contractObject.address
      resultingContract._contract = contract
    }catch(e){
      console.log("ERROR LOADING CONTRACT "+contractName,e)
    }
    return resultingContract
  }
  componentDidMount= async () => {
    let {require} = this.props
    let {DEBUG} = this.state.config
    let contractList = require("contracts/contracts.js")
    if(DEBUG) console.log("ContractLoader - Loading Contracts",contractList)
    let contracts = {}
    for(let c in contractList){
      let contractName = contractList[c];
      contracts[contractName] = await this.contractLoader(contractName)
    }
    this.setState({contracts:contracts},()=>{
      this.props.onReady(this.state.contracts,this.contractLoader.bind(this))
    })
  }
  render(){
    if(this.state.config.hide){
      return false
    } else {
      let contractDisplay = []
      if(this.state.contracts){
        for(let c in this.state.contracts){
          contractDisplay.push(
            <div key={"contract"+c} style={{margin:5,padding:5}}>
              {c} ({this.state.contracts[c]._address})
            </div>
          )
        }
      }else{
        contractDisplay = "Loading..."
      }
      return (
        <div style={{padding:10}}>
          <b>Contracts</b>
          {contractDisplay}
        </div>
      )
    }
  }
}
export default ContractLoader;