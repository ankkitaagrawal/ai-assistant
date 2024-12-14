import { Agent } from '../models/agent';
import { Agent as AgentType, AgentSchema } from '../type/agent';

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
            return updatedAgent;
        } catch (error: any) {
            throw new Error(`Failed to update agent: ${error.message}`);
        }
    }

    static async getAgentById(id: string): Promise<AgentType> {
        try {
            const agent = await Agent.findById(id);
            if (!agent) {
                throw new Error(`Agent with ID ${id} not found.`);
            }
            return agent;
        } catch (error: any) {
            throw new Error(`Failed to retrieve agent: ${error.message}`);
        }
    }
    static async addDocInAgent(id: string, newLink :any
        // :  Partial<AgentType>
    ) {
        // AgentSchema.partial().parse(newLink);
        try {
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
