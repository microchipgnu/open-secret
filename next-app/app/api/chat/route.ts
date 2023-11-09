import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { functionSchemas } from "@/lib/functions/schemas";

export const maxDuration = 40;

export async function POST(req: Request) {
  const json = await req.json();
  const { messages } = json;

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const res = await openai.createChatCompletion({
    model: "gpt-4-1106-preview",
    stream: true,
    temperature: 0.7,
    messages,
    functions: functionSchemas,
  });

  const stream = OpenAIStream(res);

  return new StreamingTextResponse(stream);
}
