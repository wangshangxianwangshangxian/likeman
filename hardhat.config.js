require('@nomiclabs/hardhat-web3');

module.exports = {
  solidity: '0.8.0',
  networks: {
    hardhat: {
      forking: {
        url: 'https://eth.llamarpc.com'
      }
    }
  }
};