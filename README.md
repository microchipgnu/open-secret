# Open Secret

<img width="946" alt="image" src="https://github.com/microchipgnu/open-secret/assets/12901349/0d5c50d6-0269-49f2-b793-405c66c06ced">


[YouTube Demo](https://www.youtube.com/watch?v=VawBqiXaiAg)

Open Secret allows you to chat with NEAR Social accounts. We allow users to mint dynamic NFTs that control that reference on-chain private metadata. By owning an NFT, you are able to attach encrypted pieces of data and then give access to other accounts to decrypt this data.

## NEAR Protocol: Handling Private Data 

### Storing Private Data in Tokens

To mint a token that contains encrypted private data, the following steps are proposed:

1. **Encryption**: Used a library such as [NEAR JavaScript Encryption Box](https://github.com/NEARFoundation/near-js-encryption-box/tree/main) to encrypt the data before minting the token.

2. **Key Management**: Implemented smart contract functionality to manage encryption keys.

   - The contract allows adding or removing keys associated with the current owner of the token, enabling them to encrypt and decrypt the data.

As a bonus we thought of adding ability for tokens to carry proof elements (using ZK), such as links to data stored on Arweave, to ensure data integrity and authenticity.

## Giving access to Private Data

### Minting and Storing Private Data Process

The following process allows for the secure minting and transferring of private data through NFTs:

1. **Minter's Actions**:

   - The **Minter** (M) encrypts the data using their keypair (KP1) and includes a reference to this encrypted data (ED1) within the NFT, possibly pointing to an Arweave storage location.
   - When giving access to specific private data bits, they owner needs to decrypt and encrypt again with the viewer's public key.
   - Optionally, the minter may include Zero-Knowledge proofs (e.g., ZK-SNARKs) to validate certain claims about the data, like confirming it matches an Arweave hash pattern through regex verification or that the content was not changed (sha-256).
