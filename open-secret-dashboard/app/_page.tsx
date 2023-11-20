"use client";

import { Button } from "@/components/ui/button";
import { create, open } from "@nearfoundation/near-js-encryption-box";
import { Input } from "@/components/ui/input";
import { useGraphQlQuery } from "@/lib/data/use-graphql-query";
import { useMbWallet } from "@mintbase-js/react";
import { gql } from "graphql-request";
import { utils } from "near-api-js";
import { uploadFile } from "@mintbase-js/storage";
import { useEffect, useState } from "react";
import { callViewMethod } from "@/lib/data/near-rpc-functions";
import { constants } from "@/lib/constants";
import Link from "next/link";
import { sha256 } from "@/lib/data/hash";

export default function Dashboard() {
  const { isConnected, activeAccountId, selector } = useMbWallet();
  const [newData, setNewData] = useState("");
  const [privateMetadata, setPrivateMetadata] = useState([]);
  const [connectedPublicKey, setConnectedPublicKey] = useState("");

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
      contractAddress: constants.tokenContractAddress,
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
          receiverId: constants.tokenContractAddress,
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

    const { secret, nonce } = create(data, whichPublicKey, secretKey);

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
                signer_public_key: publicKey_str,
                nonce: nonce,
                sha256: hash,
                metadata: {
                  uri: `https://arweave.net/${result.id}`,
                  sha256: hash,
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
      receiverId: constants.tokenContractAddress,
    });
  };

  const getAllPublicKeys = async () => {
    const data = await callViewMethod({
      contractId: constants.tokenContractAddress,
      method: "get_public_keys",
      args: {
        token_id: activeAccountId,
        from_index: 0,
        limit: 1000,
      },
    });

    return data;
  };

  const decryptData = async (uri: string, nonce: string) => {
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
      nonce
    );

    return decryptedData;
  };

  const giveAccess = async (uri: string, publicKey: string, nonce: string) => {
    const decryptedData = await decryptData(uri, nonce);

    await addMetadata(decryptedData!, publicKey);
  };

  const generateNewKeyPair = async () => {
    const wallet = await selector.wallet();

    const { publicKey } = generateLocalKeypair();

    // wallet.signAndSendTransactions({
    //   transactions: [
    //     {
    //       receiverId: activeAccountId!,
    //       actions: [
    //         {
    //           params: {
    //             publicKey: publicKey.toString(),
    //             accessKey: {
    //               permission: {
    //                 receiverId: activeAccountId!,
    //                 methodNames: [],
    //                 allowance: "0",
    //               },
    //             },
    //           },
    //           type: "AddKey",
    //         },
    //       ],
    //     },
    //   ],
    // });
  };

  useEffect(() => {
    const init = async () => {
      if (!activeAccountId) return;
      const localKeyPair = JSON.parse(localStorage.getItem("keypair")!);
      const { publicKey_str } = localKeyPair;

      const data = await callViewMethod({
        contractId: constants.tokenContractAddress,
        method: "get_private_metadata_paginated",
        args: {
          token_id: activeAccountId,
          from_index: 0,
          limit: 1000,
        },
      });

      setPrivateMetadata(data);
      setConnectedPublicKey(publicKey_str);
      return data;
    };

    init();
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
      <section className="w-full py-4">
        <div className="container px-4 md:px-6">
          <div>{connectedPublicKey}</div>
          <div>{activeAccountId}</div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="text-xl font-bold">Data Feed</div>
          <div className="overflow-x-auto relative">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="py-3 px-6"></th>
                  <th scope="col" className="py-3 px-6 flex justify-between">
                    Public Key{" "}
                    <button
                      className="text-blue-600"
                      onClick={() => generateNewKeyPair()}
                    >
                      GEN NEW KEY
                    </button>
                  </th>
                  <th scope="col" className="py-3 px-6">
                    URI
                  </th>
                  <th scope="col" className="py-3 px-6">
                    SHA-256
                  </th>
                  <th scope="col" className="py-3 px-6">
                    ZK Proofs
                  </th>
                </tr>
              </thead>
              <tbody>
                {privateMetadata &&
                  privateMetadata.map((item: any, index: any) => {
                    return (
                      <tr
                        key={index}
                        className="bg-background border-b dark:bg-gray-800 dark:border-gray-700"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              disabled={connectedPublicKey !== item.public_key}
                              onClick={async () => {
                                const decryptedData = await decryptData(
                                  item.metadata.uri,
                                  item.nonce
                                );
                                alert(decryptedData);
                              }}
                            >
                              Decrypt
                            </Button>
                            <Button
                              disabled={connectedPublicKey !== item.public_key}
                              onClick={() =>
                                giveAccess(
                                  item.metadata.uri,
                                  process.env.NEXT_PUBLIC_BOT_PUBLIC_KEY!,
                                  item.nonce
                                )
                              }
                            >
                              Add Access
                            </Button>
                            <Button
                              onClick={() =>
                                giveAccess(
                                  item.metadata.uri,
                                  process.env.NEXT_PUBLIC_BOT_PUBLIC_KEY!,
                                  item.nonce
                                )
                              }
                            >
                              {connectedPublicKey === item.public_key
                                ? "Remove"
                                : "Revoke Access"}
                            </Button>
                          </div>
                        </td>
                        <td
                          className={`py-4 px-6 ${
                            connectedPublicKey === item.public_key
                              ? "text-green-600"
                              : ""
                          }`}
                        >
                          {item.public_key}
                        </td>
                        <td className="py-4 px-6">
                          <Link
                            href={item.metadata.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            {item.metadata.uri}
                          </Link>
                        </td>
                        <td className="py-4 px-6">{item.metadata.sha256}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2 items-center">
                            <div className="w-24 h-full">
                              Contains textual data
                            </div>
                            <div className="w-24">Personal information</div>
                          </div>
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
