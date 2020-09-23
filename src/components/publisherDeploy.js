import React, { Component } from 'react';
import Scaler from '../dapparatus/scaler'
import Loader from '../loader.gif';
import Particles from './particles.js';
import Backarrow from '../back-arrow.png'
var QRCode = require('qrcode.react');


class PublisherDeploy extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {


    let {deployedAddress} = this.props

    let contractAddress = deployedAddress


    let url = window.location.origin+"/subscription-token/"+contractAddress

    let deployed = ""
    if(deployedAddress){
      contractAddress=deployedAddress
      url = window.location.origin+"/subscription-token/"+contractAddress
      return (
        <Scaler config={{startZoomAt:800,origin:"50px 50px"}}>
          <Particles left={-1800} opacity={0.45} />
          <h1 style={{marginTop: '30px'}}>Congratulations, your contract is ready.</h1>
          <h3>You can now accept subscriptions!</h3>
          <p style={{textAlign: 'center'}}>{contractAddress} {deployed}</p>
          <p>Follow the instructions below to share your subscription</p>
          <div>
            <p>Add a link to your website:</p>
            <pre>{"<a href='"+url+"' target='_blank'>Subscribe Now</a>"}</pre>
            <p>Share Url:</p>
            <pre>{url}</pre>
            <p>QR Code:</p>
            <QRCode value={url} />
            <p>Embed a script on your website:</p>
            <pre>{"<script type='text/javascript' src='https://tokensubscription.com/coinsubscription.js?contract="+contractAddress+"' id='coinsubscription'></script>"}</pre>
          </div>
        </Scaler>
      );
    }
  }
}

export default PublisherDeploy;