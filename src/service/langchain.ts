import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from "@langchain/openai";
import { calculateVectorSize, chunkTextWithOverlap } from '../utility/langchain';
import { getOpenAIResponse } from './openai';
import { langchainPrompt } from '../enums/prompt';
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import env from '../config/env';
import ChunkService from '../dbservices/chunk';
import { ProxyAgent, Dispatcher } from 'undici';

// TODO: Refactor this file

const MAX_REQUEST_SIZE = 4 * 1024 * 1024;
const client = new ProxyAgent({
    uri: 'http://34.48.179.78'
    // uri: 'https://api.pinecone.io',
    
});
const customFetch = (
    input: string | URL | Request,
    init: RequestInit | undefined
) => {
    return fetch(input, {
        ...init,
        dispatcher: client,
        keepalive: true,
    } as any);
};
const pc: any = new Pinecone({
    apiKey: env.PINECONE_API_KEY || "",
});
const embeddings: any = new OpenAIEmbeddings({
    openAIApiKey: env.OPENAI_API_KEY_EMBEDDING,
    batchSize: 100,
    model: 'text-embedding-3-small',
});

const index = pc.index(process.env.PINECONE_INDEX_NAME);

export const savingVectorsInPineconeBatches = async (vectors: any, namespace: any) => {
    try {
        let currentBatch = [];
        let currentBatchSize = 0;

        for (const vector of vectors) {
            const vectorSize = calculateVectorSize(vector);

            if (currentBatchSize + vectorSize > MAX_REQUEST_SIZE) {
                await index.namespace(namespace).upsert(currentBatch);
                currentBatch = [];
                currentBatchSize = 0;
            }

            currentBatch.push(vector);
            currentBatchSize += vectorSize;
        }

        if (currentBatch.length > 0) await index.namespace(namespace).upsert(currentBatch);
    } catch (error) {
        throw error
    }
}

export async function deleteResourceChunks(namespace: string, resourceId: string) {
    const resourceChunks = await ChunkService.getChunksByResource(resourceId);
    const chunkIds = resourceChunks.map((chunk: any) => chunk._id);
    if (chunkIds.length === 0) return;
    return index.namespace(namespace).deleteMany(chunkIds);
}

export const deleteVectorsFromPinecone = async (vectorIdsArray: string[], namespace: string) => {
    try {
        await index.namespace(namespace).deleteMany(vectorIdsArray);
    } catch (error) {
        console.log(`vector Id is not available ${vectorIdsArray} for Namespace ${namespace}`)
    }
}

export const deleteNamespaceInPinecone = async (namespace: string) => {
    try {
        await index.namespace(namespace).deleteAll();
    } catch (error) {
        console.error(`Namespace ${namespace} does not exist in Pinecone`)
    }
}

export const saveVectorsToPinecone = async (docId: string, text: string, namespace: string) => {
    try {
        const textChunks = chunkTextWithOverlap(text, 512, 50);
        const textEmbeddings = await embeddings.embedDocuments(textChunks);
        const vectors: any = textEmbeddings.map((embedding: any, index: number) => {
            // await savePineconeVectorIdToMongoDB(pageId, textChunks[index], namespace);
            return {
                id: Math.floor(10000000 + Math.random() * 90000000).toString(),
                values: embedding,
                metadata: { docId, text: textChunks[index] }
            }
        });
        const vectorIds = vectors.map((vector: any) => vector.id);
        await savingVectorsInPineconeBatches(vectors, namespace)
        return vectorIds;
    } catch (error) {
        console.error("Error in saveVectorsToPinecone:", error);
        throw error;
    }
}

export const queryLangchain = async (prompt: string, agentId: string) => {
    try {
        console.log(Date.now(), "Embedding query");
        const queryEmbedding = await embeddings.embedQuery(prompt);
        console.log(Date.now(), "Querying Pinecone");
        const queryResponse = await index.namespace("default").query({
            topK: 4, includeMetadata: true, vector: queryEmbedding, filter: {
                agentId: {
                    $eq: agentId
                }
            }
        });
        console.log(Date.now(), "Pinecone response received");
        const vectorIds = queryResponse.matches.map((match: any) => match.id);
        const textChunks = await Promise.all(vectorIds.map(async (id: string) => (await ChunkService.getChunkById(id)).data));
        const vectorInText = textChunks.join(" ");
        return vectorInText;
    } catch (error) {
        console.log(error);
        throw new Error("Invalid AI response");
    }
}

export const getVectorIdsFromSearchText = async (searchText: string, namespace: string) => {
    const queryEmbedding = await embeddings.embedQuery(searchText);
    const queryResponse = await index.namespace("default").query({ topK: 5, includeMetadata: true, vector: queryEmbedding });
    return queryResponse;
}


export const getCrawledDataFromSite = async (url: string) => {
    try {

        const docId = url?.match(/\/d\/(.*?)\//)?.[1];
        const loader = new CheerioWebBaseLoader(`https://docs.google.com/document/d/${docId}/export?format=txt`);
        const docs = await loader.load();
        return docs[0].pageContent;

    } catch (error) {
        console.error('Error fetching the webpage:', error);
        throw error;
    }
}
