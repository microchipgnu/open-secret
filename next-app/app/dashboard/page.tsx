"use client";

import { Button } from "@/components/ui/button";
import { create, open } from "@nearfoundation/near-js-encryption-box";
import { Input } from "@/components/ui/input";
import { useGraphQlQuery } from "@/lib/data/use-graphql-query";
import { useMbWallet } from "@mintbase-js/react";
import { gql } from "graphql-request";
import { utils } from "near-api-js";
import { uploadBuffer, uploadFile } from "@mintbase-js/storage";
import { RPC_ENDPOINTS } from "@mintbase-js/sdk";
import { constants } from "@/lib/constants";
import { useEffect, useState } from "react";

const requestFromNearRpc = async (
  body: Record<string, any>
): Promise<Record<string, any> | undefined> => {
  const fetchUrl = RPC_ENDPOINTS[constants.network as "testnet" | "mainnet"];

  const res = await fetch(fetchUrl, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-type": "application/json" },
  });

  return res.json();
};

const callViewMethod = async ({
  contractId,
  method,
  args,
}: {
  contractId: string;
  method: string;
  args?: Record<string, any>;
}): Promise<any> => {
  const args_base64 = args
    ? Buffer.from(JSON.stringify(args), "utf-8").toString("base64")
    : "";

  const res = await requestFromNearRpc({
    jsonrpc: "2.0",
    id: "dontcare",
    method: "query",
    params: {
      request_type: "call_function",
      finality: "final",
      account_id: contractId,
      method_name: method,
      args_base64,
    },
  });

  if (res?.error) {
    throw res.error;
  }

  const parsed = JSON.parse(Buffer.from(res?.result?.result).toString());
  return parsed;
};

async function sha256(message: string) {
  // Encode the string into a Uint8Array, which is like a buffer
  const msgBuffer = new TextEncoder().encode(message);

  // Hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // Convert the ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export default function Component() {
  const { isConnected, activeAccountId, selector } = useMbWallet();
  const [newData, setNewData] = useState("");
  const [privateMetadata, setPrivateMetadata] = useState([]);

  const queryObj = {
    queryName: "q_FETCH_FIRST_TOKEN",
    query: gql`
      query GetOwnsToken($accountId: String!, $contractAddress: String) {
        token: mb_views_nft_tokens(
          where: {
            minter: { _eq: $accountId }
            nft_contract_id: { _eq: $contractAddress }
            burned_timestamp: { _is_null: true }
            metadata_content_flag: { _is_null: true }
            nft_contract_content_flag: { _is_null: true }
          }
          order_by: { minted_timestamp: desc }
          limit: 1
          offset: 0
        ) {
          id: token_id
        }
      }
    `,
    variables: {
      accountId: activeAccountId,
      contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    },
    queryOpts: { enabled: !!activeAccountId },
  };

  const { data, isLoading } = useGraphQlQuery(queryObj);

  const handleNewDataChange = (event: any) => {
    const newData = event.target.value;
    setNewData(newData);
  };

  const mintToken = async () => {
    const wallet = await selector.wallet();

    const { publicKey } = generateLocalKeypair();

    wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: activeAccountId!,
          actions: [
            {
              params: {
                publicKey: publicKey.toString(),
                accessKey: {
                  permission: "FullAccess",
                },
              },
              type: "AddKey",
            },
          ],
        },
        {
          receiverId: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!,
          actions: [
            {
              params: {
                args: {
                  token_id: activeAccountId,
                  receiver_id: activeAccountId,
                  token_metadata: {
                    title: `${activeAccountId} open secret`,
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
    const localKeyPair = utils.key_pair.KeyPairEd25519.fromRandom();

    localStorage.setItem(
      "keypair",
      JSON.stringify({
        secretKey: localKeyPair.secretKey,
        publicKey: localKeyPair.publicKey,
        publicKey_str: localKeyPair.publicKey.toString(),
        accountId: activeAccountId,
      })
    );

    return localKeyPair;
  };

  const addMetadata = async (data: string, publicKey?: string) => {
    const localKeyPair = JSON.parse(localStorage.getItem("keypair")!);
    const { publicKey_str, secretKey } = localKeyPair;

    const whichPublicKey = publicKey ? publicKey : publicKey_str;

    const { secret } = create(
      data,
      whichPublicKey,
      secretKey,
      "86NFZFaUh1A8v8O11oMH3/Xwo4Fmi25g"
    );

    const blob: Blob = new Blob([secret], { type: "text/plain" });
    const file = new File([blob], "hello.txt", {
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
              token_id: activeAccountId,
              metadata: {
                public_key: whichPublicKey,
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
      receiverId: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!,
    });
  };

  const getAllPublicKeys = async () => {
    const data = await callViewMethod({
      contractId: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!,
      method: "get_public_keys",
      args: {
        token_id: activeAccountId,
        from_index: 0,
        limit: 1000,
      },
    });

    return data;
  };

  const decryptData = async (uri: string) => {
    const localKeyPair = JSON.parse(localStorage.getItem("keypair")!);
    const { publicKey_str, secretKey } = localKeyPair;

    const result = await fetch(uri);

    if (!result.ok) {
      throw new Error(result.statusText);
    }

    const decryptedData = open(
      await result.text(),
      publicKey_str,
      secretKey,
      "86NFZFaUh1A8v8O11oMH3/Xwo4Fmi25g"
    );

    console.log(decryptedData)

    return decryptedData;
  };

  const giveAccess = async (uri: string, publicKey: string) => {
    const decryptedData = await decryptData(uri);

    await addMetadata(decryptedData!, publicKey);
  };

  useEffect(() => {

    const fetchPrivateMetadata = async () => {
      if (!activeAccountId) return;

      const data = await callViewMethod({
        contractId: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!,
        method: "get_private_metadata_paginated",
        args: {
          token_id: activeAccountId,
          from_index: 0,
          limit: 1000,
        },
      });

      setPrivateMetadata(data);
      return data;
    };

    fetchPrivateMetadata();
  }, [isConnected, activeAccountId]);

  const hasToken = data?.token && data?.token.length > 0;

  if (!hasToken) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Mint Your NFT
            </h1>
            <Button
              onClick={mintToken}
              className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
            >
              Create Token
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="overflow-x-auto relative">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="py-3 px-6">
                    Public Key
                  </th>
                  <th scope="col" className="py-3 px-6">
                    URI
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Hash256
                  </th>
                  <th scope="col" className="py-3 px-6"></th>
                  <th scope="col" className="py-3 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {privateMetadata &&
                  privateMetadata.map((item: any, index: any) => {
                    return (
                      <tr
                        key={index}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      >
                        <td className="py-4 px-6">{item.public_key}</td>
                        <td className="py-4 px-6">
                          <a
                            href={item.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            {item.metadata.uri}
                          </a>
                        </td>
                        <td className="py-4 px-6">{item.metadata.hash256}</td>
                        <td
                          className="py-4 px-6 cursor-pointer"
                          onClick={() => decryptData(item.metadata.uri)}
                        >
                          Decrypt
                        </td>
                        <td
                          className="py-4 px-6 cursor-pointer"
                          onClick={() =>
                            giveAccess(
                              item.metadata.uri,
                              process.env.NEXT_PUBLIC_BOT_PUBLIC_KEY!
                            )
                          }
                        >
                          Give Access (Open Secret)
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Add Data
            </h1>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                id="metadata"
                placeholder="Data"
                type="text"
                value={newData}
                onChange={handleNewDataChange}
              />
              <Button onClick={() => addMetadata(newData)}>Add Data</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
