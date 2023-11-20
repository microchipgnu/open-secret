import { nearEndpoints } from '@/lib/data/network'
import { constants } from "@/lib/constants";
import request from "graphql-request";

export type GqlFetchResult<T> = {
    data?: T;
    error?: string;
};

export const graphqlQLServiceNew = async ({
    query,
    variables,
    network,
    customUrl,
}: {
    query: any;
    variables?: Record<string, unknown>;
    network?: "testnet" | "mainnet";
    customUrl?: string;
}) => {
    const net = network ?? constants.network;
    const isTestnet = net === "testnet";

    const baseUrl = customUrl ? customUrl : isTestnet
        ? nearEndpoints.testnet.graph
        : nearEndpoints.mainnet.graph;


    const headers = {
        "content-type": "application/json",
        "mb-api-key": "anon",
        "Access-Control-Allow-Origin": "*",
        ...(customUrl && { "X-Hasura-Role": "dataplatform_near" }),

    };

    const queryLoad = () => request(baseUrl, query, variables, headers);

    return await queryLoad();
};

export const graphQLService = async ({
    query,
    variables,
    network,
    customUrl,
}: {
    query: any;
    variables?: Record<string, unknown>;
    network?: "testnet" | "mainnet";
    customUrl?: string;
}) => {
    try {
        const data = await graphQlFetch(query, variables, network, customUrl).then(
            async (data: Response) => {
                const res = await data.json();
                return res.data;
            }
        );

        return { data };
    } catch (error) {
        console.log(error, "error");
        return { error: `Query Error: ${error}` };
    }
};

export const graphQlFetch = async (
    query: string,
    variables: any,
    network?: "testnet" | "mainnet",
    customUrl?: string
): Promise<Response> => {
    const net = network ?? constants.network;
    const isTestnet = net === "testnet";

    const baseUrl = customUrl ? customUrl : isTestnet
        ? nearEndpoints.testnet.graph
        : nearEndpoints.mainnet.graph;

    const res = fetch(baseUrl, {
        method: "POST",
        body: JSON.stringify({
            query: query,
            variables: variables,
        }),
        headers: {
            "content-type": "application/json",
            "mb-api-key": "omni-site",
            ...(customUrl && { "X-Hasura-Role": "dataplatform_near" }),
        },
    });

    return await res;
};
