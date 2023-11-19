import { constants } from "@/lib/constants";
import { sha256 } from "@/lib/data/hash";
import { callViewMethod } from "@/lib/data/near-rpc-functions";
import { useMbWallet } from "@mintbase-js/react";
import { uploadFile } from "@mintbase-js/storage";
import { create, open } from "@nearfoundation/near-js-encryption-box";
import { utils } from "near-api-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import * as nearAPI from "near-api-js";
import {
  createKey,
  getKeys,
  isPassKeyAvailable,
} from "@near-js/biometric-ed25519";
import { nanoid } from "nanoid";

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
  const [keyPairPasskey, setKeyPairPasskey] = useLocalStorage<null | Record<
    string,
    {
      publicKey: string;
    }
  >>("opensecret-keypair-passkey", null);

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

  const getCurrentPublicKey = async () => {
    if (!keypair) return;
    if (!keyPairPasskey) return;
    if (!activeAccountId) return;

    const publicKey = (await isPassKeyAvailable())
      ? keyPairPasskey[activeAccountId].publicKey
      : keypair?.publicKey;

    setConnectedPublicKey(publicKey);
    return publicKey;
  };

  const getCurrentKeyPair = async () => {
    const hasPasskeys = await isPassKeyAvailable();

    if (!hasPasskeys) {
      if (!keypair) {
        const newKp = generateLocalKeypair();
        if (!newKp) return;

        const { secretKey } = newKp;

        const kp = nearAPI.KeyPair.fromString(secretKey);
        return kp;
      }
    }

    const kp = await getKeyPairPasskey();
    if (!kp) return;

    return kp;
  };

  useEffect(() => {
    getCurrentPublicKey();
  }, [keyPairPasskey, keypair, activeAccountId]);

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

  const clearPasskeyLocalstorage = () => {
    setKeyPairPasskey(null);
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

  const generatePasskeyKeypair = async () => {
    if (!activeAccountId) return;

    const keypair = await createKey(`${activeAccountId}`);

    const newKeypair = {
      publicKey: keypair.getPublicKey().toString(),
      accountId: activeAccountId,
    };

    setKeyPairPasskey({
      ...keyPairPasskey,
      [activeAccountId]: newKeypair,
    });
  };

  const getKeyPairPasskey = async () => {
    if (!activeAccountId) return;

    let keys = await getKeys(activeAccountId);

    let correctKey = null;

    keys.forEach((_key) => {
      if (
        _key.getPublicKey()?.toString() ===
        keyPairPasskey?.[activeAccountId]?.publicKey
      ) {
        correctKey = _key as nearAPI.utils.KeyPairEd25519;
      }
    });

    return correctKey as nearAPI.utils.KeyPair | null;
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
    if (!activeAccountId) return;

    const keypair = await getCurrentKeyPair();

    if (connectedPublicKey !== keypair?.getPublicKey().toString()) return;

    const whichPublicKey = otherPublicKey ? otherPublicKey : connectedPublicKey;

    // @ts-ignore | TODO: find other ways to use the secret key
    const { secret, nonce } = create(data, whichPublicKey, keypair?.secretKey);

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
                signer_public_key: connectedPublicKey,
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
    const keypair = await getCurrentKeyPair();

    const result = await fetch(uri);

    if (!result.ok) {
      throw new Error(result.statusText);
    }

    const decryptedData = open(
      await result.text(),
      connectedPublicKey,
      // @ts-ignore TODO: find other ways to use the secret key
      keypair?.secretKey,
      nonce
    );

    return decryptedData;
  };

  const decryptData = async (data: string, nonce: string) => {
    const keypair = await getCurrentKeyPair();

    const decryptedData = open(
      data,
      connectedPublicKey,
      // @ts-ignore
      keypair?.secretKey,
      nonce
    );

    if (!decryptedData) {
      throw new Error("Failed to decrypt data");
    }

    return { data: decryptedData, sha256: await sha256(decryptedData) };
  };

  const encryptData = async (data: string) => {
    const keypair = await getCurrentKeyPair();

    const { secret, nonce } = create(
      data,
      connectedPublicKey,
      // @ts-ignore TODO: find other ways to use the secret key
      keypair?.secretKey
    );

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
    const hasPasskeys = await isPassKeyAvailable();

    if (!hasPasskeys) {
      const newKp = generateLocalKeypair();
      if (!newKp) return;

      const { secretKey } = newKp;

      const kp = nearAPI.KeyPair.fromString(secretKey);
      return kp;
    }

    const kp = await generatePasskeyKeypair();
    return kp;
  };

  return {
    clearPasskeyLocalstorage,
    generateNewKeyPair,
    generatePasskeyKeypair,
    getKeyPairPasskey,
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
      publicKey: connectedPublicKey,
    },
  };
};

export default useOpenSecret;
