import { Chunk } from '../models/chunk'
import redis from '../config/redis';
import { ApiError } from '../error/api-error';
import { ChunkSchema, Chunk as ChunkType } from '../type/chunk';
import { ResourceSchema } from '../type/resource';

// Cache all chunks for a resource
const resourceChunksKey = (resourceId: string) => `assistant:chunk:all:resource:${resourceId}`;
// Cache a specific chunk
const chunkKey = (chunkId: string) => `assistant:chunk:${chunkId}`;

class ChunkService {
    static async createChunk(data: ChunkType): Promise<ChunkType> {
        ChunkSchema.parse(data);
        try {
            // Clear the resource's chunks cache
            redis.del(resourceChunksKey(data.resourceId));
            const chunk = new Chunk(data);
            await chunk.save();
            return chunk;
        } catch (error: any) {
            throw new Error(`Failed to create chunk: ${error.message}`);
        }
    }

    static async deleteChunk(id: string): Promise<ChunkType> {
        try {
            const deletedChunk = await Chunk.findByIdAndDelete(id);
            if (!deletedChunk) {
                throw new Error(`Chunk with ID ${id} not found.`);
            }
            // Clear specific chunk cache and resource's chunks cache
            redis.del(chunkKey(id));
            redis.del(resourceChunksKey(deletedChunk.resourceId));
            return deletedChunk;
        } catch (error: any) {
            throw new Error(`Failed to delete chunk: ${error.message}`);
        }
    }

    static async updateChunk(id: string, updateData: Partial<ChunkType>): Promise<ChunkType> {
        try {
            const updatedChunk = await Chunk.findByIdAndUpdate(id, updateData, { new: true });
            if (!updatedChunk) {
                throw new Error(`Chunk with ID ${id} not found.`);
            }
            // Clear specific chunk cache and resource's chunks cache
            redis.del(chunkKey(id));
            redis.del(resourceChunksKey(updatedChunk.resourceId));
            return updatedChunk;
        } catch (error: any) {
            throw new ApiError(`Failed to update chunk: ${error.message}`, 404);
        }
    }

    static async getChunkById(id: string): Promise<ChunkType> {
        try {
            const cacheKey = chunkKey(id);
            const cachedChunk = await redis.cget(cacheKey).catch(() => null);
            if (cachedChunk) {
                return JSON.parse(cachedChunk);
            }

            const chunk = await Chunk.findById(id);

            if (!chunk) {
                throw new Error(`Chunk with ID ${id} not found.`);
            }

            redis.cset(cacheKey, JSON.stringify(chunk));
            return chunk;
        } catch (error: any) {
            throw new ApiError(`Failed to retrieve chunk: ${error.message}`, 404);
        }
    }

    static async getChunksByResource(resourceId: string): Promise<ChunkType[]> {
        try {
            const cacheKey = resourceChunksKey(resourceId);
            const cachedChunks = await redis.cget(cacheKey).catch(() => null);
            if (cachedChunks) {
                return JSON.parse(cachedChunks);
            }

            const chunks = await Chunk.find({ resourceId });

            redis.cset(cacheKey, JSON.stringify(chunks));
            return chunks;
        } catch (error: any) {
            throw new Error(`Failed to retrieve chunks for resource: ${error.message}`);
        }
    }

    static async deleteChunksByResource(resourceId: string): Promise<any> {
        try {
            const chunks = await Chunk.find({ resourceId }) as ChunkType[];

            // Remove individual chunk caches
            const chunkIds = chunks.map(chunk => chunk._id?.toString());
            const chunkCacheKeys = chunkIds.map(id => chunkKey(id || ""));
            if (chunkCacheKeys.length > 0) {
                await redis.del(...chunkCacheKeys as any);
            }

            // Delete chunks from database
            const result = await Chunk.deleteMany({ resourceId });

            // Clear the resource's chunks cache
            redis.del(resourceChunksKey(resourceId));
            return result;
        } catch (error: any) {
            throw new ApiError(`Failed to delete chunks for resource: ${error.message}`, 500);
        }
    }
}

export default ChunkService;
