//logic completely clear. Just handle address and sign sizes and contractLoader
import React, { Component } from 'react'; 
import './App.css';
//import { Gas } from "dapparatus"
import ContractLoader from './dapparatus/contractloader';
import Metamask from './dapparatus/metamask';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import MainUI from './components/mainui.js'
import Subscriber from './components/subscriber.js'
import Publisher from './components/publisher.js'
import PublisherDeploy from './components/publisherDeploy'
import SubscriberApprove from './components/subscriberApprove'
import Coins from './coins.js'
import axios from 'axios'

let backendUrl = "http://localhost:10003/"
if(window.location.href.indexOf("tokensubscription.com")>=0)
{
  backendUrl = "https://relay.tokensubscription.com/"
}

class App extends Component {
  constructor(props) {
    super(props);
    let contract
    let subscription
    let path = window.location.pathname.replace("/","")

    if(path.length==36 && path.startsWith('KT')){ // length with address
      contract = path
      console.log("Subscriber Enters using contract",contract)
    }else if(path.startsWith('HASH')){ // length with hash 
      console.log("Subcription Hash with HASH",path)
      path = path.substring(4)
      subscription = path
      console.log("Subcription Hash",subscription)
    }else{
      console.log("PATH LENGTH UNKNWON",path,path.length)
    }
    let startMode = ""
    if(contract||subscription){
      startMode = "subscriber"
    }

    this.state = {
      Tezos: false,
      account: false,
      gwei: 4,
      doingTransaction: false,
      contract: contract,
      subscription: subscription,
      mode: startMode,
      coins:false,
      contractLink:""
    }
  }

  async deploySubscription(toAddress,tokenName,tokenAmount,timeType,timeAmount,gasPrice,email) {
    let {Tezos} = this.state
    //requiredToAddress,requiredTokenAddress,requiredTokenAmount,requiredPeriodSeconds,requiredGasPrice
    let requiredToAddress = null
    if(toAddress){
      requiredToAddress = toAddress
    }

    let foundToken
    let requiredTokenAddress = null
    if(tokenName){
      //translate tokenName to tokenAddress
      for(let i = 0; i < this.state.coins.length; i++){
        if(tokenName == this.state.coins[i].address){
          requiredTokenAddress = this.state.coins[i].address
          foundToken = this.state.coins[i]
        }
      }
    }

    let requiredPeriodSeconds= null
    if(timeAmount){
      //translate timeAmount&timeType to requiredPeriodSeconds
      let periodSeconds = timeAmount;
      if(timeType=="minutes"){
        periodSeconds*=60
      }else if(timeType=="hours"){
        periodSeconds*=3600
      }else if(timeType=="days"){
        periodSeconds*=86400
      }else if(timeType=="months"){
        periodSeconds*=2592000
      }
      if(periodSeconds){
        requiredPeriodSeconds=periodSeconds
      }
    }

    let requiredTokenAmount = null
    let requiredGasPrice = null
    if(tokenAmount && foundToken){
      requiredTokenAmount = tokenAmount * (10**6)
      if(gasPrice && foundToken){
        requiredGasPrice = gasPrice * (10**6)
        requiredTokenAmount -= requiredGasPrice
      }
    }


    console.log("Deploying Subscription Contract...")
    let code = require('./contracts/build/main/Subscription/main_compiled.json')
    const admin = await Tezos.wallet.pkh()

    let args = [
      requiredToAddress,
      requiredTokenAddress,
      requiredTokenAmount,
      requiredPeriodSeconds,
      requiredGasPrice
    ]

    console.log("ARGS",args)

    const op = await Tezos.wallet.originate({
      code:code,
      storage:{
        times : new MichelsonMap(),
        extraNonce : new MichelsonMap(),
        owner : admin,
        balance : 0,
        allowance : 0,
        reqToAddress: requiredToAddress,
        reqTokenAddress: requiredTokenAddress,
        reqTokenAmount: requiredTokenAmount,
        reqPeriodSeconds : requiredPeriodSeconds,
        reqGasPrice : requiredGasPrice
      }
      }).send()
    
    const contract = await op.contract();
    const contractAddress = await contract.address;
  
    this.setState({deployedAddress : contractAddress})
    console.log("Deployed Address",this.state.deployedAddress)

    axios.post(backendUrl+'deploysub',{arguments:args,email:email,deployingAddress: contractAddress}, {
      headers: {
          'Content-Type': 'application/json',
      }
    }).then((response)=>{
      console.log("SAVED INFO",response.data)
    })
    .catch((error)=>{
      console.log(error);
    });
  }

  setMode(mode){
    this.setState({mode:mode})
  }

  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }

  render() {
    let {Tezos,contracts,mode,deployedAddress} = this.state
    let connectedDisplay = []
    let contractsDisplay = []
    let noTezosDisplay = ""
    if(Tezos){
      connectedDisplay.push(
        <ContractLoader
         key="ContractLoader"
         config={{DEBUG:true}}
         Tezos={Tezos}
         require={path => {return require(`${__dirname}/${path}`)}}
         onReady={(contracts,customLoader)=>{
           console.log("contracts loaded",contracts)

           this.setState({contractLink:contracts.Subscription._address,contracts:contracts,customContractLoader:customLoader},async ()=>{
             console.log("Contracts Are Ready:",this.state.contracts)
             Coins.unshift(
              {
                  address:"0x0000000000000000000000000000000000000000",
                  name:"*ANY*",
                  symbol:"*ANY*",
                  imageUrl:"https://s2.coinmarketcap.com/static/img/coins/32x32/1896.png"
              }
            )
             Coins.push(
               {
                address:this.state.contracts.WasteToken._address,
                name:"WasteCoin",
                symbol:"WC",
                imageUrl:"https://s3.amazonaws.com/wyowaste.com/wastecoin.png"
               }
             )
             this.setState({coins:Coins})
           })
         }}
        />
      )

      if(contracts&&mode){

        let body
        if(mode=="subscriber"){
          if(this.state.subscription){
            body = (
              <SubscriberApprove
                {...this.state}
                backendUrl={backendUrl}
              />
            )
          }else if(deployedAddress){
            body = (
              <div>
                subscriber deploy page {deployedAddress}
              </div>
            )
          }else{
            body = (
              <Subscriber
                {...this.state}
                backendUrl={backendUrl}
                deploySubscription={this.deploySubscription.bind(this)}
              />
            )
          }

        }else{
          if(deployedAddress){
            body = (
              <PublisherDeploy {...this.state}
                setMode={this.setMode.bind(this)}
                deployedAddress={deployedAddress}
              />
            )
          }else{
            body = (
              <Publisher
                {...this.state}
                deploySubscription={this.deploySubscription.bind(this)}
                setMode={this.setMode.bind(this)}
              />
            )
          }
        }

        contractsDisplay.push(
          <div key="UI" style={{padding:30}}>
            <div>
              {body}
            </div>
          </div>
        )
      }else{
        connectedDisplay.push(
          <MainUI buttonPress={
            ()=>{
                this.setState({mode:"publisher"})
            }
          }/>
        )
      }
    }else{
      noTezosDisplay = (
        <MainUI buttonPress={
          ()=>{
            alert("Install Taquito and configure Tezos ")
          }
        }/>
      )
    }

    let forkBanner = ""
    if(!this.state.mode){
      forkBanner = (
        <a href="https://github.com/austintgriffith/tokensubscription.com">
        </a>
      )
    }

    return (
      <div className="App">
         {forkBanner}
        <Metamask
          config={{
            requiredNetwork:['carthagenet'],
            DEBUG: true,
            boxStyle: {
              paddingRight:75,
              marginTop:0,
              paddingTop:10,
              zIndex:10,
              textAlign:"right",
              width:300,
            }
          }}
          onUpdate={(state)=>{
           console.log("Tezos state update:",state)
           if(state.Tezos) {
             this.setState(state)
           }
          }}
        /> 
        <div className="container">
          {connectedDisplay}
          {contractsDisplay}
          {noTezosDisplay}
        </div>
      </div>
    );
  }
}



export default App;