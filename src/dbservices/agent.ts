import { Agent } from '../models/agent';
import { Agent as AgentType, AgentSchema } from '../type/agent';
import redis from '../config/redis';
import { ApiError } from '../error/api-error';

const agentKey = (agentId: string) => `assistant:agent:${agentId}`;
class AgentService {
    static async createAgent(agentData: AgentType) {
        AgentSchema.parse(agentData);
        try {
            const agent = new Agent(agentData);
            await agent.save();
            return agent;
        } catch (error: any) {
            throw new Error(`Failed to create agent: ${error.message}`);
        }
    }

    static async deleteAgent(id: string) {
        try {
            const deletedAgent = await Agent.findByIdAndDelete(id);
            if (!deletedAgent) {
                throw new Error(`Agent with ID ${id} not found.`);
            }
            return deletedAgent;
        } catch (error: any) {
            throw new Error(`Failed to delete agent: ${error.message}`);
        }
    }

    static async updateAgent(id: string, updateData: Partial<AgentType>) {
        AgentSchema.partial().parse(updateData);
        try {
            const updatedAgent = await Agent.findByIdAndUpdate(id, updateData, {
                new: true,
            });
            if (!updatedAgent) {
                throw new Error(`Agent with ID ${id} not found.`);
            }
            // Clear cache
            redis.del(agentKey(id));
            redis.del(agentKey('all'));
            return updatedAgent;
        } catch (error: any) {
            throw new ApiError(`Failed to update agent: ${error.message}`, 404);
        }
    }

    static async getAgentById(id: string): Promise<AgentType> {
        try {
            const cacheKey = agentKey(id);
            const cachedAgent = await redis.cget(cacheKey).catch((error) => null);
            if (cachedAgent) {
                return JSON.parse(cachedAgent);
            }
            const agent = await Agent.findById(id);
            if (!agent) {
                throw new Error(`Agent with ID ${id} not found.`);
            }
            redis.cset(cacheKey, JSON.stringify(agent));
            return agent;
        } catch (error: any) {
            throw new ApiError(`Failed to retrieve agent: ${error.message}`, 404);
        }
    }

    static async getAgents(): Promise<AgentType[]> {
        try {
            const cacheKey = agentKey('all');
            const cachedAgents = await redis.cget(cacheKey).catch((error) => null);
            if (cachedAgents) {
                return JSON.parse(cachedAgents);
            }
            const agents = await Agent.find();
            redis.cset(cacheKey, JSON.stringify(agents));
            return agents;
        } catch (error: any) {
            throw new Error(`Failed to retrieve agents: ${error.message}`);
        }
    }



    static async addDocInAgent(id: string, newLink: any
        // :  Partial<AgentType>
    ) {
        // AgentSchema.partial().parse(newLink);
        try {
            redis.del(agentKey(id));
            redis.del(agentKey('all'));
            const updatedAgent = await Agent.findByIdAndUpdate(
                id,
                {
                    $push: { docLinks: newLink }
                },
                { new: true }
            );
            if (!updatedAgent) {
                throw new Error(`Agent with ID ${id} not found.`);
            }
            return updatedAgent;
        } catch (error: any) {
            throw new Error(`Failed to update agent: ${error.message}`);
        }
    }
}

export default AgentService;
