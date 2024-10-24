const {Web3} = require('web3');
const fs = require('fs');
const {
    numberOfWallet, 
    amountAPE,
    rpc_node,
} = require("./config/config")

const web3 = new Web3(rpc_node);

async function main() {
    const privateKey = process.env.PRIMARY_PRIVATE_KEY
    const wallet = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(privateKey);
    const walletAddress = wallet.address

    await generateWallet(numberOfWallet)
    
    let recipients = []
    let recipientWallets;
    try {
        const fileContent = fs.readFileSync("./wallets.json", 'utf8');
        recipientWallets = JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading wallets.json:', error);
        process.exit(1);  // Exit if there's an error
    }

    recipientWallets.forEach((wallet) => {
        try {
            recipients.push(wallet.address)
        } catch (error) {
            console.error(`Error adding wallet ${wallet.address}: ${error.message}`);
        }
    });

    try {
        const balance = await web3.eth.getBalance(walletAddress);
        console.log(`Balance of primary wallet ${walletAddress} is ${web3.utils.fromWei(balance, 'ether')} APE`);
    
        const estimateGas = await web3.eth.estimateGas({
            from: walletAddress,
            to: recipients[0],
            value: web3.utils.toWei(amountAPE, 'ether'),
            gas: 3000000
        })
        .then(function(gasAmount) {
            return gasAmount+BigInt(20000);
        });
        console.log(`Estimate gas for transferring APE: ${estimateGas}`);

        for(let i=0; i<recipients.length; i++) {
            const nonce = await web3.eth.getTransactionCount(walletAddress, 'pending');
            console.log(`Pending nonce ${nonce}`);

            // const estimateGas = await web3.eth.estimateGas({
            //     from: walletAddress,
            //     to: recipients[0],
            //     value: web3.utils.toWei(amountAPE, 'ether'),
            //     gas: 300000
            // })
            // .then(function(gasAmount) {
            //     return gasAmount+BigInt(30000);
            // });
            // console.log(`Estimate gas for transferring APE: ${estimateGas}`);

            const receipt = await web3.eth.sendTransaction({
                from: walletAddress,
                to: recipients[i],
                value: web3.utils.toWei(amountAPE, 'ether'),
                gas: estimateGas,
                nonce: nonce
            });
        
            console.log(`${amountAPE} APE sent to account${i} ${recipients[i]}\nTransaction Hash ${receipt.transactionHash}\n`);
        }
        await getBalances(recipients)
    }
    catch (error) {
        console.error(`Error transaction ${error}`);
    }

    console.log(`\n....Program completed....`);

}
const generateWallet = async(walletCount) => {
    try {
        let wallets = [];
        for (let i = 0; i < walletCount; i++) {
            let wallet = web3.eth.accounts.create();
            
            wallets.push({
                address: wallet.address,
                privateKey: wallet.privateKey
            });
        }

        fs.writeFileSync('wallets.json', JSON.stringify(wallets, null, 2));
        console.log('Wallets created and saved to wallets.json');
    }
    catch (error) {
        console.error(`generateWallet ${error}`);
    }
    console.log(`${walletCount} wallets generated successfully`);
    
}

const getBalances = async(recipients) => {
    const balancesData = [];
    for(let i=0; i<recipients.length; i++) {
        try {
            const balance = await web3.eth.getBalance(recipients[i]);
            const balanceInEth = web3.utils.fromWei(balance, 'ether');
            console.log(`Balance account${i}  ${recipients[i]} is ${web3.utils.fromWei(balance, 'ether')} APE`);

            balancesData.push({
                address: recipients[i],
                balance: `${balanceInEth} APE`
            });
        }
        catch (error) {
            console.error(`getBalance: coudn't get balance of ${recipients[i]}, ${error}`);
        }
    }

    fs.writeFile('balances.json', JSON.stringify(balancesData, null, 2), (err) => {
        if (err) {
            console.error('Error saving balances to file:', err);
        } else {
            console.log('Balances saved to balances.json');
        }
    });
}

require("dotenv").config();

main()
    .catch(error => {
        console.error(error)
        process.exit(1);
    });

