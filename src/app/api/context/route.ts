import { NextResponse } from "next/server";
import { getContext } from "@/utils/context";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages.length > 1 ? messages[messages.length - 1] : messages[0]

    // Extract text from the message parts (AI SDK v5 structure)
    const messageText = lastMessage.parts
      ?.filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
      .join(' ') || ''

    const context = await getContext(messageText, '', 10000, 0.7, false) as ScoredPineconeRecord[]
    return NextResponse.json({ context })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: 'Failed to get context' }, { status: 500 })
  }
}
