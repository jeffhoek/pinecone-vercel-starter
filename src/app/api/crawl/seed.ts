import { getEmbeddings } from "@/utils/embeddings";
import { Document, MarkdownTextSplitter, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";
import { Pinecone, PineconeRecord, ServerlessSpecCloudEnum } from "@pinecone-database/pinecone";
import { chunkedUpsert } from '../../utils/chunkedUpsert'
import md5 from "md5";
import { Crawler, Page } from "./crawler";
import { truncateStringByBytes } from "@/utils/truncateString"

interface SeedOptions {
  splittingMethod: string
  chunkSize: number
  chunkOverlap: number
}

type DocumentSplitter = RecursiveCharacterTextSplitter | MarkdownTextSplitter

async function seed(url: string, limit: number, indexName: string, cloudName: ServerlessSpecCloudEnum, regionName: string, options: SeedOptions) {
  try {
    console.log(`Starting seed process for URL: ${url}`);
    console.log(`Index name: ${indexName}, Cloud: ${cloudName}, Region: ${regionName}`);

    // Initialize the Pinecone client
    const pinecone = new Pinecone();

    // Destructure the options object
    const { splittingMethod, chunkSize, chunkOverlap } = options;

    // Create a new Crawler with depth 1 and maximum pages as limit
    const crawler = new Crawler(1, limit || 100);

    console.log(`Crawling URL: ${url}`);
    // Crawl the given URL and get the pages
    const pages = await crawler.crawl(url) as Page[];

    if (!pages || pages.length === 0) {
      throw new Error(`No pages were crawled from URL: ${url}. Check if the URL is accessible.`);
    }

    console.log(`Successfully crawled ${pages.length} page(s)`);

    // Choose the appropriate document splitter based on the splitting method
    const splitter: DocumentSplitter = splittingMethod === 'recursive' ?
      new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap }) : new MarkdownTextSplitter({});

    // Prepare documents by splitting the pages
    const documents = await Promise.all(pages.map(page => prepareDocument(page, splitter)));
    console.log(`Split into ${documents.flat().length} document chunks`);

    // Create Pinecone index if it does not exist
    console.log(`Checking if index "${indexName}" exists...`);
    const indexList: string[] = (await pinecone.listIndexes())?.indexes?.map(index => index.name) || [];
    console.log(`Available indexes: ${indexList.join(', ') || 'none'}`);

    const indexExists = indexList.includes(indexName);
    if (!indexExists) {
      console.log(`Creating new index "${indexName}"...`);
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536,
        waitUntilReady: true,
        spec: {
          serverless: {
              cloud: cloudName,
              region: regionName
          }
        }
      });
      console.log(`Index "${indexName}" created successfully`);
    } else {
      console.log(`Index "${indexName}" already exists`);
    }

    const index = pinecone.Index(indexName)

    // Get the vector embeddings for the documents
    console.log(`Generating embeddings for ${documents.flat().length} chunks...`);
    const vectors = await Promise.all(documents.flat().map(embedDocument));
    console.log(`Generated ${vectors.length} embeddings`);

    // Upsert vectors into the Pinecone index
    console.log(`Upserting vectors to Pinecone...`);
    await chunkedUpsert(index!, vectors, '', 10);
    console.log(`Successfully upserted vectors to index`);

    // Return the first document
    return documents[0];
  } catch (error) {
    console.error("Error seeding:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

async function embedDocument(doc: Document): Promise<PineconeRecord> {
  try {
    // Generate OpenAI embeddings for the document content
    const embedding = await getEmbeddings(doc.pageContent);

    // Create a hash of the document content
    const hash = md5(doc.pageContent);

    // Return the vector embedding object
    return {
      id: hash, // The ID of the vector is the hash of the document content
      values: embedding, // The vector values are the OpenAI embeddings
      metadata: { // The metadata includes details about the document
        chunk: doc.pageContent, // The chunk of text that the vector represents
        text: doc.metadata.text as string, // The text of the document
        url: doc.metadata.url as string, // The URL where the document was found
        hash: doc.metadata.hash as string // The hash of the document content
      }
    } as PineconeRecord;
  } catch (error) {
    console.log("Error embedding document: ", error)
    throw error
  }
}

async function prepareDocument(page: Page, splitter: DocumentSplitter): Promise<Document[]> {
  // Get the content of the page
  const pageContent = page.content;

  // Split the documents using the provided splitter
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        url: page.url,
        // Truncate the text to a maximum byte length
        text: truncateStringByBytes(pageContent, 36000)
      },
    }),
  ]);

  // Map over the documents and add a hash to their metadata
  return docs.map((doc: Document) => {
    return {
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        // Create a hash of the document content
        hash: md5(doc.pageContent)
      },
    };
  });
}




export default seed;