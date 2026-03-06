
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

export async function getEmbeddings(input: string) {
  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-ada-002'),
      value: input.replace(/\n/g, ' '),
    });
    return embedding;
  } catch (e) {
    console.log("Error calling OpenAI embedding API: ", e);
    throw new Error(`Error calling OpenAI embedding API: ${e}`);
  }
}