

import { RPC_ENDPOINTS } from "@mintbase-js/sdk";
import { constants } from "@/lib/constants";

export const requestFromNearRpc = async (
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

export const callViewMethod = async ({
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
