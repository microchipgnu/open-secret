const appName: string = process.env.NEXT_PUBLIC_APP_TITLE || "MINTBASE";
const network = process.env.NEXT_PUBLIC_NETWORK || "mainnet";
const proxyContractAddress =
    process.env.NEXT_PUBLIC_PROXY_MINTER_CONTRACT_ADDRESS ||
    "1.minsta.mintbus.near";
const tokenContractAddress =
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "open-secret.mintspace2.testnet";

const mintbaseBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://mintbase.xyz";

const mintbaseWalletUrl =
    process.env.NEXT_PUBLIC_MINTBASE_WALLET_URL ||
    "https://wallet.mintbase.xyz";

const twitterText =
    process.env.NEXT_PUBLIC_TWITTER ||
    "Instantly%20mint%20your%20AI%20%%20creations%20%at%20%%OpenSecret%20%40Mintbase%20%40NEARProtocol%20%23BOS%20%23NEAR%0aMint%20yours%20here%3A%20https%3A%2F%2Fminsta.mintbase.xyz";

export const constants = {
    appName,
    proxyContractAddress,
    tokenContractAddress,
    network,
    mintbaseBaseUrl,
    mintbaseWalletUrl,
    twitterText,
    isClosed: process.env.NEXT_PUBLIC_MINTING_CLOSED === "true" || false,
    showRewards: process.env.NEXT_PUBLIC_SHOW_REWARDS === "true" || false,
};
