"use client";
import NotConnected from "@/components/not-connected";
import { Button } from "@/components/ui/button";
import { constants } from "@/lib/constants";
import { useGraphQlQuery } from "@/lib/data/use-graphql-query";
import useOpenSecret from "@/lib/hooks/use-open-secret";
import { useMbWallet } from "@mintbase-js/react";
import { gql } from "graphql-request";
import { nanoid } from "nanoid";
import Link from "next/link";

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
          <div
            key={id}
            className="border border-2 rounded overflow-hidden shadow-lg"
          >
            <div className="px-6 py-4 flex flex-col">
              <div className="font-bold mb-2">{id}</div>
              <Link
                href={`https://${
                  constants.network === "testnet" ? "testnet." : ""
                }mintbase.xyz/contract/${
                  constants.tokenContractAddress
                }/token/${id}`}
                target="_blank"
              >
                View on Mintbase
              </Link>
              <Link
                href={`data/${id}`}
              >
                Manage
              </Link>
              
              {/* <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded">
                Edit
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded ml-2">
                Sell
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded ml-2">
                Burn
              </button> */}
            </div>
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
