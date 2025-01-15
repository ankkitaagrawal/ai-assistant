export type Tool =
  {
    type: string;
    name: string;
    description: string;
    properties: any;
    required: any;
  }



const specificTools = {
  "sendmessage":
  {
    "type": "function",
    "name": "scrixpv2O2yR",
    "description": "Name: send message to user, Description: you have power to send message to users or user",
    "properties": {
      "agentId": {
        "description": "",
        "type": "string",
        "enum": [
        ],
        "required_params": [
        ],
        "parameter": {
        }
      },
      "ownerThreadId": {
        "description": "owner thread id pick from enum",
        "type": "string",
        "enum": [
        ],
        "required_params": [

        ],
        "parameter": {

        }
      },
      "messages_and_threads": {
        "type": "array",
        "enum": [ ],
        "description": " contains the threadId and messages.",
        "items": {
          "type": "object",
          "properties": {
            "threadId": {
              "type": "string",
              "description": "thread id provided in the thread context "
            },
            "message": {
              "type": "string",
              "description": "message you want to send to user"
            }
          },
          "required": [
            "threadId",
            "message"
          ],
        }
      }
    },
    "required": [
      "agentId",
      "messages_and_threads",
      "ownerThreadId"
    ]
  },
  "pingowner": {
    "type": "function",
    "name": "scri5OfHguCK",
    "description": "Name: ping owner, Description: you have power to send message to the owner of the assistant in case you are not able to anser the query !",
    "properties": {
      "userId": {
        "description": "",
        "type": "string",
        "enum": [
        ],
        "required_params": [

        ],
        "parameter": {

        }
      },
      "agentId": {
        "description": "",
        "type": "string",
        "enum": [

        ],
        "required_params": [

        ],
        "parameter": {

        }
      },
      "message": {
        "description": "",
        "type": "string",
        "enum": [

        ],
        "required_params": [

        ],
        "parameter": {

        }
      },
      "threadId": {
        "description": "",
        "type": "string",
        "enum": [
        ],
        "required_params": [

        ],
        "parameter": {

        }
      }
    },
    "required": [
      "userId",
      "agentId",
      "message",
      "threadId"
    ]
  }
}

export type ToolName = keyof typeof specificTools;

export function getTool(toolName: ToolName, dynamicEnums?: any): Tool {
  {
    const tool = { ...specificTools[toolName] }; // Clone the tool to avoid mutating the original
    if (!tool) {
      throw new Error(`Tool "${toolName}" not found in the predefined tools.`);
    }
    if (dynamicEnums) {
      switch (toolName) {
        case "sendmessage":
          if (tool.properties.agentId && dynamicEnums.agentId) {
            (tool.properties.agentId.enum as Array<string>)= [dynamicEnums.agentId];
          }
          if ((tool.properties as any).ownerThreadId && dynamicEnums.threadId) {
            (tool.properties as any).ownerThreadId.enum= [dynamicEnums.threadId];
          }
          break;
        case "pingowner":
          if ((tool.properties as any).userId && dynamicEnums.userId) {
            (tool.properties as any).userId.enum= [dynamicEnums.userId];
          }
          if ((tool.properties as any).threadId && dynamicEnums.threadId) {
            (tool.properties as any).threadId.enum= [dynamicEnums.threadId];
          }
          if ((tool.properties as any).agentId && dynamicEnums.agentId) {
            (tool.properties as any).agentId.enum= [dynamicEnums.agentId];
          }
          break;
        // Add cases for other tools as needed
        default:
          break;
      }
    }

    return tool;
  }
}
