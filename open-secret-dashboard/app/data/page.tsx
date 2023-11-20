"use client";
import NotConnected from "@/components/not-connected";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { constants } from "@/lib/constants";
import { useGraphQlQuery } from "@/lib/data/use-graphql-query";
import useOpenSecret from "@/lib/hooks/use-open-secret";
import { useMbWallet } from "@mintbase-js/react";
import { gql } from "graphql-request";
import { Badge } from "@/components/ui/badge";
import { nanoid } from "nanoid";
import Link from "next/link";
import React from "react";
import { callViewMethod } from "@/lib/data/near-rpc-functions";

const QUERY_OWNS_TOKEN = gql`
  query GetOwnsToken($accountId: String!, $contractAddress: String) {
    token: mb_views_nft_tokens(
      where: {
        minter: { _eq: $accountId }
        nft_contract_id: { _eq: $contractAddress }
        burned_timestamp: { _is_null: true }
        metadata_content_flag: { _is_null: true }
        nft_contract_content_flag: { _is_null: true }
      }
      limit: 10
      order_by: { minted_timestamp: desc }
    ) {
      id: token_id
    }
  }
`;

const NFTManagement = () => {
  const { activeAccountId } = useMbWallet();
  const { mintToken } = useOpenSecret({
    contractId: constants.tokenContractAddress,
  });

  const queryObj = {
    queryName: "q_OWNS_TOKEN",
    query: QUERY_OWNS_TOKEN,
    variables: {
      accountId: activeAccountId,
      contractAddress: constants.tokenContractAddress,
    },
    queryOpts: { enabled: !!activeAccountId },
  };

  const { data } = useGraphQlQuery(queryObj);

  const fetchPrivateMetadata = React.useCallback(async () => {
    try {
      const data = await callViewMethod({
        contractId: constants.tokenContractAddress,
        method: "get_metadata_for_tokens",
        args: {
          token_ids: [
            "kvcERXKT601fNOh2AWywP",
            "Xc_-jSAHcE6TJHYcwGyeh",
            "mSkM5GR0js7UWtQ-R5im_",
            "HSiQ56ynXzbioO8TRo2z4",
          ],
        },
      });

      console.log(data);
    } catch (err) {
    } finally {
    }
  }, []);

  React.useEffect(() => {
    fetchPrivateMetadata();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <Button
          onClick={() => {
            mintToken(nanoid());
          }}
        >
          Create Data Feed
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data?.token.map(({ id }: { id: string }) => (
          <div key={id}>
            <Card>
              <CardHeader>
                <CardTitle className="truncate">{id}</CardTitle>
                <CardDescription>...</CardDescription>
              </CardHeader>
              <CardContent>...</CardContent>
              <CardFooter className="flex justify-between">
                <Link
                  href={`https://${
                    constants.network === "testnet" ? "testnet." : ""
                  }mintbase.xyz/contract/${
                    constants.tokenContractAddress
                  }/token/${id}`}
                  target="_blank"
                >
                  Explore
                </Link>
                <Link href={`data/${id}`}>Manage</Link>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

const TokenManagementPage = () => {
  const { isConnected } = useMbWallet();

  if (!isConnected) {
    return <NotConnected />;
  }
  return (
    <>
      <h1 className="text-xl font-semibold text-white mb-6">
        Data Feed Management
      </h1>
      <div className="text-white mb-6">
        NFTs have data feeds associated with them. By owning a NFT, you can
        attach data and give or revoke access to it.
      </div>
      <NFTManagement />
    </>
  );
};

export default TokenManagementPage;
