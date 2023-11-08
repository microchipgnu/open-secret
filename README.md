# Open Secret

Open Secret is a marketplace for NFT's with encrypted content.

# NEAR Protocol: Handling Private Data & Marketplace Implementation

This document outlines the approach for storing private data in tokens on the NEAR Protocol and establishing a marketplace for this private data.

## Storing Private Data in Tokens

To mint a token that contains encrypted private data, the following steps are proposed:

1. **Encryption**: Utilize a library such as [NEAR JavaScript Encryption Box](https://github.com/NEARFoundation/near-js-encryption-box/tree/main) to encrypt the data before minting the token.

   - The minter must encrypt the data using a keypair that the smart contract can also access.

2. **Key Management**: Implement smart contract functionality to manage encryption keys.

   - The contract should allow adding or removing keys associated with the current owner, enabling them to encrypt and decrypt the data.

Tokens will carry proof elements, such as links to data stored on Arweave, to ensure data integrity and authenticity.

## Marketplace for Private Data

### Minting and Storing Private Data Process

The following process allows for the secure minting and transferring of private data through NFTs:

1. **Minter's Actions**:

   - The **Minter** (M) encrypts the data using their keypair (KP1) and includes a reference to this encrypted data (ED1) within the NFT, possibly pointing to an Arweave storage location.
   - Optionally, the minter may include Zero-Knowledge proofs (e.g., ZK-SNARKs) to validate certain claims about the data, like confirming it matches an Arweave hash pattern through regex verification or that the content was not changed (sha-256).

2. **Purchase Request**:

   - A **Buyer** (B) expresses interest in accessing the data by requesting to purchase the token. The buyer includes the public key they intend to use for decrypting the data with their purchase request and pays the specified amount.

3. **Minter's Transfer Actions**:
   - **Off-Chain**: The minter encrypts the data with the buyer's public key, ensuring the buyer can decrypt it upon ownership transfer.
   - **On-Chain**: The minter executes a transaction to approve the transfer of the token on the marketplace (using `nft_approve`) and updates the token's metadata to include a new reference to the buyer-specific encrypted data (ED2).

**Note**: It's critical to ensure that all encryption and decryption operations adhere to security best practices and regulatory compliance, as handling private data carries inherent risks and responsibilities.
