const { Web3 }    = require('web3')
const { network } = require('hardhat')

async function main() {
  const web3     = new Web3(network.provider)
  const accounts = await web3.eth.getAccounts()

  for (let i = 0; i < accounts.length; i++) {
    const balance = await web3.eth.getBalance(accounts[i])
    console.log(`Account ${String(i + 1).padStart(2, ' ')}: ${accounts[i]} (Balance: ${web3.utils.fromWei(balance, 'ether')} ETH)`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
