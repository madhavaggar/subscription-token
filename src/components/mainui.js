import React, { Component } from 'react';
import Scaler from '../dapparatus/scaler'
import Particles from './particles.js';
import Logo from '../logo-icon.png';


class MainUI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contractLink: "KT1FKDqbqQ6E25ze5XXTbRSzMKhu11neuR7y"
    };
  }
  render() {
    return (
        <Scaler config={{startZoomAt:800,origin:"50px 50px"}}>
          <div key="mainUI" className="center">
            <Particles />

            <div style={{marginTop:100}}>
            <img src={Logo} />
            </div>

            <h1 style={{margin: '30px 0 0 0'}}><i>Token Subscriptions</i></h1>
            <h3 style={{margin: '0 0 45px 0'}}>
              <div>Recurring subscriptions on the Tezos blockchain</div>
              <div style={{opacity:0.75}}><i>set it and forget it token transfers</i></div>
            </h3>

            <button size="2" onClick={this.props.buttonPress}>
              Start Accepting Token Subscriptions</button>

              <div style={{marginTop:200,opacity:0.7,fontSize:15}}>
              <div>Disclaimer: <span style={{color:"#FFFFFF"}}>We built this in a weekend!</span></div>
              <div>You should inspect <a style={{color:"#dddddd"}} href={"https://carthagenet.tzstats.com/"+this.state.contractLink}>our smart contract</a> before using.</div>
              <div>100% free and open source! Please <a style={{color:"#dddddd"}} href="https://github.com/madhavaggar/subscription-token">contribute</a>!</div>
              </div>
          </div>
        </Scaler>
    );
  }
}

export default MainUI;