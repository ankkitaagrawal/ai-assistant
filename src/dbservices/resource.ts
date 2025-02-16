import { Resource } from '../models/resource';
import { Resource as ResourceType, ResourceSchema } from '../type/resource';
import redis from '../config/redis';
import { ApiError } from '../error/api-error';

// Cache all resources for an agent
const agentResourceKey = (agentId: string) => `assistant:resource:all:agent:${agentId}`;
// Cache a specific resource
const resourceKey = (resourceId: string) => `assistant:resource:${resourceId}`;

class ResourceService {
    static async createResource(resourceData: ResourceType): Promise<ResourceType> {
        ResourceSchema.parse(resourceData);
        // Clear the agent's resources cache
        redis.del(agentResourceKey(resourceData.agentId));
        try {
            const resource = new Resource(resourceData);
            await resource.save();
            return resource;
        } catch (error: any) {
            throw new Error(`Failed to create resource: ${error.message}`);
        }
    }

    static async deleteResource(id: string): Promise<ResourceType> {
        try {
            const deletedResource = await Resource.findByIdAndDelete(id);
            if (!deletedResource) {
                throw new Error(`Resource with ID ${id} not found.`);
            }
            // Clear specific resource cache and agent's resources cache
            const agentId = deletedResource.agentId;
            redis.del(resourceKey(id));
            redis.del(agentResourceKey(agentId));
            return deletedResource;
        } catch (error: any) {
            throw new Error(`Failed to delete resource: ${error.message}`);
        }
    }

    static async updateResource(id: string, updateData: Partial<ResourceType>) {
        ResourceSchema.partial().parse(updateData);
        try {
            const updatedResource = await Resource.findByIdAndUpdate(id, updateData, {
                new: true,
            });
            if (!updatedResource) {
                throw new Error(`Resource with ID ${id} not found.`);
            }
            // Clear specific resource cache and agent's resources cache
            const agentId = updatedResource.agentId;
            redis.del(resourceKey(id));
            redis.del(agentResourceKey(agentId));
            return updatedResource;
        } catch (error: any) {
            throw new ApiError(`Failed to update resource: ${error.message}`, 404);
        }
    }

    static async getResourceById(id: string): Promise<ResourceType> {
        try {
            const cacheKey = resourceKey(id);
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
            const cacheKey = agentResourceKey(agentId);
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

    static async updateMetadata(id: string, metadata: Record<string, any>) {
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
            redis.del(resourceKey(id));
            redis.del(agentResourceKey(updatedResource?.agentId));
            return updatedResource;
        } catch (error: any) {
            throw new ApiError(`Failed to update resource metadata: ${error.message}`, 404);
        }
    }
}

export default ResourceService;