# Minsta Proxy Minter NEAR Contract

This smart contract on the NEAR network is designed to handle minting functionality through proxy minters. It provides a way to mint Non-Fungible Tokens (NFTs) through specified minters while keeping track of the latest minter for each NFT contract.

## Contract Structure

### MinstaProxyMinter

- `latest_minters`: Lookup map that keeps track of the latest minter for each NFT contract ID.
- `mint`: A method that takes metadata and NFT contract ID to mint NFTs, payable and callable.
- `cb_mint`: A private callback method for handling successful minting.
- `get_latest_minter`: A view method to get the latest minter for a given NFT contract ID.

# Quickstart

1. Make sure you Rust installed.
2. Install the [`NEAR CLI`](https://github.com/near/near-cli#setup)

<br />

## 1. Build and Deploy the Contract
Compile and deploy the contract in the NEAR testnet by running:

```bash
sh ./scripts/build

# cargo build --target wasm32-unknown-unknown --release
```

Check the `neardev/dev-account` file to find the address in which the contract was deployed:

```bash
cat ./neardev/dev-account
# e.g. dev-1659899566943-21539992274727
```

<br />

## 2. Minting an NFT
To mint an NFT, you will need to call the `mint` method. Make sure to specify the metadata and NFT contract ID:

```bash
# Use near-cli to mint an NFT
near call <dev-account> mint '{"metadata":"<metadata>","nft_contract_id":"<nft_contract_id>"}' --accountId <dev-account> --amount <amount>
```

<br />

## 3. Retrieve the Latest Minter
You can get the latest minter for a given NFT contract ID:

```bash
# Use near-cli to get the latest minter
near view <dev-account> get_latest_minter '{"nft_contract_id":"<nft_contract_id>"}'
```

<br />

## Note
Please replace `<dev-account>`, `<metadata>`, `<nft_contract_id>`, and `<amount>` with appropriate values as needed.

Ensure that the account calling the `mint` method has the necessary funds to cover the associated costs, as this is a payable function.

---