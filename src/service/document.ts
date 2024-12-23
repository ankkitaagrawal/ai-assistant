import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import env from "../config/env";
import { Chunk } from "../type/chunk";
import ChunkService from "../dbservices/chunk";
import mongoose from "mongoose";
import { deleteResourceChunks, savingVectorsInPineconeBatches } from "./langchain";

type Metadata = {
    public: boolean;
    agentId?: string;
    [key: string]: any;
}

export class Doc {
    private content?: string;
    private resourceId: string;
    private chunks: Array<Chunk>;
    private metadata: Metadata;
    constructor(resourceId: string, content?: string, metadata: Metadata = { public: false }) {
        this.content = content;
        this.resourceId = resourceId;
        this.metadata = metadata;
        this.chunks = [];
    }

    async chunk(chunkSize: number, overlap: number = 0) {
        if (!this.content) throw new Error("Content is requierd for chunking");
        if (!this.metadata.agentId) throw new Error("AgentId is required for chunking");
        this.chunks = []

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: chunkSize,
            chunkOverlap: overlap,
            // separators: ['\n', '\r\n', '\r', '\t', ' '],
            // separators: ["|", "##", ">", "-"],
        });
        const splits = await textSplitter.splitDocuments([{ pageContent: this.content, metadata: {} }]);
        for (const split of splits) {
            this.chunks.push({
                _id: (new mongoose.Types.ObjectId()).toString(),
                data: split.pageContent,
                resourceId: this.resourceId,
                public: this.metadata?.public,
                agentId: this.metadata.agentId,
            });
        }
        return this;
    }

    async encode(encoder: Encoder): Promise<this> {

        const chunkTexts = this.chunks.map((chunk) => chunk.data);
        const embeddings = await encoder.encode(chunkTexts);
        this.chunks = this.chunks.map((chunk, index) => {
            chunk.data = embeddings[index];
            return chunk;
        });
        return this;
    }

    async save(storage: Storage): Promise<this> {
        await storage.save(this.chunks);
        return this;
    }

    async delete(storage: Storage) {
        await storage.delete(this.resourceId);
        return this;
    }
}

interface Encoder {
    encode(chunks: string[]): Promise<any>;
}

interface Storage {
    save(chunks: Chunk[]): Promise<any>;
    delete(resourceId: string): Promise<any>;
}


const embeddings: any = new OpenAIEmbeddings({
    openAIApiKey: env.OPENAI_API_KEY_EMBEDDING,
    batchSize: 100,
    model: 'text-embedding-3-small',
});


export class OpenAiEncoder implements Encoder {
    async encode(chunks: string[]) {
        return embeddings.embedDocuments(chunks);
    }
}

export class MongoStorage implements Storage {
    async save(chunks: Chunk[]) {
        // Save the content to the database
        return Promise.all(chunks.map(async (chunk) => await ChunkService.createChunk(chunk)));
    }

    async delete(resourceId: string) {
        // Delete the content from the database
        return ChunkService.deleteChunksByResource(resourceId);
    }
}

export class PineconeStorage implements Storage {
    async save(chunks: Chunk[]) {
        let namespace: string = "default";
        // Save the content to the database
        const pineconeData = chunks.map((chunk) => {
            // namespace = chunk.agentId;
            return {
                id: chunk._id,
                values: chunk.data,
                metadata: {
                    docId: chunk.resourceId,
                    public: chunk.public,
                    agentId: chunk.agentId
                }
            }
        })
        return savingVectorsInPineconeBatches(pineconeData, namespace);
    }

    async delete(resourceId: string) {
        return deleteResourceChunks("default", resourceId);
    }
}
