export type Tool = 
{
  type: string;
  function: {
    name: string;
    description: string;
    parameters:  any;
  };
}




const specificTools = {
  "sendmessage": {
    "type": "function",
    "function": {
      "name": "scrixpv2O2yR",
      "description": "Name: send message to user, Description: you have power to  send  message to users or user",
      "parameters": {
        "type": "object",
        "properties": {
          "agentId": {
            "description": "",
            "type": "string",
            "enum": [],
            "required_params": [],
            "parameter": {}
          },
          "messages_and_threads": {
            "type": "array",
            "enum": [],
            "description": " contains the threadId and messages.",
            "items": {
              "type": "object",
              "properties": {
                "threadId": {
                  "type": "string",
                  "description": "thread id "
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
              "message": {
                "description": ""
              }
            }
          }
        },
        "required_params": [
          "agentId",
          "messages"
        ],
        "additionalProperties": false
      }
    }
  },
  "pingowner": {
    "type": "function",
    "function": {
      "name": "scri5OfHguCK",
      "description": "Name: ping owner, Description: you have power to send message to the owner of the assistant in case you are not able to anser the query !",
      "parameters": {
        "type": "object",
        "properties": {
          "userId": {
            "description": "",
            "type": "string",
            "enum": [],
            "required_params": [],
            "parameter": {}
          },
          "agentId": {
            "description": "",
            "type": "string",
            "enum": [],
            "required_params": [],
            "parameter": {}
          },
          "message": {
            "description": "",
            "type": "string",
            "enum": [],
            "required_params": [],
            "parameter": {}
          },
          "threadId": {
            "description": "",
            "type": "string",
            "enum": [],
            "required_params": [],
            "parameter": {}
          }
        },
        "required_params": [
          "userId",
          "agentId",
          "message",
          "threadId"
        ],
        "additionalProperties": false
      }
    }
  }
}

export type ToolName = keyof typeof specificTools;

export function getTool(toolName: ToolName): Tool {
  const tool = specificTools[toolName];
  return tool;
}

