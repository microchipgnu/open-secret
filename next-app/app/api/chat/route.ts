import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { functionSchemas } from "@/lib/functions/schemas";
import { callViewMethod } from "@/lib/data/near-rpc-functions";
import { constants } from "@/lib/constants";
import { create, open } from "@nearfoundation/near-js-encryption-box";

export const maxDuration = 40;

const getPrivateData = async (accountId: string) => {
  let privateData = "";


  const data = await callViewMethod({
    contractId: constants.tokenContractAddress,
    method: "get_private_metadata_by_key_paginated",
    args: {
      token_id: accountId,
      public_key: process.env.NEXT_PUBLIC_BOT_PUBLIC_KEY,
      from_index: 0,
      limit: 1000,
    },
  });

  console.log(data);

  const decryptData = async (uri: string) => {
    const result = await fetch(uri);

    console.log(uri);
    console.log(result);

    if (!result.ok) {
      throw new Error(result.statusText);
    }

    const data = await result.text();

    const decryptedData = open(
      data,
      "ed25519:R3NkdW554Y2xNST8cAmYXD5pJBbUtJZex7hk8NTGgAz",
      process.env.BOT_PRIVATE_KEY!,
      "86NFZFaUh1A8v8O11oMH3/Xwo4Fmi25g"
    );

    console.log(decryptedData);

    return decryptedData;
  };

  for (const item of data) {
    privateData += await decryptData(item?.metadata?.uri);
    privateData += "\n";
  }

  console.log(privateData);

  return privateData;
};

export async function POST(req: Request) {
  const json = await req.json();
  const { messages, accountId } = json;

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const privateDataContent = await getPrivateData(accountId);

  console.log(privateDataContent);

  const privateSystemMessages: Message = {
    role: "system",
    content:
      JSON.stringify(privateDataContent) || "ERROR: Private data not found",
    id: "system3",
  };

  const res = await openai.createChatCompletion({
    model: "gpt-4-1106-preview",
    stream: true,
    temperature: 0.7,
    messages: [...messages, privateSystemMessages],
    functions: functionSchemas,
  });

  const stream = OpenAIStream(res);

  return new StreamingTextResponse(stream);
}
