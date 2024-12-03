
import { getPreviousMessage, sendMessage } from "../utility/aimiddleware";
import { Response, Request } from 'express';



export const sendMessageToAi = async (req: Request, res: Response) => {
    try {
        const { message } = req.body
        const userId = req.tokenData?.user?.id?.toString()  ;
        const data = res.locals?.userdata;
      const appContext = data.appList.map((app :any)=> {
        return {
            appId: app.pluginData._id,
            appName: app.pluginData.appName,
            description: app.pluginData.description
          };
        });
        const response = await sendMessage(message, 
            { user_id :  userId ,
            system_prompt : "behave like a assisstatnt " ,
            context : JSON.stringify(appContext) ,
            channeluserId : data.channelId
            }
             ,userId );
        console.log(response)
        return res.status(200).json({ success: true, data: { message: response } })
    } catch (err: any) {

        console.log(err.response)
        res.status(400).json({
            message: 'Some Error on  Server',
            data: { errMessage: err?.message },
        });


    }
};


export const getMessages = async (req: Request, res: Response) => {
    try {

        const userId = req.tokenData?.user.id
        const response = await getPreviousMessage(userId?.toString());
        return res.status(200).json({ success: true, data: { chats: response } })
    } catch (err: any) {
        console.log(err.response)
        // res.status(400).json({ message: 'Some Error on function Server', data: { errMessage: err?.message }});
        res.status(400).json({
            message: 'Some Error on function Server',
            data: { errMessage: err?.message },
        });


    }
};