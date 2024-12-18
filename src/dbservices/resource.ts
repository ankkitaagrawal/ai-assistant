import { Resource } from '../models/resource';
import { Resource as ResourceType, ResourceSchema } from '../type/resource';
import redis from '../config/redis';
import { ApiError } from '../error/api-error';

const resourceKey = (agentId: string, resourceId: string = 'all') => `assistant:agent:${agentId}:resource:${resourceId}`;

class ResourceService {
    static async createResource(resourceData: ResourceType) {
        ResourceSchema.parse(resourceData);
        // Clear the agent's resources cache
        redis.del(resourceKey(resourceData.agentId));
        try {
            const resource = new Resource(resourceData);
            await resource.save();
            return resource;
        } catch (error: any) {
            throw new Error(`Failed to create resource: ${error.message}`);
        }
    }

    static async deleteResource(agentId: string, id: string) {
        try {
            const deletedResource = await Resource.findByIdAndDelete(id);
            if (!deletedResource) {
                throw new Error(`Resource with ID ${id} not found.`);
            }
            // Clear specific resource cache and agent's resources cache
            redis.del(resourceKey(agentId, id));
            redis.del(resourceKey(agentId));
            return deletedResource;
        } catch (error: any) {
            throw new Error(`Failed to delete resource: ${error.message}`);
        }
    }

    static async updateResource(agentId: string, id: string, updateData: Partial<ResourceType>) {
        ResourceSchema.partial().parse(updateData);
        try {
            const updatedResource = await Resource.findByIdAndUpdate(id, updateData, {
                new: true,
            });
            if (!updatedResource) {
                throw new Error(`Resource with ID ${id} not found.`);
            }
            // Clear specific resource cache and agent's resources cache
            redis.del(resourceKey(agentId, id));
            redis.del(resourceKey(agentId));
            return updatedResource;
        } catch (error: any) {
            throw new ApiError(`Failed to update resource: ${error.message}`, 404);
        }
    }

    static async getResourceById(agentId: string, id: string): Promise<ResourceType> {
        try {
            const cacheKey = resourceKey(agentId, id);
            const cachedResource = await redis.cget(cacheKey).catch((error) => null);
            if (cachedResource) {
                return JSON.parse(cachedResource);
            }

            const resource = await Resource.findById(id);

            if (!resource) {
                throw new Error(`Resource with ID ${id} not found.`);
            }

            redis.cset(cacheKey, JSON.stringify(resource));
            return resource;
        } catch (error: any) {
            throw new ApiError(`Failed to retrieve resource: ${error.message}`, 404);
        }
    }

    static async getResourcesByAgent(agentId: string): Promise<ResourceType[]> {
        try {
            const cacheKey = resourceKey(agentId);
            const cachedResources = await redis.cget(cacheKey).catch((error) => null);
            if (cachedResources) {
                return JSON.parse(cachedResources);
            }

            const resources = await Resource.find({ agentId });

            redis.cset(cacheKey, JSON.stringify(resources));
            return resources;
        } catch (error: any) {
            throw new Error(`Failed to retrieve resources for agent: ${error.message}`);
        }
    }

    static async updateMetadata(agentId: string, id: string, metadata: Record<string, any>) {
        try {
            const updatedResource = await Resource.findByIdAndUpdate(
                id,
                { $set: { metadata } },
                { new: true }
            );
            if (!updatedResource) {
                throw new Error(`Resource with ID ${id} not found.`);
            }
            // Clear specific resource cache and agent's resources cache
            redis.del(resourceKey(agentId, id));
            redis.del(resourceKey(agentId));
            return updatedResource;
        } catch (error: any) {
            throw new ApiError(`Failed to update resource metadata: ${error.message}`, 404);
        }
    }
}

export default ResourceService;