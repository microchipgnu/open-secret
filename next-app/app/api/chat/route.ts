import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { callViewMethod } from "@/lib/data/near-rpc-functions";
import { constants } from "@/lib/constants";
import { open } from "@nearfoundation/near-js-encryption-box";


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

  const decryptData = async (uri: string, signerPublicKey: string) => {
    const result = await fetch(uri);
    if (!result.ok) {
      throw new Error(result.statusText);
    }

    const data = await result.text();

    const decryptedData = open(
      data,
      signerPublicKey,
      process.env.BOT_PRIVATE_KEY!,
      "86NFZFaUh1A8v8O11oMH3/Xwo4Fmi25g"
    );

    return decryptedData;
  };

  for (const item of data) {
    privateData += await decryptData(item?.metadata?.uri, item?.signer_public_key);
    privateData += "\n";
  }


  return privateData;
};

export async function POST(req: Request) {
  const json = await req.json();
  const { messages, accountId } = json;

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const openSecretDataContent = await getPrivateData(accountId);

  const openSecretSystemMessage: ChatCompletionRequestMessage = {
    role: "system",
    content: `Here is the OpenSecret data for ${accountId}: ${openSecretDataContent}`,
  };

  const messagesWithOpenSecretData = [...messages, openSecretSystemMessage];

  const res = await openai.createChatCompletion({
    model: "gpt-4-1106-preview",
    stream: true,
    temperature: 0.7,
    messages: messagesWithOpenSecretData,
  });

  const stream = OpenAIStream(res)

  return new StreamingTextResponse(stream);
}
