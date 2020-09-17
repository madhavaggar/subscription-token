import React, { Component } from 'react';
import Address from "../dapparatus/address"
import Blockie from '../dapparatus/blockie'
import Scaler from '../dapparatus/scaler'
import axios from 'axios'
import Loader from '../loader.gif';
import Particles from './particles.js';
import { Dropdown } from 'semantic-ui-react'
import { TezBridgeSigner } from "@taquito/tezbridge-signer";


let monthOptions = [
  { key: 'months', value: 'months', text: 'Month(s)' },
  { key: 'days', value: 'days', text: 'Day(s)' },
  { key: 'hours', value: 'hours', text: 'Hour(s)' },
  { key: 'minutes', value: 'minutes', text: 'Minutes(s)' },
]

class Subscriber extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toAddress: "",

      prefilledParams: false,
      tokenAmount: 1000,
      timeAmount: 1,
      timeType: "months",
      tokenAddress: "KT1Xu7Vp9aXyjHE25KDLbbhZFPiGcB2YjY2a",
      gasPrice: 25,
      tokenName: "DAI",
    };
  }
  handleInput(e, data) {
    let update = {}
    if (data) {
      update[data.name] = data.value
      if (data.name == "tokenAddress" && !data.value) {
        update.tokenAmount = ""
        update.gasPrice = ""
        update.timeAmount = ""
      } else {
        if (this.state.tokenAmount == "") {
          update.tokenAmount = 1000
        }
        if (this.state.gasPrice == "") {
          update.gasPrice = 25
        }
        if (this.state.timeAmount == "") {
          update.timeAmount = 1
        }
      }
    } else {
      update[e.target.name] = e.target.value
    }
    //  console.log("==== UPDATE",update)
    this.setState(update, () => {
      this.updateUrl()
    })
  }
  updateUrl() {
    let url = window.location.origin + window.location.pathname +
      "?timeAmount=" + this.state.timeAmount +
      "&timeType=" + this.state.timeType
    if (this.state.toAddress) url += "&toAddress=" + this.state.toAddress
    if (this.state.tokenAddress) url += "&tokenAddress=" + this.state.tokenAddress
    if (this.state.tokenAmount) url += "&tokenAmount=" + this.state.tokenAmount
    if (this.state.gasPrice) url += "&gasPrice=" + this.state.gasPrice

    this.setState({ url: url })
  }
  async sendSubscription() {
    let { backendUrl, Tezos, account, contract } = this.props
    let { toAddress, timeType, tokenAmount, tokenAddress, gasPrice } = this.state

    console.log("The CONTRACT", this.props.contract)

    let subscriptionContract = await this.props.customContractLoader("Subscription", this.props.contract)

    let value = 0
    let gasLimit = 120000

    let periodSeconds = this.state.timeAmount;
    if (timeType == "minutes") {
      periodSeconds *= 60
    } else if (timeType == "hours") {
      periodSeconds *= 3600
    } else if (timeType == "days") {
      periodSeconds *= 86400
    } else if (timeType == "months") {
      periodSeconds *= 2592000
    }

    if (!gasPrice) gasPrice = 0

    console.log("Address", subscriptionContract._address)

    let storage = await subscriptionContract._contract.storage()
    console.log("STORAGE-NONCE", storage['extraNonce'])
    console.log("Account", account)
    let value1 = await storage['extraNonce'].get(account)
    let nonce
    if (value1 == undefined) {
      nonce = 1
    }
    else {
      nonce = parseInt(value1[Object.keys(value1)[0]]) + 1
    }

    //TODO convert here
    let realTokenAmount = tokenAmount
    let realGasPrice = gasPrice
    /*
    address from, //the subscriber
    address to, //the publisher
    address tokenAddress, //the token address paid to the publisher
    uint256 tokenAmount, //the token amount paid to the publisher
    uint256 periodSeconds, //the period in seconds between payments
    uint256 gasPrice, //the amount of tokens or eth to pay relayer (0 for free)
     */

    const parts = [
      account,
      toAddress,
      tokenAddress,
      realTokenAmount,
      periodSeconds,
      realGasPrice,
      nonce
    ]
    /*web3.utils.padLeft("0x"+nonce,64),*/
    console.log("PARTS", parts)
    try {

      const data = {
        prim: "Left",
        args: [
          {
            prim: "Right",
            args: [
              {
                prim: "Left",
                args: [
                  {
                    prim: "Pair",
                    args: [
                      { "string": account },
                      {
                        prim: "Pair",
                        args: [
                          { "string": toAddress },
                          {
                            prim: "Pair",
                            args: [
                              { "string": tokenAddress },
                              {
                                prim: "Pair",
                                args: [
                                  { "int": realTokenAmount.toString() },
                                  {
                                    prim: "Pair",
                                    args: [
                                      { "int": periodSeconds.toString() },
                                      {
                                        prim: "Pair",
                                        args: [{ "int": realGasPrice.toString() }, { "int": nonce.toString() }],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };



      const type =
      {
        prim: "or",
        args: [
          {
            prim: "or",
            args: [
              { prim: "nat" },
              {
                prim: "or",
                args: [
                  {
                    prim: "pair",
                    args: [
                      { prim: "address" },
                      {
                        prim: "pair",
                        args: [
                          { prim: "address" },
                          {
                            prim: "pair",
                            args: [
                              { prim: "address" },
                              {
                                prim: "pair",
                                args: [
                                  { prim: "nat" },
                                  {
                                    prim: "pair",
                                    args: [
                                      { prim: "nat" },
                                      {
                                        prim: "pair",
                                        args: [{ prim: "nat" }, { prim: "nat" }],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  { prim: "nat" }
                ],
              }
            ],
          },
          { prim: "nat" }
        ],
      };

      /*
           const data = 
               {
                 prim: "Pair",
                 args: [
                   { string: account },
                   {
                     prim: "Pair",
                     args: [
                       { string: toAddress },
                       {
                         prim: "Pair",
                         args: [
                           { string: tokenAddress },
                           {
                             prim: "Pair",
                             args: [
                               { int: realTokenAmount.toString() },
                               {
                                 prim: "Pair",
                                 args: [
                                   { int: periodSeconds.toString() },
                                   {
                                     prim: "Pair",
                                     args: [{ int: realGasPrice.toString() }, { int: nonce.toString() }],
                                   },
                                 ],
                               },
                             ],
                           },
                         ],
                       },
                     ],
                   },
                 ],
               };
     
           const type = 
               {
                 prim: "pair",
                 args: [
                   { prim: "string" },
                   {
                     prim: "pair",
                     args: [
                       { prim: "string" },
                       {
                         prim: "pair",
                         args: [
                           { prim: "string" },
                           {
                             prim: "pair",
                             args: [
                               { prim: "int" },
                               {
                                 prim: "pair",
                                 args: [
                                   { prim: "int" },
                                   {
                                     prim: "pair",
                                     args: [{ prim: "int" }, { prim: "int" }],
                                   },
                                 ],
                               },
                             ],
                           },
                         ],
                       },
                     ],
                   },
                 ],
               };
     
               */

      const { packed } = await Tezos.rpc.packData({
        data: data,
        type: type,
      })
      console.log("Packed", packed)


      /*const packedData = await axios.post(
        `https://carthagenet.SmartPy.io/chains/main/blocks/head/helpers/scripts/pack_data`,
        {
          data: data,
          type: type,
          gas: "800000",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const subscriptionHash = packedData.data.packed;
      */


      var subscriptionHash = packed
      console.log("subscriptionHash",subscriptionHash)

      var signer = new TezBridgeSigner();
      const _address = await window.tezbridge.request({ method: "get_source" });

      let signature
      if(account == _address){
        signature = await signer.sign(subscriptionHash)
        console.log("signature",signature.prefixSig)
      }
      else{
        throw "Accounts don't Match"
      }

      console.log("subscriptionHash", subscriptionHash)

      let postData = {
        subscriptionContract: subscriptionContract._address,
        parts: parts,
        subscriptionHash: subscriptionHash,
        signature: signature.prefixSig,
      }

      console.log("postData", postData)
      axios.post(backendUrl + 'saveSubscription', postData, {
        headers: {
          'Content-Type': 'application/json',
        }
      }).then((response) => {
        console.log("TX RESULT", response.data.subscriptionHash)
        window.location = "/HASH" + response.data.subscriptionHash
      })
        .catch((error) => {
          console.log(error);
        });
    }
    catch (e) {
      console.log(e);
    }


  }

  async componentDidMount() {
    let { contracts } = this.props
    console.log("contracts", contracts)
    this.setState({
      isLoaded: true,
      items: [{
        address: this.props.contracts.WasteToken._address,
        name: "WasteCoin",
        symbol: "WC"
      }]
    })
    if (this.props.contract) {
      console.log("poll contract for values...")
      let subscriptionsContract = await this.props.customContractLoader("Subscription", this.props.contract)
      let value = await subscriptionsContract._contract.storage()
      console.log("subscriptionsContract", subscriptionsContract)
      let requiredToAddress = await value['reqToAddress']
      let requiredTokenAddress = await value['reqTokenAddress']

      let requiredTokenName

      if (requiredTokenAddress) {
        console.log("using", requiredTokenAddress, "search through", this.props.coins)
        for (let c in this.props.coins) {
          console.log("CHECKING", this.props.coins[c])
          if (this.props.coins[c] && this.props.coins[c].address && this.props.coins[c].address == requiredTokenAddress) {
            console.log("FOUND!!!!!!!!")
            requiredTokenName = this.props.coins[c].name
          }
        }
        let requiredTokenAmount = await value['reqTokenAmount']
        console.log("requiredTokenAmount", requiredTokenAmount)
        let requiredPeriodSeconds = await value['reqPeriodSeconds']
        let requiredTimeAmount = null
        let requiredTimeType = ""
        if (requiredPeriodSeconds) {
          if (requiredPeriodSeconds >= 2592000) {
            requiredTimeAmount = requiredPeriodSeconds / 2592000
            requiredTimeType = "months"
          } else if (requiredPeriodSeconds >= 86400) {
            requiredTimeAmount = requiredPeriodSeconds / 86400
            requiredTimeType = "days"
          } else if (requiredPeriodSeconds >= 3600) {
            requiredTimeAmount = requiredPeriodSeconds / 3600
            requiredTimeType = "hours"
          } else {
            requiredTimeAmount = requiredPeriodSeconds / 60
            requiredTimeType = "minutes"
          }
        }
        let requiredGasPrice = await value['reqGasPrice']
        console.log("requiredTokenAmount", requiredTokenAmount)
        console.log(requiredGasPrice);
        this.setState({
          requiredTokenAddress: requiredTokenAddress,
          prefilledParams: true,
          toAddress: requiredToAddress,
          tokenAddress: requiredTokenAddress,
          tokenAmount: requiredTokenAmount,
          tokenName: requiredTokenName,
          timeAmount: requiredTimeAmount,
          timeType: requiredTimeType,
          gasPrice: requiredGasPrice,
        })
      } else {

        console.log("=====---- This is an open ended subscription without parameters...")
        //this is an open ended model, set some defaults....
        this.setState({
          requiredTokenAddress: requiredTokenAddress,
          toAddress: requiredToAddress,
          prefilledParams: true,
          tokenAmount: 1000,
          timeAmount: 1,
          timeType: "months",
          tokenAddress: "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
          gasPrice: 25
        }, () => {
          console.log(this.state)
        })
      }
    }
  }

  render() {
    let { contract, coins } = this.props
    let { items, toAddress, tokenAmount, tokenAddress, timeType, timeAmount, gasPrice, prefilledParams, email, requiredTokenAddress } = this.state
    console.log("timeType:", timeType)
    let coinOptions = []
    for (let i in items) {
      //console.log(items[i].name)
      coinOptions.push(
        <option key={items[i].name} value={items[i].name}>{items[i].name}</option>
      )
    }
    if (contract) {
      if (!prefilledParams && requiredTokenAddress) {
        return (
          <div className="center"><img src={Loader} style={{ marginTop: 100 }} /></div>
        );
      } else {

        if (!requiredTokenAddress) {

          let coinOptions = []

          for (let i = 0; i < coins.length; i++) {
            if (coins[i].symbol != "*ANY*") {
              coinOptions.push({
                key: coins[i].address,
                value: coins[i].address,
                image: {
                  avatar: true,
                  src: coins[i].imageUrl,
                },
                text: coins[i].symbol
              })
            }
          }

          return (
            <Scaler config={{ startZoomAt: 800, origin: "50px 50px" }}>
              <Particles left={-2200} opacity={0.45} />
              <div className="form-field">
                <label>To Address:</label>
                <Blockie
                  address={toAddress}
                  config={{ size: 3 }}
                />
                <input type="text" style={{ width: '415px' }} name="toAddress" value={toAddress} onChange={this.handleInput.bind(this)} />
              </div>
              <div className="form-field">
                <label>Token:</label>
                <Dropdown
                  selectOnNavigation={false}
                  selection
                  value={tokenAddress}
                  name='tokenAddress'
                  options={coinOptions}
                  placeholder='Choose Token'
                  onChange={this.handleInput.bind(this)}
                />

                <label>Amount:</label>
                <input type="text" name="tokenAmount" value={tokenAmount} onChange={this.handleInput.bind(this)} />
              </div>
              <div className="form-field">
                <label>Recurring Every:</label>
                <input type="text" name="timeAmount" value={timeAmount} onChange={this.handleInput.bind(this)} />
                <Dropdown
                  selectOnNavigation={false}
                  selection
                  value={timeType}
                  name="timeType"
                  onChange={this.handleInput.bind(this)}
                  options={monthOptions}
                  placeholder='Choose Term'
                />
              </div>
              <div className="form-field">
                <label>Gas Price:</label>
                <input
                  type="text" name="gasPrice" value={gasPrice} onChange={this.handleInput.bind(this)}
                />
              </div>
              <div className="form-field">
                <label>Email (optional):</label>
                <input
                  type="text" name="email" style={{ width: 240 }} value={email} onChange={this.handleInput.bind(this)}
                />
              </div>
              <button size="2" style={{ marginTop: 50 }} onClick={() => {
                this.sendSubscription()
              }}>
                Sign
              </button>
            </Scaler>
          );
        } else {

          if (timeAmount == 1) {
            timeType = timeType.substring(0, timeType.length - 1)
          }

          return (
            <Scaler config={{ startZoomAt: 800, origin: "50px 50px" }}>
              <Particles left={-2200} opacity={0.45} />
              <div style={{ marginTop: 110 }} className="form-field">
                <label>To Address:</label>
                <Blockie
                  address={toAddress}
                  config={{ size: 3 }}
                /> {toAddress}
              </div>
              <div className="form-field">
                <label>Token:</label> {tokenAddress}
              </div>
              <div>
                <label>Amount:</label> {parseFloat(tokenAmount) + parseFloat(gasPrice)}
              </div>
              <div className="form-field">
                Recurring Every: {timeAmount} {timeType}
              </div>
              <button size="2" style={{ marginTop: 50 }} onClick={() => {
                this.sendSubscription()
              }}>
                Sign
              </button>
            </Scaler>
          );
        }

      }
    } else {
      return (
        <div>
          <div className="center"><img src={Loader} style={{ marginTop: 100 }} /></div>
          <div className="center">Loading Contract...</div>
        </div>
      );
    }

  }
}

export default Subscriber;