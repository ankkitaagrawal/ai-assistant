

import axios, { AxiosResponse } from "axios"

export const sendMessage = async (usermessage: string, thread_id?: string): Promise<AxiosResponse<any> | null> => {
  const response: AxiosResponse<any> = await axios.post(
    'https://routes.msg91.com/api/proxy/1258584/29gjrmh24/api/v2/model/chat/completion',
    {
      user: usermessage,
      variables: {user_id : thread_id},
      bridge_id: "6733097358507028fd81de16",
      thread_id: thread_id,
      RTLayer: false,
      is_text:true
    },
    {
      headers: {
        pauthkey: process.env.AI_MIDDLEWARE_AUTH_KEY as string,
      },
    }
  );
  return response.data?.response?.data?.content;

};

export const getPreviousMessage = async (thread_id?: string): Promise<AxiosResponse<any> | null> => {
  const response: AxiosResponse<any> = await axios.get(
    `https://routes.msg91.com/api/proxy/1258584/32nghul25/api/v1/config/threads/${thread_id}/6733097358507028fd81de16`,
    {
      headers: {
        pauthkey: process.env.AI_MIDDLEWARE_AUTH_KEY as string,
        'Content-Type': 'application/json',
      },
    }
  );
  return response?.data;

};
export const createMessage = async (thread_id: string,  message :string): Promise<AxiosResponse<any> | null> => {
  const response: AxiosResponse<any> = await axios.post(
    `https://proxy.viasocket.com/proxy/api/1258584/32nghul25/api/v1/config/threads/${thread_id}/6733097358507028fd81de16`,
    {
      "message":message
    },
    {
      headers: {
        pauthkey: process.env.AI_MIDDLEWARE_AUTH_KEY as string,
        'Content-Type': 'application/json',
      },
    }
  );
  return response?.data;

};