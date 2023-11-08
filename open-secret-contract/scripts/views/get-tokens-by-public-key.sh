

#!/bin/bash

# Path to the file containing the contract name
CONTRACT_NAME_FILE="./neardev/dev-account"

# Check if the contract name file exists
if [ -f "$CONTRACT_NAME_FILE" ]; then
    # Read the contract name from the file
    CONTRACT_NAME=$(cat "$CONTRACT_NAME_FILE")
    echo "Contract Name: $CONTRACT_NAME"

    # Now you can use the CONTRACT_NAME variable to run your near view command
    near view $CONTRACT_NAME get_tokens_by_public_key '{
        "public_key": "ed25519:8LXEySyBYewiTTL2jfGTSYcZsDjpRJ4hRm1fS3WJ4MdH",
        "from_index": 0,
        "limit": 10
    }' --accountId yoooooooooooooooooooo.testnet
else
    echo "Error: Contract name file does not exist."
    exit 1
fi