const {Web3} = require('web3');
const fs = require('fs');
const {
    numberOfWallet, 
    amountAPE,
    rpc_node,
    tokenAddress,
    erc20ABI
} = require("./config/config")


const web3 = new Web3(rpc_node);
const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);

async function main() {
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
        await getBalances(recipients)
    }
    catch (error) {
        console.error(`Error getting balance ${error}`);
    }

    console.log(`\n....Program completed....`);
}

const getBalances = async(recipients) => {
    const balancesData = [];
    for(let i=0; i<recipients.length; i++) {
        try {
            const balanceWeiAPE = await web3.eth.getBalance(recipients[i]);
            const balanceAPE = web3.utils.fromWei(balanceWeiAPE, 'ether');
            console.log(`Balance account${i}  ${recipients[i]} is ${balanceAPE} APE`);

            const balanceWeiToken = await tokenContract.methods.balanceOf(recipients[i]).call()
            const balanceToken = web3.utils.fromWei(balanceWeiToken, 'ether');
            console.log(`Balance account${i}  ${recipients[i]} is ${balanceToken} TOKENS`);

            balancesData.push({
                address: recipients[i],
                balance_APE: `${balanceAPE} APE`,
                balance_TOKEN: `${balanceToken} TOKEN`
            });
        }
        catch (error) {
            console.error(`getBalance: coudn't get balance of account${i} ${recipients[i]}, ${error}`);
        }
    }

    fs.writeFile('newBalances.json', JSON.stringify(balancesData, null, 2), (err) => {
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