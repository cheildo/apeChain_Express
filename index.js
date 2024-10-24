const {Web3} = require('web3');
const fs = require('fs');
const {
    numberOfWallet, 
    amountAPE,
    amountToBuy,
    rpc_node,
    tokenAddress,
    tokenSaleAddress,
    saleABI,
	erc20ABI,
} = require("./config/config")

const web3 = new Web3(rpc_node);
const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
const tokenSaleContract = new web3.eth.Contract(saleABI, tokenSaleAddress);

async function main() {
    let wallets;
    try {
        const fileContent = fs.readFileSync("./wallets.json", 'utf8');
        wallets = JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading wallets.json:', error);
        process.exit(1);
    }

    wallets.forEach((wallet) => {
        try {
            web3.eth.accounts.wallet.add(wallet.privateKey);
        } catch (error) {
            console.error(`Error adding wallet ${wallet.address}: ${error.message}`);
        }
    });
    
    const accounts = web3.eth.accounts.wallet.map((account) => account.address);

    for (let i=0; i<accounts.length; i++){
        console.info(`Processing Account${i} ${accounts[i]}`);
        await buyToken(accounts[i])
    }

    console.log(`\n....Program completed....`);
}

async function buyToken(walletAddress) {
    try {
        const amountBuy = web3.utils.toWei(amountToBuy, 'ether');
        //const valueETH = web3.utils.toWei("1", 'ether');
        
        const balanceAPE = await web3.eth.getBalance(walletAddress);
        console.log(`Balance APE is ${balanceAPE}`);

        const balanceDApe = await tokenContract.methods.balanceOf(walletAddress).call()
        console.log(`buyToken: token balance is ${balanceDApe}`)

        const estimateGas = await tokenSaleContract.methods.buy(amountBuy)
        .estimateGas({from: walletAddress, value: amountBuy, gas: 3000000})
        .then(function(gasAmount) {
            return gasAmount+BigInt(30000);
        })
        console.log(`buyToken: estimateGas is ${estimateGas}`)

        const nonce= await web3.eth.getTransactionCount(walletAddress, 'pending');
        console.log(`Wallet nonce ${nonce}`);

        const buyToken = await tokenSaleContract.methods.buy(amountBuy)
        .send({from: walletAddress, value: amountBuy, gas: estimateGas, nonce: nonce})
        .then(async (res) => {
            console.log(`buyToken: transactionHash ${res.transactionHash}`);
            return res.transactionHash
        })

        const afterbalanceAPE = await web3.eth.getBalance(walletAddress);
        console.log(`Balance APE ${afterbalanceAPE} `);

        const afterBalanceDApe = await tokenContract.methods.balanceOf(walletAddress).call()
        console.log(`buyToken: After buying, token balance of is ${afterBalanceDApe}\n`)
    } catch (error) {
        console.error(`Error buying token ${error}`);
    }
}

require("dotenv").config();

main()
    .catch(error => {
        console.error(error)
        process.exit(1);
    });