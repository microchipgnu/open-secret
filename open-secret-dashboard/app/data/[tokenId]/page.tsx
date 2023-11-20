"use client";

import { PrivateDataTable } from "@/components/private-data-table";
import { Button } from "@/components/ui/button";
import { constants } from "@/lib/constants";
import { callViewMethod } from "@/lib/data/near-rpc-functions";
import useOpenSecret from "@/lib/hooks/use-open-secret";
import Link from "next/link";

import { useCallback, useEffect, useState } from "react";

const TokenComponent = ({ tokenId }: { tokenId: string }) => {
  const [isLoading, setLoading] = useState(false);
  const [privateMetadata, setPrivateMetadata] = useState([]);

  const { account, decryptDataByUri, giveAccess } = useOpenSecret({
    contractId: constants.tokenContractAddress,
  });

  const fetchPrivateMetadata = useCallback(async () => {
    try {
      setLoading(true);
      const data = await callViewMethod({
        contractId: constants.tokenContractAddress,
        method: "get_private_metadata_paginated",
        args: { token_id: tokenId, from_index: 0, limit: 1000 },
      });
      setPrivateMetadata(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    fetchPrivateMetadata();
  }, []);

  const connectedPublicKey = account.publicKey;
  return (
    <>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6"></th>
            <th scope="col" className="py-3 px-6 flex justify-between">
              Public Key{" "}
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
                          const decryptedData = await decryptDataByUri(
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
                            item.nonce,
                            tokenId
                          )
                        }
                      >
                        Give Access
                      </Button>
                      <Button>
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
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      {item.metadata.uri}
                    </Link>
                  </td>
                  <td className="py-4 px-6">{item.metadata.sha256}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 items-center">
                      <div className="w-24 h-full">Contains textual data</div>
                      <div className="w-24">Personal information</div>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </>
  );
};

const TokenPage = ({ params }: { params: { tokenId: string } }) => {
  return (
    <>
      <div className="flex gap-2 items-center mb-6">
        <h1 className="text-xl font-semibold text-white">
          Data Feed Management{" "}
          <span className="text-gray-400">{params.tokenId}</span>
        </h1>
      </div>

      {/* <TokenComponent tokenId={params.tokenId} /> */}
      <PrivateDataTable tokenId={params.tokenId} />
    </>
  );
};

export default TokenPage;
