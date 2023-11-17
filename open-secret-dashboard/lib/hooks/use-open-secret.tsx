import { Button } from "@/components/ui/button";
import { create, open } from "@nearfoundation/near-js-encryption-box";
import { Input } from "@/components/ui/input";
import { useGraphQlQuery } from "@/lib/data/use-graphql-query";
import { useMbWallet } from "@mintbase-js/react";
import { gql } from "graphql-request";
import { utils } from "near-api-js";
import { uploadFile } from "@mintbase-js/storage";
import { useCallback, useEffect, useState } from "react";
import { callViewMethod } from "@/lib/data/near-rpc-functions";
import { constants } from "@/lib/constants";
import Link from "next/link";
import { sha256 } from "@/lib/data/hash";
import { useLocalStorage } from "usehooks-ts";

const useOpenSecret = ({ contractId }: { contractId: string }) => {
  const { isConnected, activeAccountId, selector } = useMbWallet();
  const [newData, setNewData] = useState("");
  const [connectedContract, setConnectedContractId] = useState(contractId);
  const [privateMetadata, setPrivateMetadata] = useState([]);
  const [connectedPublicKey, setConnectedPublicKey] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null | unknown>(null);
  const [keypair, setKeypair] = useLocalStorage<null | {
    publicKey: string;
    secretKey: string;
    accountId: string;
  }>("opensecret-keypair", null);

  const fetchPrivateMetadata = useCallback(async () => {
    if (!activeAccountId) return;
    try {
      setLoading(true);
      const data = await callViewMethod({
        contractId: constants.tokenContractAddress,
        method: "get_private_metadata_paginated",
        args: { token_id: activeAccountId, from_index: 0, limit: 1000 },
      });
      setPrivateMetadata(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [activeAccountId]);

  useEffect(() => {
    setConnectedContractId(contractId);
  }, [contractId]);

  const mintToken = async (tokenId: string) => {
    const wallet = await selector.wallet();

    wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: constants.tokenContractAddress,
          actions: [
            {
              params: {
                args: {
                  token_id: tokenId,
                  receiver_id: activeAccountId,
                  token_metadata: {
                    title: `${tokenId} open secret`,
                  },
                },
                deposit: "10000000000000000000000",
                gas: "200000000000000",
                methodName: "nft_mint",
              },
              type: "FunctionCall",
            },
          ],
        },
      ],
    });
  };

  const generateLocalKeypair = () => {
    if (!activeAccountId) return;

    const localKeyPair = utils.key_pair.KeyPairEd25519.fromRandom();

    const newKeypair = {
      secretKey: localKeyPair.secretKey,
      publicKey: localKeyPair.publicKey.toString(),
      accountId: activeAccountId,
    };

    setKeypair(newKeypair);

    return newKeypair;
  };

  const addMetadata = async ({
    data,
    otherPublicKey,
    tokenId,
  }: {
    data: string;
    otherPublicKey?: string;
    tokenId?: string;
  }) => {
    if (!keypair) return;
    if (!activeAccountId) return;

    const { publicKey, secretKey } = keypair;

    const whichPublicKey = otherPublicKey ? otherPublicKey : publicKey;

    const { secret, nonce } = create(data, whichPublicKey, secretKey);

    const blob: Blob = new Blob([secret], { type: "text/plain" });
    const file = new File([blob], "data.txt", {
      type: blob.type,
      lastModified: new Date().getTime(),
    });

    const result = await uploadFile(file);

    const hash = await sha256(data);

    const wallet = await selector.wallet();
    wallet.signAndSendTransaction({
      actions: [
        {
          params: {
            args: {
              token_id: tokenId ? tokenId : activeAccountId,
              metadata: {
                public_key: whichPublicKey,
                signer_public_key: publicKey,
                nonce: nonce,
                hash256: hash,
                metadata: {
                  uri: `https://arweave.net/${result.id}`,
                  hash256: hash,
                },
              },
            },
            deposit: "0",
            gas: "200000000000000",
            methodName: "add_metadata",
          },
          type: "FunctionCall",
        },
      ],
      receiverId: connectedContract,
    });
  };

  const getAllPublicKeysByTokenId = async (tokenId: string) => {
    const data = await callViewMethod({
      contractId: constants.tokenContractAddress,
      method: "get_public_keys",
      args: {
        token_id: tokenId,
        from_index: 0,
        limit: 1000,
      },
    });

    return data;
  };

  const decryptDataByUri = async (uri: string, nonce: string) => {
    if (!keypair) return;

    const { publicKey, secretKey } = keypair;

    const result = await fetch(uri);

    if (!result.ok) {
      throw new Error(result.statusText);
    }

    const decryptedData = open(
      await result.text(),
      publicKey,
      secretKey,
      nonce
    );

    return decryptedData;
  };

  const decryptData = async (data: string, nonce: string) => {
    if (!keypair) return;

    const { publicKey, secretKey } = keypair;

    const decryptedData = open(data, publicKey, secretKey, nonce);

    if (!decryptedData) {
      throw new Error("Failed to decrypt data");
    }

    return { data: decryptedData, sha256: await sha256(decryptedData) };
  };

  const encryptData = async (data: string) => {
    if (!keypair) return;

    const { publicKey, secretKey } = keypair;

    const { secret, nonce } = create(data, publicKey, secretKey);

    const hash = await sha256(data);

    return {
      secret,
      nonce,
      sha256: hash,
    };
  };

  const giveAccess = async (uri: string, publicKey: string, nonce: string) => {
    const decryptedData = await decryptDataByUri(uri, nonce);

    await addMetadata({
      data: decryptedData!,
      otherPublicKey: publicKey,
    });
  };

  const generateNewKeyPair = async () => {
    const keypair = generateLocalKeypair();

    if (!keypair) return;

    return keypair.publicKey;
  };

  return {
    generateNewKeyPair,
    giveAccess,
    getAllPublicKeysByTokenId,
    mintToken,
    addMetadata,
    fetchPrivateMetadata,
    loading: isLoading,
    error,
    privateMetadata,
    encryptData,
    decryptData,
    decryptDataByUri,
    account: {
      accountId: activeAccountId,
      publicKey: keypair?.publicKey,
    },
  };
};

export default useOpenSecret;
