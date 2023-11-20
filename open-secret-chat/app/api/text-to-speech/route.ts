import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export const runtime = 'edge'

export async function POST(req: Request) {

    const json = await req.json();
    const { text, voiceId } = json;

    const audioResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: voiceId,
        input: text,
    });

    // Error handling
    if (!audioResponse.ok || !audioResponse.body) {
        return new Response('Failed to get voice response', { status: audioResponse.status });
    }

    const buffer = Buffer.from(await audioResponse.arrayBuffer());

    return new Response(buffer);
}