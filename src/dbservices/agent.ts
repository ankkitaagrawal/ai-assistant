import { Agent } from '../models/agent';
import { Agent as AgentType, AgentSchema, DiaryPage } from '../type/agent';
import redis from '../config/redis';
import { ApiError } from '../error/api-error';
import { getDefaultPicture } from '../service/utility';
import { ObjectId } from 'mongodb';

const agentKey = (agentId: string) => `assistant:agent:${agentId}`;
class AgentService {
    static async createAgent(agentData: AgentType) {
        AgentSchema.parse(agentData);
        redis.del(agentKey('all'));
        try {
            agentData.logo = agentData.logo || getDefaultPicture(agentData.name);
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
            const agent = await Agent.findById(id).populate("editors", "name");
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
            const agents = await Agent.find().populate('editors', 'name');
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

    static async addEditor(id: string, editor: string) {
        try {
            redis.del(agentKey(id));
            redis.del(agentKey('all'));
            const updatedAgent = await Agent.findByIdAndUpdate(
                id,
                {
                    $addToSet: { editors: editor }
                },
                { new: true }
            ).populate('editors', 'name');
            if (!updatedAgent) {
                throw new Error(`Agent with ID ${id} not found.`);
            }
            return updatedAgent;
        } catch (error: any) {
            throw new Error(`Failed to update agent: ${error.message}`);
        }
    }

    static async removeEditor(id: string, editor: string) {
        try {
            redis.del(agentKey(id));
            redis.del(agentKey('all'));
            const updatedAgent = await Agent.findByIdAndUpdate(
                id,
                {
                    $pull: { editors: editor }
                },
                { new: true }
            ).populate('editors', 'name');
            if (!updatedAgent) {
                throw new Error(`Agent with ID ${id} not found.`);
            }
            return updatedAgent;
        } catch (error: any) {
            throw new Error(`Failed to update agent: ${error.message}`);
        }
    }

    static async updateAgentDiary(id: string, diary: DiaryPage) {
        try {
            if (!diary.id && !diary.heading) throw new Error("New page can't be created without heading");
            if (!diary?.content) throw new Error("Content is required, page can't be empty");
            redis.del(agentKey(id));
            redis.del(agentKey('all'));
            const pageId = diary.id || new ObjectId();
            const diaryKey = `diary.${pageId}`;
            const updatedDiary = await Agent.findByIdAndUpdate(
                id,
                {
                    $set: {
                        [`${diaryKey}.content`]: diary.content,
                        [`${diaryKey}.heading`]: diary.heading,
                        [`${diaryKey}.privacy`]: diary.privacy,
                    },

                },
                { new: true }
            );
            return updatedDiary;
        } catch (error: any) {
            throw new Error(`Failed to update agent diary: ${error.message}`);
        }
    }
}

export default AgentService;
