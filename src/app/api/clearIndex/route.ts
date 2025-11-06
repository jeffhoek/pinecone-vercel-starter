import { NextResponse } from "next/server";
import { Pinecone } from '@pinecone-database/pinecone'

export async function POST() {
  try {
    // Instantiate a new Pinecone client
    const pinecone = new Pinecone();

    const indexName = process.env.PINECONE_INDEX;

    if (!indexName) {
      return NextResponse.json({
        success: false,
        error: "PINECONE_INDEX environment variable is not set"
      }, { status: 500 });
    }

    console.log(`Attempting to clear index: ${indexName}`);

    // Check if index exists before attempting to delete
    const indexList = await pinecone.listIndexes();
    const indexExists = indexList?.indexes?.some(index => index.name === indexName);

    if (!indexExists) {
      console.log(`Index ${indexName} does not exist. Available indexes:`,
        indexList?.indexes?.map(i => i.name).join(', ') || 'none');

      return NextResponse.json({
        success: true,
        message: "Index does not exist, nothing to clear"
      });
    }

    // Select the desired index
    const index = pinecone.Index(indexName);

    // Use the custom namespace, if provided, otherwise use the default
    const namespaceName = process.env.PINECONE_NAMESPACE ?? '';
    const namespace = index.namespace(namespaceName);

    console.log(`Clearing namespace: ${namespaceName || '(default)'}`);

    // Delete everything within the namespace
    await namespace.deleteAll();

    console.log('Index cleared successfully');

    return NextResponse.json({
      success: true,
      message: "Index cleared successfully"
    });
  } catch (error: any) {
    console.error('Error clearing index:', error);

    return NextResponse.json({
      success: false,
      error: error.message || "Failed to clear index",
      details: error.toString()
    }, { status: 500 });
  }
}
