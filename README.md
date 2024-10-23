# APECoin Transfer and Wallet Balance Manager

This project is a Node.js script that automates the creation of multiple Ethereum wallets, transfers a specified amount of the native token (ETH) or APECoin to those wallets, estimates the gas required for the transaction, and saves the balances of the recipient wallets into a JSON file.

## Features

- **Wallet Generation**: Automatically generates a specified number of Ethereum wallets and saves them in `wallets.json`.
- **Balance Retrieval**: Retrieves the balances of both the primary wallet and recipient wallets.
- **Gas Estimation**: Estimates gas required to send a specified amount of ETH or APECoin to multiple wallets.
- **Transaction Execution**: Transfers the specified amount of ETH or APECoin from the primary wallet to the recipient wallets.
- **Save Results**: Saves the recipient wallet addresses and their ETH balances into `balances.json`.

## Prerequisites

- Node.js installed

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ape-coin-transfer.git
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Rename the file `.env.example` to `.env` in the root of the project and set your private key to the variable `PRIMARY_PRIVATE_KEY`:
   ```
   PRIMARY_PRIVATE_KEY=your_private_key_here
   ```

4. Update `config/config.js` with the following:
   - `numberOfWallet`: Number of recipient wallets to generate.
   - `amountAPE`: Amount of ETH or APECoin to send

## Usage

1. **Run the script**:
   ```bash
   npm start
   ```

   The script will:
   - Generate wallets and save them to `wallets.json`.
   - Estimate gas for sending ETH/APE to the recipient wallets.
   - Execute the transfer.
   - Save the final balances of all recipient wallets in `balances.json`.

2. **Expected output**:
   - Console logs will display the balance of the primary wallet and the recipient wallets.
   - After the transfer, the transaction hash and updated balances will be shown.
   - Wallet balances will be saved in `balances.json`.

## Files

- **`index.js`**: Main script for transferring ETH/APE and generating wallets.
- **`config/config.js`**: Configuration file to define key parameters like the number of wallets, the amount of APE to distrubute, and the RPC node URL.
- **`wallets.json`**: Contains generated wallet addresses and private keys.
- **`balances.json`**: Stores the balances of recipient wallets after the transfer.

## Example Output

After running the script, the console output will show something like this:

```bash
Balance of primary wallet 0xYourPrimaryWalletAddress is 10.123 ETH
Estimate gas for transferring APE: 50000
Pending nonce 0
2 APEs sent to account0 0xRecipientWalletAddress1
Transaction Hash 0xTransactionHash1

2 APEs sent to account1 0xRecipientWalletAddress2
Transaction Hash 0xTransactionHash2

...Program completed...
Balances saved to balances.json
```

## Error Handling

If there's an error while reading files (e.g., `wallets.json`) or during the transaction process, it will be logged to the console, and the script will exit.