use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata,
    NonFungibleTokenMetadataProvider,
    NFT_METADATA_SPEC,
    TokenMetadata,
};
use near_sdk::PublicKey;
use near_sdk::collections::Vector;
use near_sdk::serde::{ Deserialize, Serialize };
use near_sdk::collections::LookupMap;
use near_contract_standards::non_fungible_token::{ Token, TokenId };
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_sdk::borsh::{ self, BorshDeserialize, BorshSerialize };
use near_sdk::collections::LazyOption;
use near_sdk::{
    env,
    near_bindgen,
    AccountId,
    BorshStorageKey,
    PanicOnDefault,
    Promise,
    PromiseOrValue,
};

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
    PartialEq,
    Eq,
    BorshDeserialize,
    BorshSerialize,
    Default
)]
pub struct OpenSecretMetadata {
    uri: String,
    hash256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, BorshDeserialize, BorshSerialize)]
pub struct EncryptedMetadata {
    public_key: PublicKey,
    metadata: OpenSecretMetadata,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    private_metadata: LookupMap<TokenId, Vector<EncryptedMetadata>>,
}

const DATA_IMAGE_SVG_NEAR_ICON: &str =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 288 288'%3E%3Cg id='l' data-name='l'%3E%3Cpath d='M187.58,79.81l-30.1,44.69a3.2,3.2,0,0,0,4.75,4.2L191.86,103a1.2,1.2,0,0,1,2,.91v80.46a1.2,1.2,0,0,1-2.12.77L102.18,77.93A15.35,15.35,0,0,0,90.47,72.5H87.34A15.34,15.34,0,0,0,72,87.84V201.16A15.34,15.34,0,0,0,87.34,216.5h0a15.35,15.35,0,0,0,13.08-7.31l30.1-44.69a3.2,3.2,0,0,0-4.75-4.2L96.14,186a1.2,1.2,0,0,1-2-.91V104.61a1.2,1.2,0,0,1,2.12-.77l89.55,107.23a15.35,15.35,0,0,0,11.71,5.43h3.13A15.34,15.34,0,0,0,216,201.16V87.84A15.34,15.34,0,0,0,200.66,72.5h0A15.35,15.35,0,0,0,187.58,79.81Z'/%3E%3C/g%3E%3C/svg%3E";

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
    PrivateMetadata,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new_default_meta(owner_id: AccountId) -> Self {
        Self::new(owner_id, NFTContractMetadata {
            spec: NFT_METADATA_SPEC.to_string(),
            name: "Open Secret".to_string(),
            symbol: "OS".to_string(),
            icon: Some(DATA_IMAGE_SVG_NEAR_ICON.to_string()),
            base_uri: None,
            reference: None,
            reference_hash: None,
        })
    }

    #[init]
    pub fn new(owner_id: AccountId, metadata: NFTContractMetadata) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        metadata.assert_valid();
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval)
            ),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            private_metadata: LookupMap::new(StorageKey::PrivateMetadata),
        }
    }

    #[payable]
    pub fn nft_mint(
        &mut self,
        token_id: TokenId,
        receiver_id: AccountId,
        token_metadata: TokenMetadata
    ) -> Token {
        self.tokens.internal_mint(token_id, receiver_id, Some(token_metadata))
    }

    pub fn add_metadata(&mut self, token_id: TokenId, metadata: EncryptedMetadata) {
        // Get the Token data which includes the owner's account ID
        let token = self.tokens.nft_token(token_id.clone()).expect("Token not found");

        // Ensure that the sender of the transaction is the owner of the token
        assert_eq!(
            &env::predecessor_account_id(),
            &token.owner_id,
            "Only the owner of the token can add metadata"
        );

        let mut metadata_vector = self.private_metadata
            .get(&token_id)
            .unwrap_or_else(|| Vector::new(StorageKey::PrivateMetadata));
        metadata_vector.push(&metadata);
        self.private_metadata.insert(&token_id, &metadata_vector);
    }

    // pub fn remove_metadata(&mut self, token_id: TokenId, public_key: PublicKey) {
    //     // Get the Token data to check the owner
    //     let token = self.tokens.nft_token(token_id.clone()).expect("Token not found");

    //     // Ensure that the sender of the transaction is the owner of the token
    //     assert_eq!(
    //         &env::predecessor_account_id(),
    //         &token.owner_id,
    //         "Only the owner of the token can remove metadata"
    //     );

    //     // Retrieve the metadata vector, if it exists
    //     if let Some(mut metadatas) = self.private_metadata.get(&token_id) {
    //         // Find and remove all metadata with the given public key
    //         let initial_len = metadatas.len();
    //         metadatas.retain(|metadata| metadata.public_key != public_key);

    //         // If any metadata was removed, save the changes
    //         if metadatas.len() != initial_len {
    //             self.private_metadata.insert(&token_id, &metadatas);
    //         }
    //     }
    // }

    pub fn remove_all_metadata(&mut self, token_id: TokenId) {
        // Get the Token data to check the owner
        let token = self.tokens.nft_token(token_id.clone()).expect("Token not found");

        // Ensure that the sender of the transaction is the owner of the token
        assert_eq!(
            &env::predecessor_account_id(),
            &token.owner_id,
            "Only the owner of the token can remove all metadata"
        );

        // Remove all metadata for the token
        let metadata_removed = self.private_metadata.remove(&token_id);

        // If there was no metadata, panic
        assert!(metadata_removed.is_some(), "No metadata found to remove");
    }

    // Retrieves a list of encrypted metadata entries for a given token ID
    // and public key starting from the specified index cursor and limited by the limit.
    pub fn get_private_metadata_by_key_paginated(
        &self,
        token_id: TokenId,
        public_key: PublicKey,
        from_index: Option<u64>, // Cursor: Start from this index (inclusive)
        limit: u64 // How many items to return
    ) -> Vec<EncryptedMetadata> {
        let metadata_vector = self.private_metadata.get(&token_id);
        if let Some(mut metadata_vector) = metadata_vector {
            let start_index = from_index.unwrap_or(0);
            metadata_vector
                .iter()
                .skip(start_index as usize)
                .take(limit as usize)
                .filter(|metadata| metadata.public_key == public_key)
                .collect()
        } else {
            vec![]
        }
    }

    pub fn get_public_keys(
        &self,
        token_id: TokenId,
        from_index: u64,
        limit: u64
    ) -> Vec<PublicKey> {
        // Assume `metadatas` is a `Vector<EncryptedMetadata>`
        let metadatas: Vector<EncryptedMetadata> = self.private_metadata
            .get(&token_id)
            .unwrap_or_else(|| Vector::new(b"m"));

        // Calculate end index respecting the length of the vector and the given limit
        let end_index = std::cmp::min(from_index + limit, metadatas.len());

        // Collect the range of public keys
        (from_index..end_index)
            .filter_map(|index| { metadatas.get(index).map(|metadata| metadata.public_key) })
            .collect()
    }

    pub fn has_public_key_access(&self, token_id: TokenId, public_key: PublicKey) -> bool {
        // Assume `metadatas` is a `Vector<EncryptedMetadata>`
        let metadatas: Vector<EncryptedMetadata> = self.private_metadata
            .get(&token_id)
            .unwrap_or_else(|| Vector::new(b"m"));

        // Iterate over the vector and check if any metadata matches the public key
        (0..metadatas.len()).any(|index| {
            if let Some(metadata) = metadatas.get(index) {
                metadata.public_key == public_key
            } else {
                false
            }
        })
    }
}

near_contract_standards::impl_non_fungible_token_core!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use near_sdk::test_utils::{ accounts, VMContextBuilder };
    use near_sdk::testing_env;
    use std::collections::HashMap;

    use super::*;

    const MINT_STORAGE_COST: u128 = 5870000000000000000000;

    fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor_account_id.clone())
            .predecessor_account_id(predecessor_account_id);
        builder
    }

    fn sample_token_metadata() -> TokenMetadata {
        TokenMetadata {
            title: Some("Olympus Mons".into()),
            description: Some("The tallest mountain in the charted solar system".into()),
            media: None,
            media_hash: None,
            copies: Some(1u64),
            issued_at: None,
            expires_at: None,
            starts_at: None,
            updated_at: None,
            extra: None,
            reference: None,
            reference_hash: None,
        }
    }

    #[test]
    fn test_new() {
        let mut context = get_context(accounts(1));
        testing_env!(context.build());
        let contract = Contract::new_default_meta(accounts(1).into());
        testing_env!(context.is_view(true).build());
        assert_eq!(contract.nft_token("1".to_string()), None);
    }

    #[test]
    #[should_panic(expected = "The contract is not initialized")]
    fn test_default() {
        let context = get_context(accounts(1));
        testing_env!(context.build());
        let _contract = Contract::default();
    }

    #[test]
    fn test_mint() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(0).into());

        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .attached_deposit(MINT_STORAGE_COST)
                .predecessor_account_id(accounts(0))
                .build()
        );

        let token_id = "0".to_string();
        let token = contract.nft_mint(token_id.clone(), accounts(0), sample_token_metadata());
        assert_eq!(token.token_id, token_id);
        assert_eq!(token.owner_id.to_string(), accounts(0).to_string());
        assert_eq!(token.metadata.unwrap(), sample_token_metadata());
        assert_eq!(token.approved_account_ids.unwrap(), HashMap::new());
    }

    #[test]
    fn test_transfer() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(0).into());

        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .attached_deposit(MINT_STORAGE_COST)
                .predecessor_account_id(accounts(0))
                .build()
        );
        let token_id = "0".to_string();
        contract.nft_mint(token_id.clone(), accounts(0), sample_token_metadata());

        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .attached_deposit(1)
                .predecessor_account_id(accounts(0))
                .build()
        );
        contract.nft_transfer(accounts(1), token_id.clone(), None, None);

        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .account_balance(env::account_balance())
                .is_view(true)
                .attached_deposit(0)
                .build()
        );
        if let Some(token) = contract.nft_token(token_id.clone()) {
            assert_eq!(token.token_id, token_id);
            assert_eq!(token.owner_id.to_string(), accounts(1).to_string());
            assert_eq!(token.metadata.unwrap(), sample_token_metadata());
            assert_eq!(token.approved_account_ids.unwrap(), HashMap::new());
        } else {
            panic!("token not correctly created, or not found by nft_token");
        }
    }

    #[test]
    fn test_approve() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(0).into());

        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .attached_deposit(MINT_STORAGE_COST)
                .predecessor_account_id(accounts(0))
                .build()
        );
        let token_id = "0".to_string();
        contract.nft_mint(token_id.clone(), accounts(0), sample_token_metadata());

        // alice approves bob
        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .attached_deposit(150000000000000000000)
                .predecessor_account_id(accounts(0))
                .build()
        );
        contract.nft_approve(token_id.clone(), accounts(1), None);

        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .account_balance(env::account_balance())
                .is_view(true)
                .attached_deposit(0)
                .build()
        );
        assert!(contract.nft_is_approved(token_id.clone(), accounts(1), Some(1)));
    }

    #[test]
    fn test_revoke() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(0).into());

        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .attached_deposit(MINT_STORAGE_COST)
                .predecessor_account_id(accounts(0))
                .build()
        );
        let token_id = "0".to_string();
        contract.nft_mint(token_id.clone(), accounts(0), sample_token_metadata());

        // alice approves bob
        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .attached_deposit(150000000000000000000)
                .predecessor_account_id(accounts(0))
                .build()
        );
        contract.nft_approve(token_id.clone(), accounts(1), None);

        // alice revokes bob
        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .attached_deposit(1)
                .predecessor_account_id(accounts(0))
                .build()
        );
        contract.nft_revoke(token_id.clone(), accounts(1));
        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .account_balance(env::account_balance())
                .is_view(true)
                .attached_deposit(0)
                .build()
        );
        assert!(!contract.nft_is_approved(token_id.clone(), accounts(1), None));
    }

    #[test]
    fn test_revoke_all() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(0).into());

        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .attached_deposit(MINT_STORAGE_COST)
                .predecessor_account_id(accounts(0))
                .build()
        );
        let token_id = "0".to_string();
        contract.nft_mint(token_id.clone(), accounts(0), sample_token_metadata());

        // alice approves bob
        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .attached_deposit(150000000000000000000)
                .predecessor_account_id(accounts(0))
                .build()
        );
        contract.nft_approve(token_id.clone(), accounts(1), None);

        // alice revokes bob
        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .attached_deposit(1)
                .predecessor_account_id(accounts(0))
                .build()
        );
        contract.nft_revoke_all(token_id.clone());
        testing_env!(
            context
                .storage_usage(env::storage_usage())
                .account_balance(env::account_balance())
                .is_view(true)
                .attached_deposit(0)
                .build()
        );
        assert!(!contract.nft_is_approved(token_id.clone(), accounts(1), Some(1)));
    }
}
