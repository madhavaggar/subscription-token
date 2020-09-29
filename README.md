# Subscription Based Token

A Subscription-Based Token Model for the Tezos India Fellowship

## Dependencies

- Unix/Linux
- Nodejs == 12.8
- Python 3

## Steps to build

1. `yarn install` (Installs all dependencies for contracts as well as Reactjs)
2. `npm run test-contracts`
3. `npm run deploy` (Deploys contracts as per `utils/scripts/main.js` and `contractsConfig.json`)
4.  Install Redis and run a server on port `57300`.
5.  On a seperate terminal run `node ./backend/tokensubminer.js`
6. `npm run start` (Starts Reactjs website on port 3000)



## Code Structure


- Contracts Directory: `contracts/src/main.py`
- SmartPy CLI: `utils/smartpy-cli`
- Account Credentials Directory: `utils/keystore/`
- Reactjs Directory: `src/index.js`
- Compile, deploy and test scripts: `utils/scripts/`

## Contributors

- Madhav Aggarwal
