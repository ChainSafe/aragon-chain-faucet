const node0 = {
	laddr: "http://54.210.246.165:8545",
	key: "node0"
}

const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(node0.laddr));
var exec = require('child_process').exec, child;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCurrentAccount() {
  const currentAccounts = await web3.eth.getAccounts();
  return currentAccounts[0];
}

async function requestFromFaucet() {
	let cmd = exec(`aragonchaincli tx faucet request 100000000000000ara --from ${node0.key} --chain-id aragonchain-2 --fees 2ara --yes`,
		function (error, stdout, stderr) {
	        console.log('stdout: ' + stdout);
	        console.log('stderr: ' + stderr);
	        if (error !== null) {
	             console.log('exec error: ' + error);
	             exit(1)
	        }
	    })
}

async function handleRequest(to, amount) {
	let from = await getCurrentAccount();
	let balance = await web3.eth.getBalance(from);
	console.log("balance: ", balance)
	if (parseInt(balance) <= amount) {
		console.log(`balance ${balance} less than requested amount ${amount}, making faucet request`)
		await requestFromFaucet()
	}
	while (balance < amount) {
		balance = await web3.eth.getBalance(from)
		sleep(100)
	}

	console.log("making transfer")

	let receipt = await web3.eth.sendTransaction({to: to, from: from, value: amount, gasPrice: 1, gasLimit: 22000})
	console.log("sent transfer!", receipt)
}

handleRequest("0x786b82b6454c6e1a085f3ca31ff9f82d5469bfcc", 10000000000000)