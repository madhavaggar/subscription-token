import React, { Component } from 'react';
import Address from "../dapparatus/address"
import Blockie from '../dapparatus/blockie'
import Scaler from '../dapparatus/scaler'
import axios from 'axios'
import Particles from '../particles.png';
import Loader from "../loader.gif"
import { TezBridgeSigner } from "@taquito/tezbridge-signer";

let pollInterval
let pollTime = 1777

class SubscriberApprove extends Component {
  constructor(props) {
    super(props);
    this.state = {
      approved:0,
      approve:12,
      loading:false
    };
  }
  async componentDidMount(){
    axios.get(this.props.backendUrl+"subscription/"+this.props.subscription, { crossdomain: true })
    .catch((err)=>{
      console.log("Error getting subscription",err)
    })
    .then(async (response)=>{
      console.log("subscription:",response.data)
      this.setState({subscription:response.data})
      this.props.Tezos.setProvider({signer: new TezBridgeSigner()})
      //let subscriptionContract = this.props.customContractLoader("Subscription",this.props.contract)
      let tokenContract = await this.props.customContractLoader("WasteToken",response.data.parts[2])
      console.log("TokenContract",tokenContract);
      let foundToken
      for(let i = 0; i < this.props.coins.length; i++){
        if(tokenContract._address == this.props.coins[i].address){
          foundToken = this.props.coins[i]
        }
      }
      this.setState({token:foundToken,tokenContract:tokenContract})
    })
    pollInterval = setInterval(this.load.bind(this),pollTime)
    await this.load()
  }
  componentWillUnmount(){
    clearInterval(pollInterval)
  }
  async load(){
    if(this.state.tokenContract){
      let storage = await this.state.tokenContract._contract.storage()
      console.log("STORAGE",storage)
      let value1 = await storage['balances'].get(this.props.account)
      let balances
      if(value1)
        balances = value1['balance']
      if(!balances){
        balances = 0
      }
      console.log("BALANCES",balances)
      let value2 = await storage['balances'].get(this.state.subscription.parts[0])
      let approvals
      if(value2){
        approvals = await value2['approvals'].get(this.state.subscription.subscriptionContract)
      }
      if(!approvals){
        approvals=0
      }
      console.log("APPROVAL",approvals)
      this.setState({
        balance: balances.toNumber(),
        approved: approvals.toNumber()
      })
    }
  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }
  render() {
    let {Tezos} = this.props
    if(!this.state.subscription){
      return (
        <div><img src={Loader} style={{maxWidth:80,verticalAlign:'middle'}} /> Loading Subscription...</div>
      )
    }
    console.log(this.state.subscription)

    let from = this.state.subscription.parts[0]
    let to = this.state.subscription.parts[1]
    let token = this.state.subscription.parts[2]

    console.log("token",token)

    if(!this.state.tokenContract){
      return (
        <div><img src={Loader} style={{maxWidth:80,verticalAlign:'middle'}} /> Connecting to Subscription Contract...</div>
      )
    }


    let tokenAmount = parseInt(this.state.subscription.parts[3].toString())
    let periodSeconds = (this.state.subscription.parts[4]).toString()
    let gasPrice = parseInt((this.state.subscription.parts[5]).toString())

    console.log("TOKEN",this.state.token)

    let loading = ""
    if(this.state.loading){
      loading = (
        <img src={Loader} style={{maxWidth:50,verticalAlign:"middle"}} />
      )
    }

    let approvedColor = "#fd9653"
    if(this.state.approved>0){
      approvedColor = "#5396fd"
    }

    let particleRender = (
      <img style={{zIndex:-1,position:"absolute",left:-2500,top:400,opacity:0.4}} src={Particles} />
    )



    return (
      <Scaler config={{startZoomAt:800,origin:"50px 50px"}}>
        {particleRender}
        <h1>Approve Max Subscription Limit:</h1>
        <div>Subscription: {this.state.subscription.subscriptionHash}</div>
        <div>
          {tokenAmount+gasPrice} <img style={{maxHeight:25}} src={this.state.token.imageUrl}/>{this.state.token.name}
        </div>
        <div>
          From <Address
            {...this.props}
            address={from}
          /> to <Address
            {...this.props}
            address={to}
          />
        </div>
        <div>
          Recurring every {periodSeconds}s
        </div>
        <div style={{marginTop:20}}>
          Token Balance: <span>{this.state.balance}</span>
        </div>
        <div style={{marginTop:20,fontSize:28}}>
          Approved Tokens: <span style={{color:approvedColor}}>{this.state.approved}</span>
        </div>
        <div style={{marginTop:40}} className="form-field">
        {loading}<input
          type="text" name="approve" value={this.state.approve} onChange={this.handleInput.bind(this)}
        />
          <button size="2" onClick={async  ()=>{
              let amount = ""+(this.state.approve)
              let address = ""+(this.state.subscription.subscriptionContract)
              this.setState({loading:true})
              this.state.tokenContract.approve(address,amount).send()
              .then(op=>{
                return op.confirmation().then(() => op.hash);
              })
              .then(hash => {
                this.setState({loading:false})
                console.log(`Operation injected: https://carthagenet.tzstats.com/${hash}`)
              })
              .catch(error => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
            }}>
            Approve Tokens
          </button>
        </div>
      </Scaler>
    );
  }
}

export default SubscriberApprove;