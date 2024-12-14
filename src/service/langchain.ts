import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from "@langchain/openai";
import { nanoid } from 'nanoid';
import { calculateVectorSize, chunkTextWithOverlap } from '../utility/langchain';
import { getOpenAIResponse } from './openai';
import { langchainPrompt } from '../enums/prompt';
import axios from 'axios';
import { convert } from 'html-to-text';
import env from '../config/env';


const MAX_REQUEST_SIZE = 4 * 1024 * 1024;

const pc: any = new Pinecone({
    apiKey: env.PINECONE_API_KEY || ""
});
const embeddings: any = new OpenAIEmbeddings({
    openAIApiKey: env.OPENAI_API_KEY_EMBEDDING,
    batchSize: 100,
    model: 'text-embedding-3-small',
});

const index = pc.index(process.env.PINECONE_INDEX_NAME);

const savingVectorsInPineconeBatches = async (vectors: any, namespace: any) => {
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
                id: Math.floor(10000000 + Math.random() * 90000000).toString(), // Use NanoId!!!!
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

export const queryLangchain = async (prompt: string, namespace: string) => {
    try {
        const queryEmbedding = await embeddings.embedQuery(prompt);
        const queryResponse = await index.namespace(namespace).query({ topK: 10, includeMetadata: true, vector: queryEmbedding });
        const vectorInText = queryResponse.matches.map((match: any) => match.metadata.text).join(" ");
        const { responseFromAI } = await getOpenAIResponse(`${langchainPrompt}:  ${JSON.stringify({ vectorInText, userQuery: prompt })}`);
        return responseFromAI;
    } catch (error) {
        throw new Error("Invalid AI response");
    }
}

export const getVectorIdsFromSearchText = async (searchText: string, namespace: string) => {
    const queryEmbedding = await embeddings.embedQuery(searchText);
    const queryResponse = await index.namespace(namespace).query({ topK: 5, includeMetadata: true, vector: queryEmbedding });
    return queryResponse;
}


export const getCrawledDataFromSite = async (url: string , assistantId :string , docId :string ) => {
    try {
      const response = await axios.get(url);
      const textContent = convert(response.data)
      await saveVectorsToPinecone(docId, textContent , assistantId);
    } catch (error) {
      console.error('Error fetching the webpage:', error);
      throw error;
    }
  }