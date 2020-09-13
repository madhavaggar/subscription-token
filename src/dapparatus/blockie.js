import React, { Component } from 'react';
import deepmerge from 'deepmerge';
import Blockies from 'react-blockies';
let defaultConfig = {}
defaultConfig.DEBUG = false;
defaultConfig.size = 2

class Blockie extends Component {
  constructor(props) {
    super(props);
    let config = defaultConfig
    if(props.config) {
      config = deepmerge(config, props.config)
    }
    this.state = {
      config:config
    }
  }
  render() {

    let address = this.props.address
    if(address && typeof address == "string"){
      address = address.toLowerCase()
    }else{
      address = null
    }

    return (
      <Blockies
        seed={address}
        scale={this.state.config.size}
      />
    )
  }
}

export default Blockie;