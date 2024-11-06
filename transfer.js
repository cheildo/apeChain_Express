const {Web3} = require('web3');
const fs = require('fs');
const {
    amountToSpend,
    rpc_node,
    tokenAddress,
	erc20ABI,
} = require("./config/config")

const web3 = new Web3(rpc_node);
const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);

const receiver = "0x1603918A0aC6Cf0485d61bc52f85d7d55e4BA56f"

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
        await transferToken(accounts[i])
    }

    console.log(`\n....Program completed....`);
}

async function transferAPE(walletAddress) {
    try {
        const balanceAPE = await web3.eth.getBalance(walletAddress);
        console.log(`transferAPE: Balance APE is ${balanceAPE}`);

        const amount = BigInt(amountToSpend) * balanceAPE / 100n
        console.log(`transferAPE: Amount to transfer ${amount} APE`);

        const estimateGas = await web3.eth.estimateGas({
            from: walletAddress,
            to: receiver,
            value: amount,
            gas: 3000000
        })
        .then(function(gasAmount) {
            return gasAmount+BigInt(2000);
        });
        console.log(`transferAPE: Estimate gas ${estimateGas}`);

        const nonce= await web3.eth.getTransactionCount(walletAddress, 'pending');
        console.log(`transferAPE: Wallet nonce ${nonce}`);

        const receipt = await web3.eth.sendTransaction({
            from: walletAddress,
            to: receiver,
            value: amount,
            gas: estimateGas,
            nonce: nonce
        });
    
        console.log(`${receiver} sent ${web3.utils.fromWei(amount, 'ether')} APE to ${receiver}\nTransaction Hash ${receipt.transactionHash}\n`);


        const afterbalanceAPE = await web3.eth.getBalance(walletAddress);
        console.log(`transferAPE: After Balance APE ${afterbalanceAPE} `);

    } catch (error) {
        console.error(`transferAPE ${error}`);
    }
}

async function transferToken(walletAddress) {
    
    try {  
        const balanceToken = await tokenContract.methods.balanceOf(walletAddress).call()
        console.log(`transferToken: token balance is ${balanceToken}`)

        // const amountBuy = BigInt(amountToSpend) * balanceAPE / 100n
        // console.log(`Amount to spend for buying ${amountBuy} APE`);

        const estimateGas = await tokenContract.methods.transfer(receiver, balanceToken)
        .estimateGas({from: walletAddress, gas: 3000000})
        .then(function(gasAmount) {
            return gasAmount;
        })
        console.log(`transferToken: estimateGas ${estimateGas}`)

        const nonce= await web3.eth.getTransactionCount(walletAddress, 'pending');
        console.log(`transferToken: Wallet nonce ${nonce}`);

        const transferToken = await tokenContract.methods.transfer(receiver, balanceToken)
        .send({from: walletAddress, gas: estimateGas, nonce: nonce})
        .then(async (res) => {
            console.log(`transferToken: transactionHash ${res.transactionHash}`);
            return res.transactionHash
        })

        const afterBalanceToken = await tokenContract.methods.balanceOf(walletAddress).call()
        console.log(`transferToken: After transfer balance ${afterBalanceToken}\n`)

    } catch (error) {
        console.error(`transferToken ${error}`);
    }
}


require("dotenv").config();

main()
    .catch(error => {
        console.error(error)
        process.exit(1);
    });